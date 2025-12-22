import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
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
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp", "jpeg"],
    widths: ["auto"],
    defaultAttributes: {
      loading: "lazy",
      decoding: "async"
    }
  });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "rss",
    outputPath: "/rss.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: "en",
      title: "salm.dev",
      subtitle: "Hot takes and cool things",
      base: "https://salm.dev/",
      author: { name: "Nico Salm", email: "nico@salm.dev" }
    }
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

  eleventyConfig.addCollection("featuredPosts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/writing/*/index.md")
      .filter(post => post.data.featured)
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addFilter("dateFormat", (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  eleventyConfig.addFilter("dateFormatShort", (date) => {
    const d = new Date(date);
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${month}-${day}`;
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return [];
    return array.slice(0, n);
  });

  eleventyConfig.addFilter("year", (date) => {
    return new Date(date).getFullYear();
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 min read";
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter("groupByYear", (posts) => {
    const grouped = {};
    posts.forEach(post => {
      const year = new Date(post.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(post);
    });
    return Object.entries(grouped).sort((a, b) => b[0] - a[0]);
  });

  eleventyConfig.addFilter("escape", (str) => {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  });

  eleventyConfig.addFilter("collectTags", (posts) => {
    const tagCounts = {};
    posts.forEach(post => {
      const tags = post.data.tags || [];
      tags.forEach(tag => {
        if (tag !== "post") {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });

    const maxCount = Math.max(...Object.values(tagCounts), 1);
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => {
        const size = 0.875 + 0.625 * Math.log(count) / Math.log(maxCount);
        return { name, count, size: size.toFixed(3) };
      });
  });

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/writing/**/images");
  eleventyConfig.addPassthroughCopy({ "src/assets/88x31/88x31.gif": "88x31.gif" });

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
