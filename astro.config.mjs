import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import codeTheme from './src/utils/code-theme.json';

export default defineConfig({
    site: 'https://salm.dev',
    integrations: [
        tailwind(),
        mdx({
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex]
        })
    ],
    markdown: {
        rehypePlugins: [
            [
                rehypePrettyCode,
                {
                    theme: codeTheme,
                    onVisitLine(node) {
                        if (node.children.length === 0) {
                            node.children = [{ type: 'text', value: ' ' }];
                        }
                    },
                    onVisitHighlightedLine(node) {
                        node.properties.className.push('highlighted');
                    },
                    onVisitHighlightedWord(node) {
                        node.properties.className = ['word'];
                    }
                }
            ]
        ],
        shikiConfig: {
            wrap: true
        }
    }
});
