import type { CollectionEntry } from 'astro:content';

/** One page of one specification. */
export type SpecEntry = CollectionEntry<'specs'>;

/**
 * URL of a page. The first page of a specification owns the group's URL, so
 * `/specs/lumen` is the overview rather than `/specs/lumen/overview`.
 */
export function specPageUrl(entry: SpecEntry): string {
  const { spec, isIndex } = entry.data;
  return isIndex ? `/specs/${spec}` : `/specs/${spec}/${entry.id.split('/')[1]}`;
}

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
