import type { Command } from '../types.js';

export const command: Command = {
    name: 'wiki',
    execute: async (note, args, stream, cli) => {
        const query = args[0];

        if (!query) {
            return;
        }

        const wikipedia_api_url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURI(query)}`;

        const headers = {"User-Agent": "DiscordBot/1.0 (https://example.com)"};

        try {
            const response = await fetch(wikipedia_api_url, {
                headers: headers
            });
            if (!response.ok) {
                return;
            };

            const data = await response.json()

            try {
                const page_url = data.content_urls.desktop.page;

                if (page_url == undefined || page_url == null) {
                    await cli.request('notes/create', {
                        replyId: note.id,
                        text: "Wikipedia記事が見つかりませんでした。"
                    });
                    return;
                };
                
                await cli.request('notes/create', {
                    replyId: note.id,
                    text: page_url
                });
            } catch {
                return;
            }
        } catch {
            return;
        }
    }
};