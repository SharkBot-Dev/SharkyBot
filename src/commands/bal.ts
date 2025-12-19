import type { Command } from '../types.js';
import { mongo } from "./../temp/mongo.js";

export const command: Command = {
    name: 'bal',
    execute: async (note, args, stream, cli) => {
        const db = mongo.db("MisskeyBot");
        const collection = db.collection('Economy');

        const money = await collection.findOne({
            "userid": note.userId
        })

        if (!money) {
            await cli.request('notes/create', {
                replyId: note.id,
                text: `現在の残高\n手持ち: 0コイン`
            });
            return;
        }

        await cli.request('notes/create', {
            replyId: note.id,
            text: `現在の残高\n手持ち: ${money.money}コイン`
        });
    }
};