import Plugin from "./../plugin.js"

export default class _5000 extends Plugin {
    constructor() {
        super("Make it a Quote");
    }

    async init() {
        this.addCommand({
            name: "miq",
            execute: async (note, args, stream, cli) => {
                if (!note.reply) {
                    await cli.request('notes/create', {
                        replyId: note.id,
                        text: `ノートに返信してください。`
                    });

                    return;
                };

                if (!note.reply.text || !note.reply.user.name) return;

                const image = await fetch(`https://miq.sharkbot.xyz/?avatar_url=${encodeURI(note.reply.user.avatarUrl)}&text=${encodeURI(note.reply.text)}&author=${encodeURI(note.reply.user.name as string)}`)
                    .then(res=>res.blob());

                const file = await cli.request("drive/files/create", {
                    file: new Blob([image], { type: 'image/png' }),
                    name: `miq_${Date.now()}.png`,
                    isSensitive: true
                });

                await cli.request('notes/create', {
                    text: "Make it a Quoteを生成しました。",
                    fileIds: [file.id],
                    replyId: note.id
                });
            }
        })
    }
}