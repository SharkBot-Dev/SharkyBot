import { mongo } from "../temp/mongo.js";
import Plugin from "./../plugin.js"

export default class Economy extends Plugin {
    constructor() {
        super("economy");
    }

    async init() {
        this.addCommand({
            name: "work",
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
        })

        this.addCommand({
            name: "bal",
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
        })

        this.addCommand({
            name: "balance",
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
        })
    }
}