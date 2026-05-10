import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    preview: z.string(),
    tag: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    author: z.string().optional(),
  }),
})

export const collections = { news }
