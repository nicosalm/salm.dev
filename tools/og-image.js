import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import { Resvg } from "@resvg/resvg-js";
import { decompress } from "wawoff2";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = path.join(root, "src/assets/fonts");

const P = { bg: "#16202e", ink: "#dde5ef", muted: "#8fa3bd", rule: "#2d3d54" };

const W = 1200;
const H = 630;
const PAD = 92;
const COL = W - PAD * 2;

const NMARK =
  "M178.24 375.97c0 10.75-24.09 25.41-72.27 43.95-48.19 18.55-77.8 27.83-88.86 27.83-4.89 0-7.33-1.47-7.33-4.39s2.84-6.66 8.55-11.22c5.69-4.56 12.03-9.03 19.03-13.44 7-4.39 11.14-7.23 12.45-8.55 11.06-11.39 17.66-24.17 19.78-38.33 2.11-14.16 3.17-45.5 3.17-94v-31.73c0-55-3.34-97.48-10.02-127.44-6.67-29.94-18.62-44.92-35.88-44.92-.98 0-2.3.17-3.92.48-1.62.33-3.17.81-4.64 1.47s-3.09 1.22-4.88 1.7c-1.8.5-3.5.91-5.12 1.22-1.62.33-3.09.58-4.39.73-1.31.17-2.28-.06-2.94-.72S0 76.99 0 75.67c0-5.86 6.09-14.81 18.31-26.86 12.2-12.03 27.02-23.19 44.42-33.44S95.07 0 107.44 0c10.09 0 19.12 3.59 27.09 10.75s14 15.88 18.06 26.12 7.16 19.53 9.28 27.83c2.11 8.3 3.17 14.89 3.17 19.77 22.47-21.47 41.02-36.94 55.67-46.39C259.79 12.7 302.75 0 349.63 0c33.19 0 61.83 9.94 85.92 29.78 24.09 19.86 38.42 44.77 42.98 74.7.97 6.19 1.62 17.34 1.95 33.45l.48 46.39-.25 60.8-.23 55.17c0 15.95 1.22 28.64 3.66 38.08s5.05 15.06 7.81 16.84c2.77 1.8 5.38 3.09 7.81 3.91s3.67 1.72 3.67 2.69c0 8.8-11.56 23.53-34.67 44.2-23.12 20.67-40.05 31-50.78 31-14.33 0-23.94-11.22-28.81-33.69-4.89-22.47-7.33-55.19-7.33-98.16l.73-59.08.73-62.5c0-31.56-11.64-58.17-34.92-79.83s-50.86-32.48-82.75-32.48c-8.14 0-15.88.66-23.2 1.95-7.33 1.31-13.67 2.86-19.05 4.64-5.38 1.8-10.58 4.33-15.62 7.58s-9.11 6.11-12.2 8.55-6.34 5.7-9.77 9.77-5.78 7.08-7.08 9.03l-5.61 8.55-4.16 6.58c.97 14.33 1.7 52.66 2.2 115 .48 62.34 2.36 103.59 5.61 123.78.97 5.22 1.47 8.3 1.47 9.27h.02z";
const NMARK_H = 447.75;

async function loadFonts() {
  const cacheDir = path.join(root, "node_modules/.cache/og-fonts");
  fs.mkdirSync(cacheDir, { recursive: true });

  const out = {};
  for (const [key, file] of [["serif", "rumiko-clear-regular.woff2"]]) {
    const ttf = Buffer.from(await decompress(fs.readFileSync(path.join(fontDir, file))));
    const ttfPath = path.join(cacheDir, file.replace(/\.woff2$/, ".ttf"));
    fs.writeFileSync(ttfPath, ttf);

    const metrics = fontkit.create(ttf);
    out[key] = { ttfPath, metrics, family: metrics.familyName };
  }
  return out;
}

function widthAt(font, text, size) {
  const { advanceWidth } = font.metrics.layout(text);
  return (advanceWidth / font.metrics.unitsPerEm) * size;
}

function wrap(font, text, size, maxWidth, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (widthAt(font, candidate, size) <= maxWidth || !line) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);

  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (last.includes(" ") && widthAt(font, `${last}…`, size) > maxWidth) {
      last = last.slice(0, last.lastIndexOf(" "));
    }
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

function truncate(font, text, size, maxWidth) {
  if (widthAt(font, text, size) <= maxWidth) return text;
  let cut = text;
  while (cut.includes(" ") && widthAt(font, `${cut}…`, size) > maxWidth) {
    cut = cut.slice(0, cut.lastIndexOf(" "));
  }
  return `${cut}…`;
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const nmark = (x, y, h, fill) =>
  `<g transform="translate(${x} ${y}) scale(${(h / NMARK_H).toFixed(6)})" fill="${fill}"><path d="${NMARK}"/></g>`;

function signature(y) {
  return `<rect x="${PAD}" y="${y}" width="${COL}" height="1" fill="${P.rule}"/>
${nmark(PAD, y + 36, 42, P.ink)}
<text x="${PAD + 60}" y="${y + 70}" font-family="Rumiko Clear" font-size="34" fill="${P.ink}">salm.dev</text>`;
}

function defaultCard() {
  const size = 116;
  const markH = 102;
  const baseline = 348;
  const nameX = PAD + markH * 1.42 + 34;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${P.bg}"/>
${nmark(PAD, baseline - markH * 0.885, markH, P.ink)}
<text x="${nameX}" y="${baseline}" font-family="Rumiko Clear" font-size="${size}" fill="${P.ink}">salm.dev</text>
</svg>`;
}

function nowCard(fonts, { title, description }) {
  const serif = fonts.serif;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${P.bg}"/>
<text x="${PAD}" y="300" font-family="Rumiko Clear" font-size="104" fill="${P.ink}">${esc(title)}</text>
${description ? `<text x="${PAD}" y="368" font-family="Rumiko Clear" font-size="32" fill="${P.muted}">${esc(truncate(serif, description, 32, COL))}</text>` : ""}
${signature(504)}
</svg>`;
}

function fitTitle(font, title, maxWidth, maxLines) {
  let size = 92;
  let lines = wrap(font, title, size, maxWidth, maxLines);
  if (lines.length > 2) {
    size = 76;
    lines = wrap(font, title, size, maxWidth, maxLines);
  }
  while (size > 40 && lines.some((line) => widthAt(font, line, size) > maxWidth)) {
    size -= 4;
    lines = wrap(font, title, size, maxWidth, maxLines);
  }
  return { size, lines };
}

function postCard(fonts, { title, description }) {
  const serif = fonts.serif;
  const { size, lines } = fitTitle(serif, title, COL, 3);

  const lh = Math.round(size * 1.18);
  const blockTop = lines.length > 2 ? 176 : lines.length > 1 ? 214 : 258;
  const titleBlock = lines
    .map(
      (line, i) =>
        `<text x="${PAD}" y="${blockTop + i * lh}" font-family="Rumiko Clear" font-size="${size}" fill="${P.ink}">${esc(line)}</text>`
    )
    .join("\n");

  const descY = blockTop + (lines.length - 1) * lh + 66;
  const descBlock =
    description && descY < 470
      ? `<text x="${PAD}" y="${descY}" font-family="Rumiko Clear" font-size="32" fill="${P.muted}">${esc(truncate(serif, description, 32, COL))}</text>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${P.bg}"/>
${titleBlock}
${descBlock}
${signature(504)}
</svg>`;
}

function rasterize(svg, fonts) {
  return new Resvg(svg, {
    font: {
      fontFiles: [fonts.serif.ttfPath],
      loadSystemFonts: false,
      defaultFontFamily: fonts.serif.family,
    },
    fitTo: { mode: "width", value: W },
  })
    .render()
    .asPng();
}

export async function buildOgImages(cards, outDir) {
  const fonts = await loadFonts();
  fs.mkdirSync(outDir, { recursive: true });

  const written = [];
  for (const card of cards) {
    const svg =
      card.slug === "default"
        ? defaultCard()
        : card.kind === "now"
          ? nowCard(fonts, card)
          : postCard(fonts, card);
    const file = path.join(outDir, `${card.slug}.png`);
    fs.writeFileSync(file, rasterize(svg, fonts));
    written.push(file);
  }
  return written;
}
