import type { Command } from '../types.js';
import { load } from "cheerio";

export const command: Command = {
    name: 'news',
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
};