import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import getReadingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/pages/blog');
const OUTPUT_FILE = path.join(process.cwd(), 'public/search-index.json');

async function generateSearchIndex() {
    const files = await glob(`${BLOG_DIR}/**/index.md`);
    
    const posts = files.map(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const { data, content: markdownContent } = matter(content);
        const readingTime = getReadingTime(markdownContent);
        
        return {
            title: data.title,
            description: data.description,
            tags: data.tags || [],
            url: `/blog/${path.basename(path.dirname(file))}/`,
            pubDate: data.pubDate,
            minutesRead: readingTime.text
        };
    });

    // sort posts by date
    posts.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Search index generated at ${OUTPUT_FILE}`);
}

generateSearchIndex();
