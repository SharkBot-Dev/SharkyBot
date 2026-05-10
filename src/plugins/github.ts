import Plugin from "./../plugin.js"

export default class Github extends Plugin {
    constructor() {
        super("github");
    }

    async init() {
        this.addCommand({
            name: "github",
            execute: async (note, args, stream, cli) => {
                const query = args[0];

                if (!query) {
                    return;
                }

                const github_api_url = `https://api.github.com/search/repositories?q=${encodeURI(query)}`;

                const headers = {"User-Agent": "DiscordBot/1.0 (https://example.com)"};

                try {
                    const response = await fetch(github_api_url, {
                        headers: headers
                    });
                    if (!response.ok) {
                        return;
                    };

                    const data = await response.json()

                    try {
                        const items = data.items;

                        if (items == undefined || items.length == 0) {
                            await cli.request('notes/create', {
                                replyId: note.id,
                                text: "Githubレポジトリが見つかりませんでした。"
                            });
                            return;
                        };
                        
                        await cli.request('notes/create', {
                            replyId: note.id,
                            text: items[0].html_url
                        });
                    } catch {
                        return;
                    }
                } catch {
                    return;
                }
            }
        })
    }
}