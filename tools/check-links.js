import fs from "node:fs";
import path from "node:path";

const SITE = "https://salm.dev";
const dist = path.resolve(process.argv[2] || "dist");

const ATTR = /\s(?:href|src|srcset)\s*=\s*("([^"]*)"|'([^']*)')/gi;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(p);
    return entry.name.endsWith(".html") ? [p] : [];
  });
}

function urls(attr, value) {
  if (!/srcset/i.test(attr)) return [value];
  return value.split(",").map((part) => part.trim().split(/\s+/)[0]);
}

function resolves(file, url) {
  if (url.startsWith(SITE)) url = url.slice(SITE.length) || "/";
  if (!url || url.startsWith("#") || EXTERNAL.test(url)) return true;

  let p = url.split(/[?#]/)[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    return false;
  }
  const target = p.startsWith("/") ? path.join(dist, p) : path.join(path.dirname(file), p);

  return [target, path.join(target, "index.html"), target + ".html"].some(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
  );
}

const broken = [];
const files = htmlFiles(dist);

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(ATTR)) {
    const value = match[2] ?? match[3];
    for (const url of urls(match[0], value)) {
      if (!resolves(file, url)) broken.push(`${path.relative(dist, file)} -> ${url}`);
    }
  }
}

if (broken.length) {
  console.error(`${broken.length} broken internal link(s):\n` + broken.map((b) => `  ${b}`).join("\n"));
  process.exit(1);
}
console.log(`checked ${files.length} pages, no broken internal links`);
