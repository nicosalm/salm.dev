// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://salm.dev',
  integrations: [   tailwind(),
                    expressiveCode({
                        themes: ['andromeeda'],
                    }),
                    mdx(),
                    react()]
});
