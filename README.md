# openresin.org

The website for the **Open Resin Alliance** — a mostly-static site built with
[Astro](https://astro.build) that shows live GitHub statistics and renders its blog from
Markdown files in this repository.

Deployed to GitHub Pages at <https://openresin.org>.

## Adding a blog post

Create one Markdown file in `src/content/blog/` and push it. That is the whole workflow —
no CMS, no database, no rebuild configuration.

```md
---
title: DragonFruit v0.1.16 is out
description: One or two sentences used on the timeline card, the meta description and the RSS feed.
pubDate: 2026-09-20
author: Open Resin Alliance
category: release          # release | project | community | engineering
tags: [dragonfruit, release]
project: DragonFruit        # repository name, links the post to a project page
version: v0.1.16            # release tag, optional
featured: false             # pins the post to the top of /blog and the home page
draft: false                # true hides the post everywhere, including RSS
---

Body text in Markdown. `##` and `###` headings also build the "On this page" sidebar.
```

`pubDate` drives ordering, so the timeline, the RSS feed and the sitemap all update
themselves. The filename becomes the URL (`/blog/<filename>`); name it
`YYYY-MM-DD-slug.md` to keep dates visible in the file listing.

The frontmatter schema lives in [`src/content.config.ts`](src/content.config.ts). A
malformed post fails the build with the field name.

## How the statistics work

`scripts/fetch-github-stats.mjs` reads the public GitHub API for the whole
`Open-Resin-Alliance` organisation — repositories, releases, an activity feed and
contributor counts — and writes a snapshot to `src/data/github-stats.json`.

```
npm run stats           # refresh the snapshot (set GITHUB_TOKEN to raise the rate limit)
npm run stats:offline   # inspect the committed snapshot, no network
```

Every page reads only that snapshot, so `astro build` never touches the network and a
build is byte-for-byte reproducible. If the API is unreachable, the script keeps the
previous snapshot and exits `0` so a deployment can never fail because GitHub was slow.

Two workflows keep it fresh:

| Workflow | Trigger | Effect |
|---|---|---|
| `.github/workflows/stats.yml` | daily cron, `repository_dispatch`, manual | refreshes the snapshot and commits it as `data: refresh GitHub statistics` |
| `.github/workflows/deploy.yml` | push to `main`, manual | refreshes the snapshot, builds, and deploys to GitHub Pages |

`stats.yml` carries the instructions for wiring an organisation webhook to it at the
bottom of the file.

## Local development

```
npm install
npm run dev       # http://localhost:4321
npm run check     # astro check: types, template diagnostics
npm run build     # static output in dist/
npm run stats:offline
```

Node 22.12 or newer is required (see the `engines` field in `package.json`).

## Layout

```
src/
  components/       header, footer, cards, activity feed, release chip
  content/blog/     blog posts — one Markdown file per post
  content.config.ts blog collection schema
  data/
    site.ts         org constants: name, URLs, navigation
    projects.ts     curated project catalogue (repo name joins into the stats snapshot)
    github-stats.json   generated snapshot, refreshed by the workflows
  layouts/BaseLayout.astro   document shell, SEO tags, JSON-LD, theme bootstrap
  lib/              stats reader and date/number formatting
  pages/            routes: /, /projects, /projects/[repo], /blog, /blog/[...id], /about, /contact, /404
  styles/global.css design tokens and base styles
scripts/fetch-github-stats.mjs
public/             CNAME, robots.txt, favicon, brand and project images
```

### Adding or changing a project

Edit `src/data/projects.ts`. `repo` must match the GitHub repository name exactly — that
is the join key into `src/data/github-stats.json`, so a typo silently drops the live
numbers. Use `slug` when the repository name is not a good URL segment
(`ORA_Charter` → `/projects/governance`).

### Design notes

- One accent ramp, sampled from the ORA logo: amber `#f0991f` → magenta `#e9318a`.
- Light and dark themes, both driven by `data-theme` on `<html>`; the choice is stored in
  `localStorage` and applied before first paint, so there is no flash of the wrong theme.
- No CSS framework. Tokens and primitives live in `src/styles/global.css`, component
  styles are scoped in their `.astro` files.

## Licensing

Source code in this repository is licensed under the MIT License — see
[LICENSE](LICENSE). Content, logos and images are copyright © Open Resin Alliance unless
stated otherwise. Sponsor logos are the property of their respective owners and are used
with permission.
