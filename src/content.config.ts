import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog posts live as Markdown files in src/content/blog/.
 * Adding a post is one file plus a git push - no build configuration, no CMS.
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

/**
 * Format specifications live as Markdown files in src/content/specs/<spec>/, one
 * file per page, produced by `scripts/sync-specs.mjs`. Nothing fetches at build
 * time, so a specification that moved upstream shows up as a diff rather than as
 * a silently stale page, and the deployed artifact can be inspected.
 */
const specs = defineCollection({
  loader: glob({ base: './src/content/specs', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    /** Specification this page belongs to, e.g. "lumen". Also the URL segment. */
    spec: z.string(),
    /** Page title: the page's H1, and its label in the navigation. */
    title: z.string().max(120),
    /** Specification-level summary, repeated across the pages of the group. */
    description: z.string().max(400),
    /** Human-readable maturity, e.g. "v1.0, draft". */
    status: z.string().max(40),
    /** `draft` while the revision can still change, `published` once it is a contract. */
    maturity: z.enum(['draft', 'published']).optional(),
    /** Licence the specification is published under. */
    license: z.string().max(40).optional(),
    /** Short name for the breadcrumb, e.g. "LUMEN". */
    shortName: z.string().max(24),
    /** Reading order within the specification, 1-based. */
    order: z.number(),
    /** The page that `/specs/<spec>` resolves to. */
    isIndex: z.boolean().default(false),
    /** Repository name from the Open-Resin-Alliance organisation. */
    sourceRepo: z.string(),
    /** Path of the page inside that repository. */
    sourcePath: z.string(),
    /** Commit the snapshot was taken from, so drift is visible. */
    sourceRef: z.string(),
    syncedAt: z.coerce.date(),
  }),
});

export const collections = { blog, specs };
