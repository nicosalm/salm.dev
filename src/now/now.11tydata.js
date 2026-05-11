import { readdirSync } from "node:fs";
import { basename, dirname } from "node:path";

const DATE_DIR = /^\d{4}-\d{2}-\d{2}$/;

const dirs = readdirSync("src/now", { withFileTypes: true })
  .filter((d) => d.isDirectory() && DATE_DIR.test(d.name))
  .map((d) => d.name)
  .sort();
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
