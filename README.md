# openresin.org

The website for the **Open Resin Alliance** - a static site built with
[Astro](https://astro.build) that renders its blog from Markdown files in this repository
and its GitHub and Open Collective numbers from committed snapshots, which the browser then
refreshes against the public APIs.

Deployed to GitHub Pages at <https://openresin.org>.

## Adding a blog post

Create one Markdown file in `src/content/blog/` and push it. That is the whole workflow -
no CMS, no database, no rebuild configuration.

```md
---
title: DragonFruit v0.1.16 is out
description: One or two sentences used on the timeline card, the meta description and the RSS feed.
pubDate: 2026-09-20
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

## How the statistics and supporters work

Two build-time pipelines write JSON snapshots that the pages read:

| Script | Source | Output |
|---|---|---|
| `scripts/fetch-github-stats.mjs` | public GitHub API for the `Open-Resin-Alliance` org - repositories, releases, activity feed, contributors, and open issue / pull request / commit counts | `src/data/github-stats.json` |
| `scripts/fetch-open-collective.mjs` | public Open Collective GraphQL API for `openresinalliance` - backers, amounts, recurring vs one-time, fiscal host | `src/data/supporters.json` |

```
npm run stats           # refresh both snapshots (GITHUB_TOKEN raises the GitHub rate limit)
npm run stats:offline   # print what is committed, no network
```

The per-repository issue, pull request and commit counts come from one authenticated
GraphQL query, so they need `GITHUB_TOKEN` (in CI it is the workflow's own token). Without
it the script keeps the counts already in the snapshot and records a warning rather than
writing zeros over them.

Every page reads only those snapshots, so `astro build` never touches the network and a
build is byte-for-byte reproducible. If a source is unreachable its script keeps the
previous snapshot and exits `0`, so a deployment can never fail because a third party was
slow. Incognito Open Collective contributors are filtered out in the pipeline, so they
cannot reach the markup.

Two workflows keep them fresh:

| Workflow | Trigger | Effect |
|---|---|---|
| `.github/workflows/stats.yml` | daily cron, `repository_dispatch`, manual | refreshes both snapshots and commits them as `data: refresh statistics snapshots` |
| `.github/workflows/deploy.yml` | push to `main`, manual | refreshes both snapshots, builds, and deploys to GitHub Pages |

`stats.yml` carries the instructions for wiring an organisation webhook to it at the
bottom of the file. So a commit is never required to get fresh numbers: any deploy
refreshes them, and the cron does it once a day regardless.

### Live refresh in the browser

The snapshots are also the fallback. `src/lib/live.ts` is loaded on every page and, for the
elements marked `data-live` (plus the `data-repo` scope attribute), replaces the built value
with a freshly fetched one:

| Target | Source | Cost |
|---|---|---|
| org totals: `repos`, `stars:compact`, `forks:compact`, `active-repos` | `GET /orgs/Open-Resin-Alliance/repos` | one call |
| per-repo `stars` / `forks` / `pushed` / `updated` | the same payload | none |
| supporters `backers` / `raised` | the collective GraphQL query | one call |

Two requests per page, reused for five minutes in `sessionStorage`, no token - an
unauthenticated browser gets 60 GitHub requests per hour per IP, which is why everything
that costs a call per repository stays snapshot-only: open issue, pull request and commit
counts (they need GraphQL, which a browser cannot authenticate), contributor totals,
"projects with a tagged release" and per-release tags.

Issue counts are deliberately not a live target in either form. The snapshot records open
issues *excluding* pull requests, while the REST field available to a browser
(`open_issues_count`) includes them, so a refresh would quietly change what "issues" means
- on the DragonFruit repository the two differ by nine.

The suffix after the colon picks the formatter (`compact` = `formatCompact`, otherwise
`formatNumber`); every formatter is imported from `src/lib/format.ts`, so a refreshed value
is formatted exactly like the built one. If a page carries live targets and the refresh
fails - offline, blocked, rate limited, API down - nothing is written, no error is shown,
and the elements marked `data-live-status` keep reading `Snapshot · 11 Sept 2026`. When it
succeeds they read `Live · updated just now` (or `Partly live` if some sources answered).

The org activity feed is still collected into `src/data/github-stats.json` (and its
event-to-entry mapping lives in `src/lib/activity.js`, shared with the build script), but no
page renders it: the home page shows the per-project stats table instead. Re-mounting it
means restoring `src/components/ActivityFeed.astro` from git history and adding it back to
a page.

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
  components/       header, footer, cards, stats table, release chip, Discord icon
  content/blog/     blog posts - one Markdown file per post
  content.config.ts blog collection schema
  data/
    site.ts         org constants: name, URLs, navigation
    projects.ts     curated project catalogue (repo name joins into the stats snapshot)
    github-stats.json   generated: GitHub snapshot, refreshed by the workflows
    supporters.json     generated: Open Collective snapshot
  layouts/BaseLayout.astro   document shell, SEO tags, JSON-LD, theme bootstrap
  lib/
    stats.ts        typed reader for the GitHub snapshot
    supporters.ts   typed reader for the Open Collective snapshot
    format.ts       date and number formatting, shared by the pages and the live refresh
    live.ts         browser refresh of the built numbers; leaves them untouched on failure
    activity.js     GitHub events → activity entries for the build script
  pages/            routes: /, /projects, /projects/[repo], /blog, /blog/[...id], /about, /contact, /404
  styles/global.css design tokens (including the glass set) and base styles
scripts/
  fetch-github-stats.mjs
  fetch-open-collective.mjs
public/             CNAME, robots.txt, favicon, brand and project images
```

### Adding or changing a project

Edit `src/data/projects.ts`. `repo` must match the GitHub repository name exactly - that
is the join key into `src/data/github-stats.json`, so a typo silently drops the live
numbers. Use `slug` when the repository name is not a good URL segment
(`ORA_Charter` → `/projects/governance`).

`additionalLanguages` adds chips after the primary one, for projects that ship a second
language as a real share of their code (DragonFruit is 83% TypeScript, 15% Rust). Take the
figure from the repository's language breakdown on GitHub rather than by eye, and leave it
off for a language that only shows up in build scripts. Colours come from
`LANGUAGE_COLORS` in `src/lib/tag-colors.ts`; a language missing from that map renders an
untinted chip.

### Design notes

- One accent ramp, the ORA purple → pink → orange gradient: violet `#9333ea`, pink
  `#ec4899`, orange `#f59e0b`. The hero heading carries it as text; block rules, markers
  and hover states use single stops from it. The page background is the previous site's
  pastel wash verbatim - a fixed 135-degree linear gradient through the three stops at
  15% over the theme background - so the grade is identical on every page with no seams;
  full-bleed sections stay transparent so it shows through, while cards and panels keep
  solid surfaces for readability.
- The logo is the real artwork. `/brand/ora-lockup.webp` is the full lockup (ORA wordmark
  plus emblem) used at 64px in the footer; the header is a text-only wordmark. `favicon.png`
  and `/brand/ora-avatar.png` derive from the same source file. Nothing is redrawn.
- The social card and the avatar carry the site's own page wash rather than a flat fill:
  the brand ramp at the dark theme's 15% over `#0a0a0b`, at 135 degrees - `rgb(124 58 237)`,
  `rgb(219 39 119)`, `rgb(234 88 12)`, the same three stops `body` uses, so the card and the
  page agree. The lockup sits centred on it, 300px wide in the 1200×630 card and 123px in
  the 180×180 avatar.
- Light and dark themes, both driven by `data-theme` on `<html>`; the choice is stored in
  `localStorage` and applied before first paint, so there is no flash of the wrong theme.
- No CSS framework. Tokens and primitives live in `src/styles/global.css`, component
  styles are scoped in their `.astro` files.

## Deployment

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages via
`actions/deploy-pages`. Pages is configured with `build_type: workflow`, so there is no
branch-based build and no Jekyll processing (`public/.nojekyll` is kept anyway so the
underscore-prefixed `_astro/` directory survives if that ever changes).

The build targets the apex domain: `site: 'https://openresin.org'` with the default
`base: '/'`. That means the artifact has to be served from the root of a domain, and it is:
the repository's Pages custom domain is `openresin.org`, with Cloudflare proxying to
GitHub Pages (`Server: cloudflare`, `x-github-request-id` on the response). The site is
therefore live at <https://openresin.org/> and certificate issuance is Cloudflare's, not
GitHub's.

Because the HTML assumes the root, the *project* URL
(`https://open-resin-alliance.github.io/website/`) still serves the same HTML with every
root-relative asset 404ing. It is not a preview; use the local dev server, or Cloudflare
Pages, whose project sites are served from a root. A `base` build does not fix it either:
Astro prefixes the assets it emits but not author-written links, and the copy's canonical
URLs and sitemap would then claim `openresin.org/<repo>/…`, so subpath support would need
every internal link - Markdown links included - to go through `import.meta.env.BASE_URL`.

Two hosts are not on the new site yet, both a dashboard change rather than a code one:

- `https://www.openresin.org/` still returns the previous React app (`id="root"` shell).
  Point it at the same Pages site or redirect it to the apex.
- `http://openresin.org/` serves the site without redirecting to HTTPS. Cloudflare's
  "Always Use HTTPS" toggle closes that.

If a non-root path is ever needed permanently, set `base` in `astro.config.mjs` **and**
the matching `site` path, otherwise canonical URLs, the sitemap and the RSS links will
disagree with where the files are served.

## Licensing

Source code in this repository is licensed under the MIT License - see
[LICENSE](LICENSE). Content, logos and images are copyright © Open Resin Alliance unless
stated otherwise. Sponsor logos are the property of their respective owners and are used
with permission.
