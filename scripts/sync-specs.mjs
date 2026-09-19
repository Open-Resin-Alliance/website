#!/usr/bin/env node
/**
 * Copies the format specifications into src/content/specs/.
 *
 * Each specification lives in its own repository. LUMEN is published in parts
 * (LumenFormat/spec/*.md, order from the filename prefix); VOXL is a single
 * document in the DragonFruit docs. This publishes them on openresin.org as
 * committed snapshots, the same pattern as the stats pipeline: nothing fetches
 * at build time, so the site builds offline and the deployed artifact can be
 * inspected.
 *
 * Links between parts are rewritten to site paths, because a part no longer sits
 * next to the file it links to once it is a page - and the site renders the parts
 * of a specification as one document, where those paths become jumps inside that
 * page (`src/lib/specs.ts`). Every page records the repository, path and commit it
 * came from, so a specification that has moved upstream shows up as a diff instead
 * of as a silently stale page.
 *
 * Usage:
 *   node scripts/sync-specs.mjs
 *   node scripts/sync-specs.mjs --lumen ../LumenFormat --voxl ../DragonFruit
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT_DIR = join(ROOT, 'src', 'content', 'specs');

const ORG = 'Open-Resin-Alliance';
const DRAGONFRUIT = `https://github.com/${ORG}/DragonFruit`;

const SPECS = [
  {
    id: 'lumen',
    title: 'LUMEN Format Specification',
    description:
      'The chunked, zstd-compressed print format for resin printers: layer data as REE streams in independently compressed blocks, JSON metadata in typed chunks, and optional authenticated encryption.',
    status: 'v1.0, published 2026-09-12',
    shortName: 'LUMEN',
    repo: 'LumenFormat',
    defaultDir: '../LumenFormat',
    /** Directory of parts, ordered by filename prefix, first file is the index. */
    sourceDir: 'spec',
    order: 1,
    rewrites: [
      {
        from: new RegExp(`\\]\\(${DRAGONFRUIT}/blob/main/docs/dev/voxl-format-spec\\.md\\)`, 'g'),
        to: '](/specs/voxl)',
      },
      {
        from: /\(\s*test-vectors\/\s*\)/g,
        to: `(https://github.com/${ORG}/LumenFormat/tree/main/test-vectors)`,
      },
    ],
  },
  {
    id: 'voxl',
    title: 'VOXL Format Specification',
    description:
      'DragonFruit\u2019s native scene container: a legacy JSON generation and the current binary chunk container, carrying models, supports and editable scene state.',
    status: 'V2.2 current, V1 legacy',
    shortName: 'VOXL',
    repo: 'DragonFruit',
    defaultDir: '../DragonFruit',
    /** Single document: the whole specification is one page. */
    sourceFiles: ['docs/dev/voxl-format-spec.md'],
    order: 2,
    rewrites: [],
  },
];

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

const head = (dir) =>
  execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();

const stripInline = (s) => s.replace(/`/g, '').replace(/\*\*/g, '').trim();

/**
 * A table cell that answers a yes/no question renders as a coloured mark, so a column of
 * them can be scanned rather than read. The specifications keep saying "Yes" and "No" -
 * that is what belongs in a format document, and what the source repository renders - so
 * the swap happens here, with the word travelling alongside the mark as visually-hidden
 * text, which screen readers and anything copying a cell out still get.
 *
 * Only the leading word of a cell is touched: "No*" keeps its footnote marker, and
 * "Yes (chamber + vat, Celsius)" keeps its detail.
 */
/** A cell anywhere in a table row, not just the first: `| Yes |`, `| No* |`, `| No (…)|`. */
const ANSWER_CELL = /(\|\s*)(Yes|No)(?=$|[\s*(|])/g;

const markAnswers = (body) =>
  body
    .split('\n')
    .map((line) =>
      line.startsWith('|')
        ? line.replace(
            ANSWER_CELL,
            (_whole, lead, answer) =>
              `${lead}<span class="mark mark--${answer.toLowerCase()}" aria-hidden="true">${
                answer === 'Yes' ? '✓' : '✗'
              }</span><span class="visually-hidden">${answer}</span>`,
          )
        : line,
    )
    .join('\n');

function frontmatter(fields) {
  // JSON string literals are valid YAML scalars, which keeps colons, quotes and
  // apostrophes in a description from turning into a mapping.
  const lines = Object.entries(fields)
    // A field a specification does not have is left out rather than written as
    // `undefined`: the content schema validates what is there, and a literal
    // "undefined" is not a value any of them accepts.
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? JSON.stringify(value) : value}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/** `07-scene-chunks.md` -> `scene-chunks`; the index part becomes the group URL. */
const slugOf = (file, group, indexFile) =>
  file === indexFile ? `/specs/${group}` : `/specs/${group}/${file.replace(/^\d+-/, '').replace(/\.md$/, '')}`;

/**
 * The revision a repository is on, as its own `status.json` declares it. A repository
 * without one is published as its working tree, which is what VOXL does.
 */
function readStatus(repoDir) {
  try {
    return JSON.parse(readFileSync(join(repoDir, 'status.json'), 'utf8'));
  } catch {
    return null;
  }
}

/** "v1.0, draft", or "v1.0, published 2026-09-19" once there is a date. */
function statusLine(status, fallback) {
  if (!status) return fallback;
  // LUMEN's declaration dates itself with `updated` - when the declaration last
  // changed, which for a published revision is when it was published. `published`
  // is taken first so a repository that keeps the two apart still gets the right day.
  const date = status.published ?? status.updated;
  return `v${status.version}, ${[status.status, date].filter(Boolean).join(' ')}`;
}

rmSync(OUT_DIR, { recursive: true, force: true });

let pagesWritten = 0;

for (const spec of SPECS) {
  const repoDir = resolve(ROOT, argValue(`--${spec.id}`) ?? spec.defaultDir);
  const status = readStatus(repoDir);
  // The published revision wins over the working tree. A draft in progress must not
  // become the published specification by being pushed; until a first release names one,
  // the tree is the only revision there is.
  const publishedRef = status?.stable ?? null;
  const ref = publishedRef ?? head(repoDir);

  const listParts = (dir) =>
    publishedRef
      ? execFileSync('git', ['-C', repoDir, 'ls-tree', '--name-only', `${publishedRef}:${dir}`], { encoding: 'utf8' })
          .split('\n')
          .filter(Boolean)
      : readdirSync(join(repoDir, dir));

  const parts = spec.sourceFiles
    ? spec.sourceFiles.map((f) => ({ file: f, path: f }))
    : listParts(spec.sourceDir)
        .filter((f) => f.endsWith('.md'))
        .sort()
        .map((f) => ({ file: f, path: `${spec.sourceDir}/${f}` }));

  const indexFile = spec.sourceFiles ? spec.sourceFiles[0] : parts[0].file;
  const urls = new Map(parts.map((p) => [p.file, slugOf(p.file, spec.id, indexFile)]));

  for (const [order, part] of parts.entries()) {
    const raw = publishedRef
      ? execFileSync('git', ['-C', repoDir, 'show', `${publishedRef}:${part.path}`], { encoding: 'utf8' })
      : readFileSync(join(repoDir, part.path), 'utf8');
    const titleLine = /^#\s+(.*)$/m.exec(raw);
    const title = titleLine ? stripInline(titleLine[1]) : spec.title;

    let body = raw
      // The page renders the title, so the document's own H1 goes: two headings
      // saying the same thing, one of them ahead of the summary, reads as a mistake.
      .replace(/^#\s+.*\r?\n(\r?\n)?/, '')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd();

    // Links to sibling parts become site paths: a page is not next to the file
    // it links to any more.
    body = body.replace(/\]\((\d\d-[a-z0-9-]+\.md)(#[^)]*)?\)/g, (whole, file, frag = '') => {
      const url = urls.get(file);
      return url ? `](${url}${frag})` : whole;
    });

    for (const { from, to } of spec.rewrites) body = body.replace(from, to);

    body = markAnswers(body);

    const rel = `${spec.id}/${part.file === indexFile ? 'overview' : part.file.replace(/^\d+-/, '').replace(/\.md$/, '')}.md`;
    const file = join(OUT_DIR, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      frontmatter({
        spec: spec.id,
        title: part.file === indexFile ? spec.title : title,
        description: spec.description,
        status: statusLine(status, spec.status),
        maturity: status?.status,
        license: status?.license,
        shortName: spec.shortName,
        order: order + 1,
        isIndex: part.file === indexFile,
        sourceRepo: spec.repo,
        sourcePath: part.path,
        sourceRef: ref,
        syncedAt: new Date().toISOString().slice(0, 10),
      }) + body,
      'utf8',
    );
    pagesWritten += 1;
  }

  console.log(`${spec.id.padEnd(6)} ${spec.repo}@${ref}  ${parts.length} page(s)`);
}

console.log(`\n${pagesWritten} pages written to src/content/specs/`);
