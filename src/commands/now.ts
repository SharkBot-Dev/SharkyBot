import type { Command } from '../types.js';
import data_utils from "date-utils";

export const command: Command = {
    name: 'now',
    execute: async (note, args, stream, cli) => {
        var dt = new Date();

        await cli.request('notes/create', {
            replyId: note.id,
            text: `現在時刻: ${dt.toLocaleString("ja")}`
        });
    }
};