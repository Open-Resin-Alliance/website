/**
 * Social cards are 1200x630, the size every crawler assumes when the image is
 * declared as a large summary. `src/og/` renders them at build time.
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Where a page's card lives: `/blog/foo/` is `/og/blog/foo.png`, the root is
 * `/og/home.png`.
 *
 * The build writes the file at the same rule, from the same paths, so the markup
 * and the artifact cannot drift apart - if they did, the card would simply 404 and
 * nothing would say so. The verification steps in the README check that they do not.
 */
export function ogImagePath(pathname: string): string {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  return `/og/${slug === '' ? 'home' : slug}.png`;
}

/**
 * The first thing a description says.
 *
 * A search result will take the whole sentence, but a card and a link preview show
 * their text at a glance, and two lines of prose there reads as a wall. Long
 * descriptions are therefore cut at the first boundary that leaves a usable line -
 * very often the colon a specification or a project introduces itself with - and
 * only fall back to cutting on a word and an ellipsis when there is no boundary to
 * use. A description that already fits is left exactly as written.
 *
 * Shared by the card and by the `og:`/`twitter:` description, so the two say the
 * same thing, and neither says as much as the page's own meta description.
 */
export function shortSummary(text: string, limit = 96): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= limit) return flat;

  /* A boundary is only worth taking if it leaves a line worth reading. */
  const floor = 32;

  for (const [separator, keep] of [
    ['. ', '.'],
    [': ', ''],
    [' \u2014 ', ''],
    ['; ', ''],
    [', ', ''],
  ] as const) {
    let longest = '';
    for (let at = flat.indexOf(separator); at !== -1; at = flat.indexOf(separator, at + 1)) {
      const cut = flat.slice(0, at) + keep;
      if (cut.length >= floor && cut.length <= limit && cut.length > longest.length) longest = cut;
    }
    if (longest) return longest;
  }

  const cut = flat.slice(0, limit);
  const space = cut.lastIndexOf(' ');
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.]$/, '')}…`;
}
