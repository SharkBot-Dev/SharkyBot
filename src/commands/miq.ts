import type { Command } from '../types.js';
import { mongo } from "./../temp/mongo.js";

import { createCanvas, loadImage, registerFont, Canvas, CanvasRenderingContext2D, Image as CanvasImage } from 'canvas';
import axios from 'axios';
import sharp from 'sharp';

interface Position {
    x: number;
    y: number;
}

const DISCORD_EMOJI_RE = /<(a?):([a-zA-Z0-9_]{1,32}):([0-9]{17,22})>/g;
const UNICODE_EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F82F}\u{1F830}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}]/gu;
const COMBINED_EMOJI_RE = new RegExp(`${DISCORD_EMOJI_RE.source}|${UNICODE_EMOJI_RE.source}`, 'gu');

function wrapTextWithScrollCut(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxHeight: number,
    lineHeight: number
): string[] {
    const lines: string[] = [];
    const rawLines = text.split('\n');

    for (const rawLine of rawLines) {
        let currentLine = "";
        for (const char of rawLine) {
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);

            if (metrics.width <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = char;
            }

            if (lines.length * lineHeight >= maxHeight - lineHeight * 2) {
                const ellipsis = "…";
                while (ctx.measureText(currentLine + ellipsis).width > maxWidth && currentLine.length > 0) {
                    currentLine = currentLine.slice(0, -1);
                }
                lines.push(currentLine + ellipsis);
                return lines;
            }
        }
        if (currentLine) lines.push(currentLine);
    }
    return lines;
}

async function drawTextWithEmojis(
    ctx: CanvasRenderingContext2D,
    position: Position,
    text: string,
    fontSize: number,
    fillStyle: string
): Promise<void> {
    let { x, y } = position;
    let cursorX = x;
    let lastEnd = 0;

    ctx.fillStyle = fillStyle;
    const matches = Array.from(text.matchAll(COMBINED_EMOJI_RE));

    for (const m of matches) {
        const startIndex = m.index!;
        if (startIndex > lastEnd) {
            const part = text.substring(lastEnd, startIndex);
            ctx.fillText(part, cursorX, y + fontSize);
            cursorX += ctx.measureText(part).width;
        }

        const token = m[0];
        if (token.match(UNICODE_EMOJI_RE)) {
            try {
                const url = `https://emojicdn.elk.sh/${encodeURIComponent(token)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                const emojiImg = await loadImage(Buffer.from(response.data));

                const emojiSize = fontSize * 0.9;
                const yOffset = y + (fontSize - emojiSize) / 2;

                ctx.drawImage(emojiImg, cursorX, yOffset, emojiSize, emojiSize);
                cursorX += ctx.measureText("M").width; 
            } catch (e) {
                ctx.fillText(token, cursorX, y + fontSize);
                cursorX += ctx.measureText(token).width;
            }
        }
        lastEnd = startIndex + token.length;
    }

    if (lastEnd < text.length) {
        const tail = text.substring(lastEnd);
        ctx.fillText(tail, cursorX, y + fontSize);
    }
}

export async function createQuoteImage(
    author: string,
    text: string,
    avatarBuffer: Buffer,
    background: string,
    textColor: string,
    isColor: boolean,
    fake: boolean = false
): Promise<Buffer> {
    registerFont('./DiscordFont.ttf', { family: 'JapaneseFont' });

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const pngBuffer = await sharp(avatarBuffer).png().toBuffer();

    const avatar = await loadImage(pngBuffer);
    const avatarCanvas = createCanvas(400, 400);
    const avCtx = avatarCanvas.getContext('2d');
    avCtx.drawImage(avatar, 0, 0, 400, 400);

    const imageData = avCtx.getImageData(0, 0, 400, 400);
    for (let x = 0; x < 400; x++) {
        let alpha = 255;
        if (x >= 200) {
            alpha = Math.floor(255 * (1 - (x - 200) / 200));
        }
        for (let y = 0; y < 400; y++) {
            const index = (y * 400 + x) * 4;
            imageData.data[index + 3] = Math.min(imageData.data[index + 3] ?? 255, alpha);
        }
    }
    avCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(avatarCanvas, 0, height - 400);

    const mainFontSize = 30;
    const nameFontSize = 20;
    ctx.font = `${mainFontSize}px "JapaneseFont"`; 

    const textX = 420;
    const maxTextWidth = width - textX - 50;
    const maxTextHeight = height - 80;
    const lineHeight = mainFontSize + 10;

    const lines = wrapTextWithScrollCut(ctx, text, maxTextWidth, maxTextHeight, lineHeight);
    const textBlockHeight = lines.length * lineHeight;
    const textY = (height - textBlockHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (typeof line != "string") continue;
        const cleanLine = line.replace(DISCORD_EMOJI_RE, "あ");
        const lineWidth = ctx.measureText(cleanLine).width;
        const lineX = (width + textX - 50 - lineWidth) / 2;
        
        await drawTextWithEmojis(ctx, { x: lineX, y: textY + i * lineHeight }, line, mainFontSize, textColor);
    }

    ctx.font = `${nameFontSize}px "JapaneseFont"`;
    const authorText = `- ${author}`;
    const authorWidth = ctx.measureText(authorText).width;
    const authorX = (width + textX - 50 - authorWidth) / 2;
    const authorY = textY + lines.length * lineHeight + 10;
    ctx.fillText(authorText, authorX, authorY + nameFontSize);

    if (fake) {
        ctx.fillText("FakeQuote - SharkBot", 580, 25);
    } else {
        ctx.fillText("SharkBot", 700, 25);
    }

    const finalData = ctx.getImageData(0, 0, width, height);

    if (finalData && finalData.data) {
        for (let i = 0; i < finalData.data.length; i += 4) {
            if (!isColor) {
                const r = finalData.data[i];
                const g = finalData.data[i + 1];
                const b = finalData.data[i + 2];

                if (typeof r != "number") continue;
                if (typeof g != "number") continue;
                if (typeof b != "number") continue;
                
                const avg = r * 0.299 + g * 0.587 + b * 0.114;
                
                finalData.data[i] = avg;
                finalData.data[i + 1] = avg;
                finalData.data[i + 2] = avg;
            }
        }
        ctx.putImageData(finalData, 0, 0);
    }
    ctx.putImageData(finalData, 0, 0);

    return canvas.toBuffer('image/png');
}

const miq_icon = "https://booth.pximg.net/4feafa5d-3680-421c-ad44-6bfed215584b/i/3879671/659da439-cace-40fd-8157-bc8a55037222_base_resized.jpg";

export const command: Command = {
    name: 'miq',
    execute: async (note, args, stream, cli) => {
        const reply = note.reply;
        
        if (!reply || !reply.text) return;

        try {
            const response = await fetch(reply.user.avatarUrl);
            if (!response.ok) {
                return;
            };
            
            const arrayBuffer = await response.arrayBuffer();
            const avBuffer = Buffer.from(arrayBuffer);

            const quoteImage = await createQuoteImage(
                reply.user.username,
                reply.text,
                avBuffer,
                "rgb(0, 0, 0)",
                "rgb(255, 255, 255)",
                true,
                false
            );

            const imageBuffer = Buffer.from(quoteImage);

            const file = await cli.request("drive/files/create", {
                file: new Blob([imageBuffer], { type: 'image/png' }),
                name: `quote_${Date.now()}.png`,
                isSensitive: true
            });

            await cli.request('notes/create', {
                text: "名言を生成しました。",
                fileIds: [file.id],
                replyId: note.id
            });

        } catch (error) {
            console.error("Error in miq command:", error);
        }
    }
};