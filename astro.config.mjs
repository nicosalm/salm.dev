import { defineConfig } from 'astro/config';

import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://salm.dev',
  integrations: [expressiveCode()]
});
