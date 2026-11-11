salm.dev
========

salm.dev is a personal website and blog, built as a static site with
Eleventy. Posts live in `src/writing/<slug>/index.md`, monthly now pages
in `src/now/<yyyy-mmm>/index.md`, and the remaining pages are Nunjucks
templates under `src/`. At build time, footnotes are turned into
sidenotes and images are converted to AVIF and JPEG at two widths.

To run it locally, `pnpm install` followed by `pnpm dev` will serve the
site at http://localhost:8080 with live reload. `pnpm build` writes the
output to `dist/`.

The live status page is backed by a Cloudflare Worker in `worker/`,
served at status.salm.dev. It combines uptime from updown.io, coding
activity from WakaTime, traffic from Rybbit, and bandwidth from the
Cloudflare GraphQL API into a single JSON response, cached for sixty
seconds. It expects `UPDOWNIO_KEY`, `RYBBIT_API_KEY`, and `CF_API_TOKEN`
to be set as secrets with `wrangler secret put`.

Every push to `main` builds the site, deploys a preview
to salm-dev-preview.nicosalm.workers.dev, and then publishes to GitHub
Pages. The worker is only redeployed when something under `worker/`
has changed.
