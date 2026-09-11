import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE, LINKS } from '../data/site';

export async function GET(context: { site: URL | undefined }) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: `${SITE.name} blog`,
    description: 'Release notes and engineering notes from the Open Resin Alliance.',
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
      categories: [post.data.category, ...post.data.tags],
      // RSS 2.0 defines <author> as an email address, so the feed carries the
      // organisation address rather than the display name shown on the page.
      author: SITE.email,
      ...(post.data.version && post.data.project
        ? {
            source: {
              url: `https://github.com/Open-Resin-Alliance/${post.data.project}/releases/tag/${post.data.version}`,
              title: `${post.data.project} ${post.data.version}`,
            },
          }
        : {}),
    })),
    customData: [
      '<language>en</language>',
      `<managingEditor>${SITE.email} (${SITE.name})</managingEditor>`,
      `<webMaster>${SITE.email} (${SITE.name})</webMaster>`,
      `<copyright>${new Date().getFullYear()} ${SITE.name}</copyright>`,
      `<docs>${LINKS.github}</docs>`,
    ].join(''),
  });
}
