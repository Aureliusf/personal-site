import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://aurelioflorez.com',
  // Keep whitespace between inline elements that sit on separate source lines
  compressHTML: false,
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: {
      themes: { light: 'gruvbox-light-medium', dark: 'gruvbox-dark-hard' },
    },
  },
  integrations: [
    mdx(),
    mermaid(),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        quality: 80,
        format: 'webp',
      },
    },
  },
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
