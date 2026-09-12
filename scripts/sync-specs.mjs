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
 * next to the file it links to once it is a page. Every page records the
 * repository, path and commit it came from, so a specification that has moved
 * upstream shows up as a diff instead of a silently stale page.
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

function frontmatter(fields) {
  // JSON string literals are valid YAML scalars, which keeps colons, quotes and
  // apostrophes in a description from turning into a mapping.
  const lines = Object.entries(fields).map(
    ([key, value]) => `${key}: ${typeof value === 'string' ? JSON.stringify(value) : value}`,
  );
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/** `07-scene-chunks.md` -> `scene-chunks`; the index part becomes the group URL. */
const slugOf = (file, group, indexFile) =>
  file === indexFile ? `/specs/${group}` : `/specs/${group}/${file.replace(/^\d+-/, '').replace(/\.md$/, '')}`;

rmSync(OUT_DIR, { recursive: true, force: true });

let pagesWritten = 0;

for (const spec of SPECS) {
  const repoDir = resolve(ROOT, argValue(`--${spec.id}`) ?? spec.defaultDir);
  const ref = head(repoDir);

  const parts = spec.sourceFiles
    ? spec.sourceFiles.map((f) => ({ file: f, path: f }))
    : readdirSync(join(repoDir, spec.sourceDir))
        .filter((f) => f.endsWith('.md'))
        .sort()
        .map((f) => ({ file: f, path: `${spec.sourceDir}/${f}` }));

  const indexFile = spec.sourceFiles ? spec.sourceFiles[0] : parts[0].file;
  const urls = new Map(parts.map((p) => [p.file, slugOf(p.file, spec.id, indexFile)]));

  for (const [order, part] of parts.entries()) {
    const raw = readFileSync(join(repoDir, part.path), 'utf8');
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

    const rel = `${spec.id}/${part.file === indexFile ? 'overview' : part.file.replace(/^\d+-/, '').replace(/\.md$/, '')}.md`;
    const file = join(OUT_DIR, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      frontmatter({
        spec: spec.id,
        title: part.file === indexFile ? spec.title : title,
        description: spec.description,
        status: spec.status,
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
