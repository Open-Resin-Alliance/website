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
