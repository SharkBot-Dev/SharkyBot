import * as Misskey from "misskey-js";
import { config } from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { Command } from "./types.js";
import WebSocket from "ws";
import { connect as connectMongo } from "./temp/mongo.js";
import express from "express";
import { createRouter } from "./web/index.js";

config();

const origin = process.env.MAIN_URL as string;
const token = process.env.MAIN_TOKEN as string;

const cli = new Misskey.api.APIClient({ origin, credential: token });
const commands = new Map<string, Command>();

let stream: Misskey.Stream | null = null;

async function init() {
    await connectMongo();
    console.log("MongoDBに接続しました。");

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const commandsPath = path.join(__dirname, "commands");
    const files = await fs.readdir(commandsPath);
    const jsFiles = files.filter(f => f.endsWith(".js"));

    for (const file of jsFiles) {
        const fileUrl = pathToFileURL(path.join(commandsPath, file)).href;
        const module = await import(fileUrl);
        const cmd: Command = module.command;
        commands.set(cmd.name, cmd);
    }

    console.log(`${commands.size}個のコマンドをロードしました。`);

    createStream();
}

let reconnecting = false;

function createStream() {
    if (reconnecting) return;
    reconnecting = true;

    console.log("MisskeyStreamに接続しています・・");

    stream?.close?.();

    stream = new Misskey.Stream(origin, { token }, { WebSocket });

    stream.on("_connected_", () => {
        console.log("MisskeyStreamに接続しました。");
    });

    stream.on("_disconnected_", () => {
        console.log("MisskeyStreamから切断されました・・再接続しています・・");
    });

    const mainChannel = stream.useChannel("main");

    const COOLDOWN_TIME = 5000;
    const cooldowns = new Map<string, number>();

    mainChannel.on("notification", async (notification) => {
        if (notification.type !== "mention") return;

        const note = notification.note;
        if (!note.text || note.user.isBot) return;

        const userId = note.userId;
        const now = Date.now();
        const lastRun = cooldowns.get(userId) || 0;
        if (now - lastRun < COOLDOWN_TIME) return;

        const cleanText = note.text
            .replace(/@[\w.-]+(?:@[\w.-]+)?\s*/g, "")
            .trim();

        if (!cleanText.startsWith("/")) return;

        const args = cleanText.slice(1).split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = commands.get(commandName);
        if (!command) return;

        try {
            cooldowns.set(userId, now);
            await command.execute(note, args, stream!, cli);
            console.log(`Command success: ${commandName}`);
        } catch (err) {
            console.error("Command error:", err);
        }
    });
}

async function startWeb() {
    const app = express();

    const router = await createRouter();
    app.use(router);

    app.listen(5010, () => {
        console.log("Webサーバーを5010ポートに立ち上げました。");
    });
}

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

(async () => {
  await init();
  startWeb();
})();