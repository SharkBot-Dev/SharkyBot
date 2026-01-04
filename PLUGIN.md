# プラグインの作り方

1. プラグインファイルを、pluginsフォルダに作る。
2. プラグインに、以下の内容を書き込む。
```
import Plugin from "./../plugin.js"

export default class Example extends Plugin {
    constructor() {
        super("example");
    }

    async init() {
    }
}
```
3. 完成

# プラグインにコマンドを追加する方法
1. async initに、以下の内容を付け足す
```
this.addCommand({
    name: "example",
    execute: async (note, args, stream, cli) => {
        // ここにコマンドの内容
    }
})
```
2. 完成

# プラグインにイベントを追加する方法
書き途中です・・