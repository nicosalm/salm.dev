import rss from '@astrojs/rss';
import { glob } from 'glob';
import { promises as fs } from 'fs';
import matter from 'gray-matter';
import path from 'path';

export async function GET(context) {
  try {
    const blogPosts = await glob('src/pages/blog/**/index.md');
    console.log(`Found ${blogPosts.length} blog posts`);

    const items = await Promise.all(
      blogPosts.map(async (post) => {
        const content = await fs.readFile(post, 'utf-8');
        const { data } = matter(content);
        const slug = path.basename(path.dirname(post));
        return {
          link: `/blog/${slug}/`,
          title: data.title,
          pubDate: new Date(data.pubDate),
          description: data.description,
        };
      })
    );

    return rss({
      title: 'Nico Salm Blog',
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
