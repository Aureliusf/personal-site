import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.date(),
      tags: z.array(z.string()).or(z.null()).optional(),
      cover: image().optional(),
      featured: z.boolean().optional().default(false),
      highlight: z.string().optional(),
      github: z.string().optional(),
      liveUrl: z.string().optional(),
    }),
});

export const collections = { posts };
