import Plugin from "./../plugin.js"

export default class Roll extends Plugin {
    constructor() {
        super("roll");
    }

    private rollDice(expression: string): string {
        const match = expression.match(/(\d+)d(\d+)([\+\-\*\/]\d+)?/i);
        if (!match) return 'ダイスの形式が正しくないよ！ 例: /dais 2d6+10';

        const count = parseInt(match[1] as any);
        const sides = parseInt(match[2] as any);
        const modifierStr = match[3] || '';

        if (count > 100) return 'そんなにたくさん振れないよ！(最大100回まで)';
        if (sides > 100) return 'そんなに多面ダイスはないよ！(最大100面まで)';

        const results: number[] = [];
        for (let i = 0; i < count; i++) {
            results.push(Math.floor(Math.random() * sides) + 1);
        }

        const sum = results.reduce((a, b) => a + b, 0);
        let finalValue = sum;

        if (modifierStr) {
            const op = modifierStr[0];
            const val = parseInt(modifierStr.substring(1));
            if (op === '+') finalValue += val;
            if (op === '-') finalValue -= val;
            if (op === '*') finalValue *= val;
            if (op === '/') finalValue = Math.floor(finalValue / val);
        }

        const resultDetails = count > 1 ? `(${results.join(' + ')})` : `${sum}`;
        const modifierText = modifierStr ? `${modifierStr}` : '';
        
        return `🎲: ${expression}\n結果: ${resultDetails}${modifierText} = **${finalValue}**`;
    }

    async init() {
        this.addCommand({
            name: "roll",
            execute: async (note, args, stream, cli) => {
                if (args[0]) {
                    await cli.request('notes/create', {
                        replyId: note.id,
                        text: this.rollDice(args[0])
                    });
                } else {
                    await cli.request('notes/create', {
                        replyId: note.id,
                        text: this.rollDice("1d6")
                    });
                }
            }
        })
    }
}