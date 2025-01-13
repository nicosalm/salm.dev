import { useState } from 'react';

interface Post {
  slug: string;
  data: {
    title: string;
    description?: string;
    pubDate: string;
    tags: string[];
  };
  body: string;
}

interface Props {
  initialCategories: {
    [key: string]: {
      count: number;
      posts: Post[];
    };
  };
}

export default function CategoryFilter({ initialCategories }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'OR' | 'AND'>('OR');
  const [showAllTags, setShowAllTags] = useState(false);

  const allTags = Object.entries(initialCategories)
    .sort((a, b) => {
      if (b[1].count === a[1].count) {
        return a[0].localeCompare(b[0]);
      }
      return b[1].count - a[1].count;
    });

  // split tags into primary and secondary
  const PRIMARY_TAG_COUNT = 5;
  const primaryTags = allTags.slice(0, PRIMARY_TAG_COUNT);
  const secondaryTags = allTags.slice(PRIMARY_TAG_COUNT);
  const hasMoreTags = secondaryTags.length > 0;
  const visibleTags = showAllTags ? allTags : primaryTags;

  const toggleTag = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    if (selectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);
  };

  const filteredCategories = allTags.filter(([tag]) => {
    if (selectedTags.size === 0) return true;
    return selectedTags.has(tag);
  });

  const getFilteredPosts = (posts: Post[]) => {
    if (selectedTags.size === 0) return posts;

    return posts.filter(post => {
      const postTags = new Set(post.data.tags);
      if (filterMode === 'OR') {
        return Array.from(selectedTags).some(tag => postTags.has(tag));
      } else {
        return Array.from(selectedTags).every(tag => postTags.has(tag));
      }
    });
  };

  return (
    <div className="pb-16">
      <div className="mb-8">
        {/* filter controls */}
        <div className="pb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-white font-ibm-vga">Filter by tags:</span>
            <div className="min-w-[100px]">
              {selectedTags.size > 0 && (
                <button
                  onClick={() => setSelectedTags(new Set())}
                  className="px-3 py-1 text-sm bg-red-900/20 text-red-500 rounded hover:text-red-400 font-ibm-vga border border-red-900/30"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Tags and Mode selector */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setFilterMode(mode => mode === 'OR' ? 'AND' : 'OR')}
                className="px-3 py-1 text-sm bg-cyan-950 text-cyan-400 rounded hover:text-cyan-300 font-ibm-vga border border-cyan-900/30 shrink-0"
              >
                Mode: {filterMode}
              </button>
              {visibleTags.map(([tag, { count }]) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded font-ibm-vga text-sm transition-colors border max-w-[200px] truncate ${
                    selectedTags.has(tag)
                      ? 'bg-neutral-900 text-cyan-400 border-neutral-800 hover:text-cyan-300'
                      : 'bg-neutral-900 text-white border-neutral-800 hover:text-cyan-400'
                  }`}
                  title={`#${tag} (${count})`}
                >
                  #{tag} ({count})
                </button>
              ))}
            </div>

            {hasMoreTags && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-neutral-500 hover:text-white text-sm font-ibm-vga mt-4"
              >
                {showAllTags ? '← Show Less' : `Show ${secondaryTags.length} More Tags →`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* posts */}
      <div className="space-y-8">
        {filteredCategories.map(([tag, { posts }]) => {
          const filteredPosts = getFilteredPosts(posts);
          if (selectedTags.size > 0 && filteredPosts.length === 0) return null;

          return (
            <section key={tag}>
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-xl sm:text-2xl font-ibm-vga text-white">#{tag}</h2>
                <div className="h-px bg-red-500 flex-grow"></div>
                <span className="text-neutral-500 font-ibm-vga text-sm sm:text-base">
                  {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="pl-2 sm:pl-4 border-l border-neutral-800 font-ibm-vga space-y-3 sm:space-y-2">
                {filteredPosts
                  .sort((a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf())
                  .map(post => (
                    <div key={post.slug} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
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
                    </div>
                  ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
