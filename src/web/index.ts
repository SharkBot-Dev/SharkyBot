import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createRouter() {
    console.log("Webモジュールをロードしています・・");
    const router = Router();
    const files = fs.readdirSync(__dirname);

    for (const file of files) {
        if (
            file === "index.js" ||
            !file.endsWith(".js") ||
            file.endsWith(".map")
        ) continue;

        const mod = await import(
            pathToFileURL(path.join(__dirname, file)).href
        );

        if (!mod.default) continue;

        const routeName = "/" + file.replace(".js", "");
        router.use(routeName, mod.default);
    }

    console.log("Webモジュールをロードしました。");

    return router;
}