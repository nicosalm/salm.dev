import { useState, useMemo } from 'react';

interface Post {
  slug: string;
  data: {
    title: string;
    description?: string;
    pubDate: string;
  };
  body: string;
}

interface Props {
  postsByYear: {
    [key: string]: Post[];
  };
}

function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export default function ArchiveFilter({ postsByYear }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());

  const years = useMemo(() =>
    Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a)),
    [postsByYear]
  );

  const toggleYear = (year: string) => {
    const newSelectedYears = new Set(selectedYears);
    if (selectedYears.has(year)) {
      newSelectedYears.delete(year);
    } else {
      newSelectedYears.add(year);
    }
    setSelectedYears(newSelectedYears);
  };

  const filterBySearch = (posts: Post[]) => {
    if (!searchText) return posts;
    const searchLower = searchText.toLowerCase();
    return posts.filter(post =>
      post.data.title.toLowerCase().includes(searchLower)
    );
  };

  // filter years and posts based on selected years and search text
  const visibleYears = years.filter(year =>
    selectedYears.size === 0 || selectedYears.has(year)
  );

  const filteredYears = visibleYears.map(year => {
    const yearPosts = postsByYear[year];
    const filteredPosts = filterBySearch(yearPosts);
    return {
      year,
      posts: filteredPosts,
      count: yearPosts.length
    };
  }).filter(({ posts }) => posts.length > 0);

  return (
    <div className="pb-16">
      <div className="mb-8 space-y-4">
        {/* Fixed-height container for filter controls */}
        <div className="h-20">
          <div className="flex items-center gap-4">
            <span className="text-white font-ibm-vga">Filter by year:</span>
            <div className="min-w-[100px]">
              {selectedYears.size > 0 && (
                <button
                  onClick={() => setSelectedYears(new Set())}
                  className="px-3 py-1 text-sm bg-red-900/20 text-red-500 rounded hover:text-red-400 font-ibm-vga border border-red-900/30"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {years.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-3 py-1 rounded font-ibm-vga text-sm transition-colors border ${
                  selectedYears.has(year)
                    ? 'bg-neutral-900 text-cyan-400 border-neutral-800 hover:text-cyan-300'
                    : 'bg-neutral-900 text-white border-neutral-800 hover:text-cyan-400'
                }`}
              >
                {year} ({postsByYear[year].length})
              </button>
            ))}
          </div>
        </div>

        {/* search input */}
        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3">
          <span className="text-cyan-500"></span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full font-ibm-vga focus:ring-0 text-sm sm:text-base"
            placeholder="Type to search posts..."
          />
        </div>
      </div>

      {/* posts */}
      <div className="space-y-8">
        {filteredYears.map(({ year, posts }) => (
          <section key={year} className="post-section">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-xl sm:text-2xl font-ibm-vga text-white">{year}</h2>
              <div className="h-px bg-red-500 flex-grow"></div>
              <span className="text-neutral-500 font-ibm-vga text-sm sm:text-base">
                {posts.length} post{posts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="pl-2 sm:pl-4 border-l border-neutral-800 font-ibm-vga space-y-3 sm:space-y-2">
              {posts
                .sort((a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf())
                .map(post => (
                  <div key={post.slug} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 post-item">
                    <span className="text-neutral-500 text-sm sm:text-base sm:w-24">
                      {new Date(post.data.pubDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit'
                      })}
                    </span>
                    <div className="flex-grow">
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-white hover:text-cyan-400 text-sm sm:text-base"
                      >
                        {post.data.title}
                      </a>
                      {post.data.description && (
                        <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                          {post.data.description}
                        </p>
                      )}
                    </div>
                    <span className="text-neutral-500 text-sm sm:text-base">
                      ~/time: {calculateReadingTime(post.body || '')} min
                    </span>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
