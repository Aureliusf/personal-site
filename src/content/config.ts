import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).or(z.null()).optional(),
    cover: image().optional(),
    featured: z.boolean().optional().default(false),
    highlight: z.string().optional(),
    github: z.string().optional(),
  }),
});

export const collections = { posts };