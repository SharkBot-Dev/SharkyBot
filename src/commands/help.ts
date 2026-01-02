import type { Command } from '../types.js';

export const command: Command = {
    name: 'help',
    execute: async (note, args, stream, cli) => {
        await cli.request('notes/create', {
            replyId: note.id,
            text: `このBotの使い方は以下にあります。\nhttps://github.com/SharkBot-Dev/SharkyBot`
        });
    }
};