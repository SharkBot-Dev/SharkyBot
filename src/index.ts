import * as Misskey from "misskey-js";
import { config } from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import WebSocket from "ws";
import express from "express";

import Plugin from "./plugin.js";
import { connect as connectMongo } from "./temp/mongo.js";
import { createRouter } from "./web/index.js";

config();

const origin = process.env.MAIN_URL as string;
const token = process.env.MAIN_TOKEN as string;

const cli = new Misskey.api.APIClient({ origin, credential: token });

const plugins: Plugin[] = [];
const commands = new Map<string, any>();

let stream: Misskey.Stream | null = null;

async function init() {
    await connectMongo();
    console.log("MongoDBに接続しました。");

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pluginsPath = path.join(__dirname, "plugins");
    const files = await fs.readdir(pluginsPath);
    const jsFiles = files.filter(f => f.endsWith(".js"));

    for (const file of jsFiles) {
        const fileUrl = pathToFileURL(path.join(pluginsPath, file)).href;
        const module = await import(fileUrl);

        if (module.default && typeof module.default === 'function') {
            const pluginInstance: Plugin = new module.default();
            
            await pluginInstance.init();
            console.log(`プラグイン ${pluginInstance.name.toLowerCase()}をロードしました。`)
            
            pluginInstance.commands.forEach(cmd => {
                commands.set(cmd.name.toLowerCase(), { 
                    execute: cmd.execute, 
                    plugin: pluginInstance 
                });
            });

            plugins.push(pluginInstance);
        }
    }

    console.log(`${plugins.length}個のプラグインをロードしました。`);
    createStream();
}

function createStream() {
    console.log("MisskeyStreamに接続しています・・");
    stream = new Misskey.Stream(origin, { token }, { WebSocket });

    stream.on("_connected_", () => {
        console.log("MisskeyStreamに接続しました。");
        plugins.forEach(p => p.emit("ready"));
    });

    const mainChannel = stream.useChannel("main");
    const COOLDOWN_TIME = 5000;
    const cooldowns = new Map<string, number>();

    mainChannel.on("notification", async (notification) => {
        plugins.forEach(p => p.emit("notification", notification));

        if (notification.type !== "mention") return;

        const note = notification.note;
        if (!note.text || note.user.isBot) return;

        const userId = note.userId;
        const now = Date.now();
        if (now - (cooldowns.get(userId) || 0) < COOLDOWN_TIME) return;

        const cleanText = note.text.replace(/@[\w.-]+(?:@[\w.-]+)?\s*/g, "").trim();
        if (!cleanText.startsWith("/")) return;

        const args = cleanText.slice(1).split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        
        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            try {
                cooldowns.set(userId, now);
                await cmd.execute(note, args, stream!, cli);
                console.log(`Command success: ${commandName} (via ${cmd.plugin.name})`);
            } catch (err) {
                console.error(`Command error [${commandName}]:`, err);
            }
        }
    });
}

async function startWeb() {
    const app = express();
    const router = await createRouter();
    app.use(router);
    app.get("/", (req, res) => res.send("Misskey Bot Server Running."));
    app.listen(5010, () => console.log("Webサーバー起動: 5010"));
}

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

(async () => {
  await init();
  startWeb();
})();