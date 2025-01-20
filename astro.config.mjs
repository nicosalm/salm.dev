//@ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://salm.dev',
  integrations: [
    tailwind(),
    expressiveCode({
      themes: ['min-dark'],
      frames: false,
      styleOverrides: {
        codeFontSize: '0.9rem',
        codeFontFamily: 'Iosevka, monospace',
        borderRadius: '0',
        borderWidth: '1px',
        borderColor: '#262626',                 // matches neutral-800
        codePaddingInline: '1rem',
        codePaddingBlock: '1rem',
        codeBackground: '#171717',              // neutral-900
        codeForeground: '#d1d5db',              // gray-300
        scrollbarThumbColor: '#262626',         // neutral-800
        scrollbarThumbHoverColor: '#404040',    // neutral-700
        focusBorder: 'transparent',
      }
    }),
    mdx(),
    react()
  ]
});
