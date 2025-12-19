import type { Command } from '../types.js';

export const command: Command = {
    name: 'user',
    execute: async (note, args, stream, cli) => {
        if (!note.text) return;

        try {

            const query = args[0];

            if (!query) {
                return;
            }

            const users = await cli.request('users/search', {
                query: query,
                limit: 1
            });

            if (users.length === 0) {
                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `見つかるユーザーはいませんでした。`
                });
                return;
            }

            const target = users[0];

            if (!target) return;

            const infoText = [
                `🔍 **${target.name || target.username}** の情報が見つかりました`,
                `ID: \`${target.id}\``,
                `ユーザー名: ${target.username}`,
                `Botか: ${target.isBot}`
            ].join('\n');

            await cli.request('notes/create', {
                replyId: note.id,
                text: infoText
            });

        } catch (error) {
            console.error(error);
            return;
        }
    }
};