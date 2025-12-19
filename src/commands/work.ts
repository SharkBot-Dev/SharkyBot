import type { Command } from '../types.js';
import { mongo } from "./../temp/mongo.js";

export const command: Command = {
    name: 'work',
    execute: async (note, args, stream, cli) => {
        const cooldownMs = 20 * 60 * 1000;
        const now = Date.now();

        const db = mongo.db("MisskeyBot");
        const collection = db.collection('Economy');

        const userData = await collection.findOne({ "userid": note.userId });

        if (userData && userData.lastWork) {
            const nextAvailable = userData.lastWork + cooldownMs;
            if (now < nextAvailable) {
                const timeLeft = Math.ceil((nextAvailable - now) / 1000);
                
                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `まだ疲れています。あと ${timeLeft} 秒待ってください。`
                });
                return;
            }
        }

        const money = Math.floor(Math.random() * 1500) + 1;

        await collection.updateOne(
            { "userid": note.userId },
            { 
                $inc: { "money": money },
                $set: { "lastWork": now } 
            },
            { upsert: true }
        );

        await cli.request('notes/create', {
            replyId: note.id,
            text: `仮想のお金を稼ぎました。\n${money}コインです。\n手持ちに追加されました。`
        });
    }
};