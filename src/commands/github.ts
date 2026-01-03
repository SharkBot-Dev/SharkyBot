import type { Command } from '../types.js';

export const command: Command = {
    name: 'github',
    execute: async (note, args, stream, cli) => {
        await cli.request('notes/create', {
            replyId: note.id,
            text: `以下からアクセスできます。\nhttps://misskey.shb.red/redirect/github`
        });
    }
};