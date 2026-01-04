import Plugin from "./../plugin.js"

export default class Info extends Plugin {
    constructor() {
        super("info");
    }

    async init() {
        this.addCommand({
            name: "server",
            execute: async (note, args, stream, cli) => {
                if (!note.text) return;

                try {
                    const info = await cli.request("server-info", {});

                    const toGB = (bytes: number) => (bytes / (1024 ** 3)).toFixed(2);

                    const fsUsed = toGB(info.fs.used);
                    const fsTotal = toGB(info.fs.total);
                    const usagePercent = ((info.fs.used / info.fs.total) * 100).toFixed(1);

                    await cli.request('notes/create', {
                        replyId: note.id,
                        text: `サーバー情報\nCPU: ${info.cpu.model} (${info.cpu.cores} Cores)\nMemory: ${toGB(info.mem.total)} GB\nStorage: ${fsUsed}GB / ${fsTotal}GB (${usagePercent}% used)\nMachine ID: ${info.machine}`
                    });
                } catch {
                    return;
                }
            }
        })

        this.addCommand({
            name: "user",
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
        })

        this.addCommand({
            name: "wiki",
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
        })

        this.addCommand({
            name: "now",
            execute: async (note, args, stream, cli) => {
                var dt = new Date();

                await cli.request('notes/create', {
                    replyId: note.id,
                    text: `現在時刻: ${dt.toLocaleString("ja")}`
                });
            }
        })
    }
}