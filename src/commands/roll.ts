import type { Command } from '../types.js';

export const command: Command = {
    name: 'roll',
    execute: async (note, args, stream, cli) => {
        await cli.request('notes/create', {
            replyId: note.id,
            text: `🎲: ${Math.floor(Math.random() * 6) + 1}`
        });
    }
};