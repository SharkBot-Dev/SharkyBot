import Plugin from "./../plugin.js"

export default class Omikuji extends Plugin {
    constructor() {
        super("omikuji");
    }

    omikujis: string[] = [
        '大吉',
        '吉',
        '中吉',
        '小吉',
        '凶',
        '大凶',
    ];

    async init() {
        this.addCommand({
            name: "omikuji",
            execute: async (note, args, stream, cli) => {
                const len = this.omikujis.length;
                const randomIndex = Math.floor(Math.random() * len);
                const randomItem = this.omikujis[randomIndex];

                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `おみくじを引きました。\n結果は...?\n${randomItem}でした!`
                });
            }
        })
    }
}