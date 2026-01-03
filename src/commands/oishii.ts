import type { Command } from '../types.js';

export const command: Command = {
    name: 'oishii',
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
};