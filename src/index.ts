import * as Misskey from 'misskey-js';
import { config } from "dotenv";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { Command } from "./types.js";
import WebSocket from 'ws';
import { connect } from "./temp/mongo.js"

config();

const origin = process.env.URL as string;
const token = process.env.TOKEN as string;

const cli = new Misskey.api.APIClient({ origin, credential: token });
const stream = new Misskey.Stream(origin, { token }, {
    WebSocket: WebSocket
});
const commands = new Map<string, Command>();

async function init() {
    connect();
    console.log("MongoDBに接続しました。")

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const commandsPath = path.join(__dirname, 'commands');
    const files = await fs.readdir(commandsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    for (const file of jsFiles) {
        const fileUrl = pathToFileURL(path.join(commandsPath, file)).href;
        const module = await import(fileUrl);
        const cmd: Command = module.command;
        commands.set(cmd.name, cmd);
    }
    console.log(`${commands.size}個のコマンドをロードしました。`);

    const mainChannel = stream.useChannel("main");

    const COOLDOWN_TIME = 5000; 
    const cooldowns = new Map<string, number>();

    mainChannel.on("notification", async (notification) => {
        if (notification.type !== "mention") {
            return;
        }
        const note = notification.note;

        if (!note.text || note.user.isBot) return;

        const userId = note.userId;
        const now = Date.now();
        const lastRun = cooldowns.get(userId) || 0;
        if (now - lastRun < COOLDOWN_TIME) return;

        let cleanText = note.text.replace(/@[\w.-]+(?:@[\w.-]+)?\s*/g, '').trim();

        if (cleanText.startsWith('/')) {
            const args = cleanText.slice(1).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();

            if (commandName && commands.has(commandName)) {
                try {
                    cooldowns.set(userId, now);
                    const command = commands.get(commandName);
                    
                    await command?.execute(note, args, stream, cli);

                    console.log(`Command success: ${commandName}`);
                } catch (error) {
                    console.error(`Error:`, error);
                }
            }
        }
    });

    setInterval(() => {
        const now = Date.now();
        for (const [userId, lastRun] of cooldowns.entries()) {
            if (now - lastRun > COOLDOWN_TIME) {
                cooldowns.delete(userId);
            }
        }
    }, 60000);

    console.log("ボットがオンラインになりました。");
}

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

init();