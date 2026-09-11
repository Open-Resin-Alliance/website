import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog posts live as Markdown files in src/content/blog/.
 * Adding a post is one file plus a git push — no build configuration, no CMS.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().max(120),
    /** One or two sentences used for the timeline card, meta description and RSS. */
    description: z.string().max(400),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['release', 'project', 'community', 'engineering']).default('project'),
    tags: z.array(z.string()).default([]),
    /** Repository name from src/data/projects.ts, when the post is about one project. */
    project: z.string().optional(),
    /** Release tag, when the post announces one. */
    version: z.string().optional(),
    /** Pinned to the top of the blog index and the home page. */
    featured: z.boolean().default(false),
    /** Hidden from listings, RSS and the sitemap in production builds. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
