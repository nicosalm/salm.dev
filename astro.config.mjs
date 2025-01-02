// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://salm.dev',
  integrations: [tailwind(), mdx(), react()],
  markdown: {
    shikiConfig: {
      theme: 'min-dark',
      wrap: true
    }
  }
});