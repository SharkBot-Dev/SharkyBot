import type { Command } from '../types.js';

export const omikujis = [
	'大吉',
	'吉',
	'中吉',
	'小吉',
	'凶',
	'大凶',
];

export const command: Command = {
    name: 'omikuji',
    execute: async (note, args, stream, cli) => {
        const len = omikujis.length;
        const randomIndex = Math.floor(Math.random() * len);
        const randomItem = omikujis[randomIndex];

        await cli.request('notes/create', {
            replyId: note.id,
            text: `おみくじを引きました。\n結果は...?\n${randomItem}でした!`
        });
    }
};