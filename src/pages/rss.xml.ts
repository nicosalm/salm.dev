import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  try {
    const posts = await getCollection('blog');
    const items = posts.map((post) => ({
      link: `/blog/${post.slug}/`,
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
    }));

    return rss({
      title: 'Nico\'s Blog',
      description: 'Hot takes and cool things.',
      site: context.site,
      items: items,
      customData: `<language>en-us</language>`,
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}
