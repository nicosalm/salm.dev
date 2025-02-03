import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

async function postContent(post) {
  const html = parser.render(post.body);
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  });
}

export async function GET(context) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.date - a.data.date);

  const feed = [];
  for (const post of sortedPosts) {
    feed.push({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      content: await postContent(post),
      author: post.data.author,
      categories: post.data.tags || [],
    });
  }

  return rss({
    title: 'Nico Salm',
    description: 'Hot takes and cool things',
    site: context.site,
    items: feed,
    language: 'en',
    customData: `
      <image>
        <url>${context.site}favicon.svg</url>
        <title>Nico Salm</title>
        <link>${context.site}</link>
      </image>
    `
  });
}
