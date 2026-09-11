# AGENTS.md

Astro 7 + TypeScript static site for `openresin.org`, deployed to GitHub Pages by
`.github/workflows/deploy.yml`. Read `README.md` first — it documents the content
workflow, the stats pipeline and the file layout.

## Commands

```
npm install
npm run dev              # dev server on http://localhost:4321
npm run check            # astro check (types + template diagnostics) — must be 0 errors
npm run build            # static build into dist/
npm run stats            # refresh src/data/github-stats.json (GITHUB_TOKEN raises the limit)
npm run stats:offline    # print the committed snapshot summary without network
```

There is no test suite. `npm run check` plus a real build is the gate.

## Rules that are easy to get wrong

- **Never put the `padding` shorthand on an element that also carries `.shell`.** Astro
  scopes page styles to `.section[data-astro-cid-…]` (specificity 0,2,0), which beats the
  global `.shell` (0,1,0), so `padding: 3.5rem 0` silently zeroes the shell's horizontal
  gutters. Use `padding-block` instead. This is what made every section 24px wider than the
  hero; verify with the measurement under "Verification" below.
- **A flex column shrinks its children to fit.** `.hero__copy` is `display: flex;
  flex-direction: column`, so its `h1` was only as wide as its own longest line and never
  lined up with the content below. Anything that must span the content box needs an
  explicit `inline-size: 100%`.
- **Never hand-edit a generated snapshot.** `src/data/github-stats.json` and
  `src/data/supporters.json` come from the scripts and are rewritten by CI. Change the
  script, `src/data/projects.ts` or the pipeline instead.
- **`Project.repo` is a join key.** It must match the GitHub repository name exactly;
  a typo silently drops the live stats for that project with no error.
- **Pages read the snapshots only.** Do not add `fetch()` calls to pages or components.
  All network access belongs in `scripts/`.
- **No nested anchors.** A card that is itself an `<a>` must not contain another `<a>` —
  the HTML parser splits them and the DOM stops matching the source. Pass
  `link={false}` to `ReleaseChip` inside `ProjectCard`; that prop exists for this reason.
- **Fixed grid track counts.** `.grid--2/3/4` use explicit `repeat(N, minmax(0, 1fr))`.
  `auto-fit` sizes tracks from content, so one wide card widens its own column and a lone
  cell gets orphaned. Collapse to fewer columns with media queries instead.
- **Theme is `data-theme` on `<html>`**, set by an inline script in `BaseLayout.astro`
  before first paint and persisted in `localStorage` under `ora-theme`. Anything that must
  react to a theme change listens for the `ora:theme` event.
- **Glass surfaces share one set of tokens** (`--glass-bg`, `--glass-border`,
  `--glass-blur`, `--glass-shadow` in `global.css`). The header uses the same pane, plus a
  thicker fill once `data-scrolled` is set, because content passes underneath it.
- **Blog frontmatter is validated.** The schema in `src/content.config.ts` is the contract;
  a bad field fails the build. Add posts as `src/content/blog/YYYY-MM-DD-slug.md`.
- **Assets are WebP/JPEG and all of `public/` must be rendered.** Before committing new
  images, check that nothing in `public/` is unreferenced — the deployed artifact ships
  every file verbatim.

## Verification

A change is not finished until:

1. `npm run check` reports 0 errors.
2. `npm run build` succeeds and the touched route exists in `dist/`.
3. For layout changes, the page is loaded in a browser and asserted at 1600/1280/1024/820/
   480/360 px wide with `documentElement.scrollWidth - clientWidth === 0` and no element
   whose `getBoundingClientRect().right` exceeds the viewport.
4. Every `.shell` reports the same content box — 228…1340 at a 1568px viewport, 164…1276 at
   1440 — so sections, grids and cards share one left edge:

   ```
   [...document.querySelectorAll('.shell')].map(el => {
     const cs = getComputedStyle(el), r = el.getBoundingClientRect();
     return [Math.round(r.left + parseFloat(cs.paddingInlineStart)),
             Math.round(r.right - parseFloat(cs.paddingInlineEnd))].join(':');
   })
   ```

5. No `a > a` nesting anywhere in the built HTML.

Do not run a formatter or linter over the repository — there is none configured.
