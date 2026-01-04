import Plugin from "./../plugin.js"

export default class Roll extends Plugin {
    constructor() {
        super("roll");
    }

    async init() {
        this.addCommand({
            name: "roll",
            execute: async (note, args, stream, cli) => {
                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `🎲: ${Math.floor(Math.random() * 6) + 1}`
                });
            }
        })
    }
}