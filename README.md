# salm.dev

Static site generator for salm.dev.

## Commands

- `./build.sh` - builds the site in the `./dist/` directory
- `./watch.sh` - rebuilds and serves on `localhost:8000` when files change
- `./clean.sh` - removes dist directory and temporary files

## Quirks

- Put posts in `src/writing/[post-name]/index.md`
- First line should be `# Title`
- Include `Date: YYYY-MM-DD`
- Add a brief description after a `>` character
- Put images in `src/writing/[post-name]/images/`

Math content is automatically detected and supported.
