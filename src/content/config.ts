import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.string().transform((str) => new Date(str)),
        description: z.string().optional(),
        collection: z.string().optional(),
        collectionDescription: z.string().optional(),
        updates: z.array(
            z.object({
                date: z.string().transform((str) => new Date(str)),
                text: z.string(),
                section: z.string().optional(),
            })
        ).optional(),
    }),
});

const books = defineCollection({
    schema: z.object({
        title: z.string(),
        author: z.string(),
        cover: z.string().optional(),
        dateRead: z.string().transform((str) => new Date(str)),
        rating: z.number().min(0).max(5).step(0.5).optional(),
        review: z.string().optional(),
        tags: z.array(z.string()).default([]),
        links: z.object({
            personalSite: z.string().url().optional(),
        }).optional(),
        currentlyReading: z.boolean().default(false),
    }),
});

export const collections = { blog, books };
