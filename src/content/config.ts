import { defineCollection, z } from 'astro:content';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.string().default('nicosalm'),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    tags: z.array(z.string()).default([])
  })
});

export const collections = {
  blog: blog
};

export default defineConfig({
  integrations: [
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: { theme: 'min-dark' },
    })
  ]
});
