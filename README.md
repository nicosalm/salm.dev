# salm.dev

Personal website and blog built with Astro.

## Acknowledgements

- [@davidteather](https://github.com/davidteather): His guides on adding [interactive charts](https://dteather.com/blogs/astro-interactive-charts/) and [diagrams](https://dteather.com/blogs/astro-uml-diagrams/) were helpful.

## Stack

- [Astro](https://astro.build) - Static site generator
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [MDX](https://mdxjs.com) - Enhanced markdown for blog posts ([Why MDX?](https://www.codemotion.com/magazine/frontend/how-to-create-an-mdx-blog-in-typescript-with-next-js/#:~:text=Typically%2C%20MDX%20is%20used%20for,to%20achieve%20with%20simple%20Markdown.))
- [KaTeX](https://katex.org) - Math typesetting
- [Mermaid](https://mermaid.js.org) - Diagrams
- [Recharts](https://recharts.org) - Interactive charts

## Development

```bash
# Install dependencies
npm install

# Start development server
npx astro dev

# Build for production
npx astro build

# Preview production build
npx astro preview
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Chart.astro     # Interactive chart component
│   ├── Mermaid.astro   # Diagram component
│   └── ...
├── content/            # Content collections
│   ├── blog/           # Blog posts in MDX
│   └── books/          # Reading list entries
├── layouts/            # Page layouts
│   ├── BlogPost.astro  # Blog post template
│   └── Layout.astro    # Base site layout
├── pages/              # Route pages
│   ├── blog/           # Blog pages
│   ├── books.astro     # Reading list
│   └── ...
└── styles/            # Global styles
```

## Content Collections

### Blog Posts
```markdown
---
title: "Post Title"
date: "2024-02-01"
description: "Post description"
---
```

### Books
```markdown
---
title: "Book Title"
author: "Author Name"
dateRead: "2024-02-01"
rating: 5
tags: ["Category One", "Category Two"]
review: "Book review text"
links:
  personalSite: "https://example.com"
---
```

## License

MIT

