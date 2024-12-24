import { getCollection } from 'astro:content';
import type { APIContext, APIRoute } from 'astro';

export const GET: APIRoute = async (context: APIContext) => {
    const blog = await getCollection('blog');
    const rss = (await import('@astrojs/rss')).default;

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
};
