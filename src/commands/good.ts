import type { Command } from '../types.js';

export const command: Command = {
    name: 'good',
    execute: async (note, args, stream, cli) => {
        await cli.request('notes/reactions/create', {
            noteId: note.id,
            reaction: '👍'
        });
    }
};