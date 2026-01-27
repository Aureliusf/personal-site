import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://aurelioflorez.com',
  integrations: [tailwind(), mdx(), mermaid()],
});