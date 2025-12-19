import type { Command } from '../types.js';

export const command: Command = {
    name: 'ping',
    execute: async (note, args, stream, cli) => {
        await cli.request('notes/create', {
            replyId: note.id,
            text: `🏓Pong!`
        });
    }
};