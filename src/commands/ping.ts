import type { Command } from '../types.js';

export const command: Command = {
    name: 'ping',
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
};