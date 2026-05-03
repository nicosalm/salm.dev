import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs";
import { processSidenotes } from "./src/_includes/transforms/sidenotes.js";

export default function(eleventyConfig) {
  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true
  });
  md.use(markdownItFootnote);
  md.use(markdownItAttrs);

  md.renderer.rules.footnote_anchor_name = (tokens, idx, _options, env) => {
    const { label, id } = tokens[idx].meta;
    if (label) return "-" + label;
    const prefix = typeof env.docId === "string" ? "-" + env.docId + "-" : "";
    return prefix + (id + 1);
  };

  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "jpeg"],
    widths: [600, 1200, 1800],
    sharpJpegOptions: { quality: 80, mozjpeg: true },
    sharpAvifOptions: { quality: 55 },
    defaultAttributes: {
      loading: "lazy",
      decoding: "async"
    }
  });

  eleventyConfig.addNunjucksFilter("dateToRfc822", (date) => {
    return new Date(date).toUTCString();
  });

  eleventyConfig.addTransform("sidenotes", (content, outputPath) => {
    if (outputPath?.endsWith(".html")) {
      return processSidenotes(content);
    }
    return content;
  });

  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/writing/*/index.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("nows", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/now/*/index.md")
      .sort((a, b) => a.date - b.date);
  });

  eleventyConfig.addCollection("featuredPosts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/writing/*/index.md")
      .filter(post => post.data.featured)
      .sort((a, b) => b.date - a.date);
  });

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  eleventyConfig.addFilter("dateFormat", (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  eleventyConfig.addFilter("monthYear", (date) => {
    const d = new Date(date);
    return `${MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
  });

  eleventyConfig.addFilter("monthName", (date) => {
    const d = new Date(date);
    return MONTHS[d.getUTCMonth()];
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return [];
    return array.slice(0, n);
  });

  eleventyConfig.addFilter("year", (date) => {
    return new Date(date).getUTCFullYear();
  });

  eleventyConfig.addFilter("currentYear", () => {
    return new Date().getFullYear();
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 min read";
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  });

  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/writing/*/images");
  eleventyConfig.addPassthroughCopy("src/assets/88x31");
  eleventyConfig.addPassthroughCopy("src/assets/friends");
  eleventyConfig.addPassthroughCopy("src/assets/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/assets/logo.png");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy({ "src/assets/88x31/88x31.gif": "88x31.gif" });
  eleventyConfig.addPassthroughCopy({ "src/rss.xsl": "rss.xsl" });
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");

  eleventyConfig.addWatchTarget("src/styles/");
};

export const config = {
  dir: {
    input: "src",
    output: "dist",
    includes: "_includes",
    data: "_data"
  },
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  templateFormats: ["md", "njk", "html"]
};
