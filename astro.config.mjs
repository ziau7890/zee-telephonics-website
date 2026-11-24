// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zeetelephonicsbpo.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Keep CSS in files so the Content-Security-Policy can stay strict.
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you/'),
    }),
  ],
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
