import Plugin from "./../plugin.js"
import { load } from "cheerio";

export default class News extends Plugin {
    constructor() {
        super("news");
    }

    async init() {
        this.addCommand({
            name: "news",
            execute: async (note, args, stream, cli) => {
                const response = await fetch("https://mainichi.jp/");
                const html = await response.text();

                const $ = load(html);

                const url = $(".toppickup").first().find("a").first().attr("href");

                await cli.request('notes/create', {
                    text: `https:${url}`,
                    replyId: note.id
                });
            }
        })
    }
}