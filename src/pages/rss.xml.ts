// @ts-ignore
import rss from '@astrojs/rss';

import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
   try {
       const blog = await getCollection('blog');
       return rss({
           title: "Nico's Blog",
           description: 'Hot takes and cool things',
           site: context.site,
           items: blog.map((post) => ({
               title: post.data.title,
               pubDate: post.data.pubDate,
               description: post.data.description,
               link: `/blog/${post.slug}/`,
               categories: post.data.tags
           }))
       });
   } catch (error) {
       console.error('Error generating RSS feed:', error);
       return new Response('Error generating RSS feed', { status: 500 });
   }
}
