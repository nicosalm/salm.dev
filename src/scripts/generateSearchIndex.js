import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/pages/blog');
const OUTPUT_FILE = path.join(process.cwd(), 'public/search-index.json');

async function generateSearchIndex() {
    const files = await glob(`${BLOG_DIR}/**/index.md`);
    const posts = files.map(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const { data } = matter(content);
        return {
            title: data.title,
            description: data.description,
            tags: data.tags || [],
            url: `/blog/${path.basename(path.dirname(file))}/`,
            pubDate: data.pubDate,
            minutesRead: data.minutesRead
        };
    });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Search index generated at ${OUTPUT_FILE}`);
}

generateSearchIndex();
