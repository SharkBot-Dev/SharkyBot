import Plugin from "./../plugin.js"

export default class Help extends Plugin {
    constructor() {
        super("help");
    }

    async init() {
        this.addCommand({
            name: "help",
            execute: async (note, args, stream, cli) => {
                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `このBotの使い方は以下にあります。\nhttps://github.com/SharkBot-Dev/SharkyBot`
                });
            }
        })

        this.addCommand({
            name: "ping",
            execute: async (note, args, stream, cli) => {
                // Ping測定
                const start = Date.now();
                await cli.request("ping", {});
                const end = Date.now();

                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `🏓Pong! ${end - start}ms`
                });
            }
        })

        this.addCommand({
            name: "github",
            execute: async (note, args, stream, cli) => {
                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `以下からアクセスできます。\nhttps://misskey.shb.red/redirect/github`
                });
            }
        })

        this.addCommand({
            name: "good",
            execute: async (note, args, stream, cli) => {
                await cli.request('notes/reactions/create', {
                    noteId: note.id,
                    reaction: '👍'
                });
            }
        })
    }
}