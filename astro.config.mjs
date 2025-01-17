// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// astro.config.mjs
export default defineConfig({
  site: 'https://salm.dev',
  integrations: [tailwind(), mdx(), react()],
  markdown: {
    shikiConfig: {
      theme: {
        name: 'salm-terminal',
        type: 'dark',
        bg: '#000000',
        fg: '#e5e5e5',
        colors: {
          'editor.background': '#000000',
        },
        settings: [
          {
            scope: ['keyword', 'storage.type', 'support.type'],
            settings: { foreground: '#ff6188' }
          },
          {
            scope: ['entity.name.function', 'support.function', 'function'],
            settings: { foreground: '#9d8cff' }
          },
          {
            scope: ['string', 'string.quoted', 'string.template'],
            settings: { foreground: '#ffd866' }
          },
          {
            scope: ['variable', 'variable.parameter', 'variable.other'],
            settings: { foreground: '#b387ff' }
          },
          {
            scope: 'comment',
            settings: { foreground: '#666666' }
          },
          {
            scope: ['punctuation', 'operator'],
            settings: { foreground: '#e5e5e5' }
          },
          {
            scope: ['meta.preprocessor', 'keyword.control.directive'],
            settings: { foreground: '#ff6188' }
          }
        ]
      },
      wrap: true
    }
  }
});
