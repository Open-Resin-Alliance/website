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
 * Two rewrites, both because a part is no longer a page. Its own headings drop a
 * level, since the part heading is now the section and the document title is the
 * h1. And every link that pointed at another part of the same specification
 * becomes a jump inside this page - a `§`-reference is a place in this document
 * now, and the heading ids are unique across every part, so the fragment carries
 * over untouched. Links to another specification keep their URL: that text really
 * is somewhere else.
 */
export function partHtml(entry: SpecEntry): string {
  const { spec, isIndex } = entry.data;
  const part = new RegExp(`(href)="/specs/${spec}/([a-z0-9-]+)(#[^"]*)?"`, 'g');

  const linked = (entry.rendered?.html ?? '').replace(part, (_, attr: string, slug: string, hash?: string) =>
    `${attr}="#${hash ? hash.slice(1) : slug}"`,
  );

  if (isIndex) return linked;
  return linked.replace(/<(\/?)h([1-5])\b/g, (_, close: string, level: string) => `<${close}h${Number(level) + 1}`);
}
