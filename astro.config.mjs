import { defineConfig } from 'astro/config';

import expressiveCode from 'astro-expressive-code';
import { remarkReadingTime } from './remark-reading-time.mjs';

export default defineConfig({
    site: 'https://salm.dev',
    markdown: {
        remarkPlugins: [remarkReadingTime]
    },
    integrations: [expressiveCode()]
});
