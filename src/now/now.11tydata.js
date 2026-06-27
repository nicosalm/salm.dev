import { readdirSync } from "node:fs";
import { basename, dirname } from "node:path";

const DATE_DIR = /^\d{4}-[a-z]{3}$/;

const MONTH_ORDER = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

const dirs = readdirSync("src/now", { withFileTypes: true })
  .filter((d) => d.isDirectory() && DATE_DIR.test(d.name))
  .map((d) => d.name)
  .sort((a, b) => {
    const [ay, am] = a.split("-");
    const [by, bm] = b.split("-");
    return (parseInt(ay) * 100 + (MONTH_ORDER[am] ?? 0)) - (parseInt(by) * 100 + (MONTH_ORDER[bm] ?? 0));
  });
const latest = dirs[dirs.length - 1];

export default {
  layout: "layouts/now.njk",
  title: "now",
  description: "What I'm working on, reading, and thinking about right now.",
  eleventyComputed: {
    permalink: (data) => {
      const slug = basename(dirname(data.page.inputPath));
      if (!DATE_DIR.test(slug)) return data.permalink;
      return slug === latest ? "/now/index.html" : `/now/${slug}/index.html`;
    },
  },
};
