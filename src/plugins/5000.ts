import Plugin from "./../plugin.js"

export default class _5000 extends Plugin {
    constructor() {
        super("5000");
    }

    async init() {
        this.addCommand({
            name: "5000",
            execute: async (note, args, stream, cli) => {
                if (args.length !< 2) return;

                if (!args[0]) return;
                if (!args[1]) return;

                const image = await fetch(`https://gsapi.cbrx.io/image?top=${encodeURI(args[0])}&bottom=${encodeURI(args[1])}&type=png`)
                    .then(res=>res.blob());

                const file = await cli.request("drive/files/create", {
                    file: new Blob([image], { type: 'image/png' }),
                    name: `5000_${Date.now()}.png`,
                    isSensitive: true
                });

                await cli.request('notes/create', {
                    text: "5000兆円ほしい！",
                    fileIds: [file.id],
                    replyId: note.id
                });
            }
        })

        this.addCommand({
            name: "oishii",
            execute: async (note, args, stream, cli) => {
                if (args.length !< 1) return;

                const image = await fetch(`https://gsapi.cbrx.io/image?top=${encodeURI(args.join(" "))}&bottom=${encodeURI("おいしい！")}&type=png`)
                    .then(res=>res.blob());

                const file = await cli.request("drive/files/create", {
                    file: new Blob([image], { type: 'image/png' }),
                    name: `oishii_${Date.now()}.png`,
                    isSensitive: true
                });

                await cli.request('notes/create', {
                    text: "おいしい！",
                    fileIds: [file.id],
                    replyId: note.id
                });
            }
        })
    }
}