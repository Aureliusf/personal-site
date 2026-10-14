import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';
import resume from './scripts/resume/integration.mjs';

export default defineConfig({
  site: 'https://aurelioflorez.com',
  integrations: [
    resume(),
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
