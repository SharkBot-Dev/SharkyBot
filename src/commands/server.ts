import type { Command } from '../types.js';

export const command: Command = {
    name: 'server',
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
};