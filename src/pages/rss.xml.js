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
  const feed = [];

  for (const post of posts) {
    feed.push({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      content: await postContent(post),
    });
  }

  return rss({
    title: 'Nico Salm',
    description: 'Hot takes and cool things',
    site: context.site,
    items: feed,
    customData: `
      <image>
        <url>${context.site}favicon.svg</url>
        <title>Nico Salm</title>
        <link>${context.site}</link>
      </image>
    `
  });
}
