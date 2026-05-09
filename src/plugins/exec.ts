import Plugin from "./../plugin.js"
import { load } from "cheerio";

export default class Exec extends Plugin {
    constructor() {
        super("exec");
    }

    async init() {
        this.addCommand({
            name: "exec",
            execute: async (note, args, stream, cli) => {
                if (!args[0]) {
                    await cli.request('notes/create', {
                        text: `引数が必要です。`,
                        replyId: note.id
                    });
                    return;
                }

                const script = args.join(" ");

                const headers = {
                    "accept": "*/*",
                    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
                    "authorization": "Bearer undefined",
                    "content-type": "application/json",
                    "origin": "https://onecompiler.com",
                    "priority": "u=1, i",
                    "referer": "https://onecompiler.com/nodejs",
                    "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                };

                const jsonData = {
                    "name": "NodeJS",
                    "title": "NodeJS Hello World",
                    "version": "12.13",
                    "mode": "javascript",
                    "description": null,
                    "extension": "js",
                    "languageType": "programming",
                    "active": true, 
                    "properties": {
                        "language": "nodejs",
                        "docs": true,
                        "tutorials": true,
                        "cheatsheets": true,
                        "filesEditable": true,
                        "filesDeletable": true,
                        "files": [
                        {
                            "name": "index.js",
                            "content": script,
                        },
                        ],
                        "newFileOptions": [
                        {
                            "helpText": "New JS file",
                            "name": "script${i}.js",
                            "content": "/**\n *  In main file\n *  let script${i} = require('./script${i}');\n *  console.log(script${i}.sum(1, 2));\n */\n\nfunction sum(a, b) {\n    return a + b;\n}\n\nmodule.exports = { sum };",
                        },
                        {
                            "helpText": "Add Dependencies",
                            "name": "package.json",
                            "content": '{\n  "name": "main_app",\n  "version": "1.0.0",\n  "description": "",\n  "main": "HelloWorld.js",\n  "dependencies": {\n    "lodash": "^4.17.21"\n  }\n}',
                        },
                        ],
                    },
                    "visibility": "public",
                };

                try {
                    const response = await fetch("https://onecompiler.com/api/code/exec", {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(jsonData),
                    });

                    const data = await response.json();
                    if (data.stderr) {
                        await cli.request('notes/create', {
                            text: `${data.stderr}`,
                            replyId: note.id
                        });
                        return;
                    }
                    await cli.request('notes/create', {
                        text: `${data.stdout}`,
                        replyId: note.id
                    });
                } catch (error) {}
            }
        })
    }
}