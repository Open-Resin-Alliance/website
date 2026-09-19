import type { CollectionEntry } from 'astro:content';

/** One page of one specification. */
export type SpecEntry = CollectionEntry<'specs'>;

/** Groups entries by specification, each group in reading order. */
export function groupSpecs(entries: SpecEntry[]): Map<string, SpecEntry[]> {
  const groups = new Map<string, SpecEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.data.spec) ?? [];
    list.push(entry);
    groups.set(entry.data.spec, list);
  }
  for (const list of groups.values()) list.sort((a, b) => a.data.order - b.data.order);
  return groups;
}

/**
 * URL of a specification: the whole format, read as one document. A part is a
 * section of it, not a page of its own, so this is the only URL a specification
 * has - `/specs/<spec>/<part>` only exists to forward to it (see
 * `src/pages/specs/[spec]/[part].astro`).
 */
export function specUrl(entry: SpecEntry): string {
  return `/specs/${entry.data.spec}`;
}

/** Anchor a part is reached by inside the document, e.g. `chunk-auth`. */
export function partSlug(entry: SpecEntry): string {
  return entry.id.split('/')[1] ?? 'overview';
}

/**
 * A part's content as it appears inside the document.
 *
 * Three rewrites, all because a part is no longer a page. Its own headings drop a
 * level, since the part heading is now the section and the document title is the
 * h1 - but first they are read relative to the part's own top level, because the
 * source is not uniform: `04-head.md`, `05-meta.md` and `06-prof.md` open at `###`
 * in LUMEN v1.0 where the other nineteen parts open at `##` (see AGENTS.md). And
 * every link that pointed at another part of the same specification becomes a jump
 * inside this page - a `§`-reference is a place in this document now, and the
 * heading ids are unique across every part, so the fragment carries over untouched.
 * Links to another specification keep their URL: that text really is somewhere else.
 */
export function partHtml(entry: SpecEntry): string {
  const { spec, isIndex } = entry.data;
  const part = new RegExp(`(href)="/specs/${spec}/([a-z0-9-]+)(#[^"]*)?"`, 'g');

  const linked = (entry.rendered?.html ?? '').replace(part, (_, attr: string, slug: string, hash?: string) =>
    `${attr}="#${hash ? hash.slice(1) : slug}"`,
  );

  // Everything reads relative to the shallowest level the part uses, taken as its
  // own section level - `##` in a part that follows the convention, `###` in the
  // three that do not. Without it those three would render their sections a size
  // down and without the rule the prose styles draw above one, which is what a
  // subsection looks like.
  const raised = shiftHeadings(linked, 2 - topLevel(linked));

  if (isIndex) return raised;
  return shiftHeadings(raised, 1);
}

/** Every heading in a fragment: `<h2>`, `</h4>` and so on. Reset by every `replace`. */
const HEADINGS = /<(\/?)h([1-6])\b/g;

/**
 * The shallowest level a fragment uses, or `2` - the section level - if it has no
 * headings at all. Its own copy of the pattern rather than the shared constant:
 * `matchAll` reads `lastIndex` off the object it is given, and a global regex is
 * stateful.
 */
function topLevel(html: string): number {
  const levels = [...html.matchAll(/<(\/?)h([1-6])\b/g)].map((match) => Number(match[2]));
  return levels.length ? Math.min(...levels) : 2;
}

/** Moves every heading in a fragment by `delta` levels, inside `h1`-`h6`. */
function shiftHeadings(html: string, delta: number): string {
  if (delta === 0) return html;
  return html.replace(
    HEADINGS,
    (_, close: string, level: string) => `<${close}h${Math.min(6, Math.max(1, Number(level) + delta))}`,
  );
}
