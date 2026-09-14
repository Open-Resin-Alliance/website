// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import socialCards from './src/og/integration.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://openresin.org',
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    /* Every page gets a social card, rendered from the page itself once the site is
       built. See src/og/. */
    socialCards(),
    sitemap({
      /* `/specs/<spec>/<part>` only forwards to the part's section of the
         specification document, so it is not a page anyone should land on from a
         search result. Everything else is public. */
      filter: (page) => !page.includes('/404') && !/\/specs\/[^/]+\/[^/]+\/?$/.test(page),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: {
    enabled: false,
  },
});
