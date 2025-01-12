import React, { useState, useEffect } from 'react';

import type { Book } from '../../types/books';

const initialBooks: Book[] = [
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    rating: 4,
    year: 2017,
    tags: ["distributed-systems", "databases"],
    description: "A deep dive into the principles and practicalities of modern data systems, covering distributed systems, databases, and scalability.",
    link: "https://dataintensive.net/"
  },
  {
    title: "Operating Systems: Three Easy Pieces",
    author: "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    rating: 5,
    year: 2018,
    tags: ["cs", "operating-systems"],
    description: "A modern, comprehensive introduction to operating systems, broken into three fundamental pieces: virtualization, concurrency, and persistence.",
    link: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson, Gerald Jay Sussman",
    rating: 2,
    year: 1985,
    tags: ["cs", "programming"],
    description: "A fundamental text on principles of programming and computer science.",
    link: "https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book.html"
  },
  {
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    rating: 2,
    year: 2015,
    tags: ["interviews", "algorithms", "career"],
    description: "A comprehensive guide to technical interviews, featuring algorithm problems, behavioral interview preparation, and general career advice. While the behavioral content remains valuable, some technical content has become dated post-COVID.",
    link: "https://www.crackingthecodinginterview.com/"
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    rating: 4,
    year: 1999,
    tags: ["software-engineering", "programming", "best-practices"],
    description: "A collection of practical programming wisdom covering topics from basic tools to software design, emphasizing pragmatic approaches to development.",
    link: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/"
  },
  {
    title: "The Soul of a New Machine",
    author: "Tracy Kidder",
    rating: 4,
    year: 1981,
    tags: ["history", "hardware", "technology"],
    description: "A Pulitzer Prize-winning account of the development of a new computer at Data General Corporation, offering a compelling narrative about technology, innovation, and the people behind it.",
    link: "https://www.littlebrown.com/titles/tracy-kidder/the-soul-of-a-new-machine/9780316491976/"
  }
];

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>(initialBooks);
  const [currentSort, setCurrentSort] = useState<'title' | 'rating' | 'year'>('title');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = [...books];

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    switch (currentSort) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'year':
        filtered.sort((a, b) => a.year - b.year);
        break;
    }

    setDisplayedBooks(filtered);
  }, [searchTerm, currentSort, books]);

  const renderStars = (rating: number) => {
    const stars = "★".repeat(rating);
    return (
      <span className={rating === 5 ? "text-yellow-500" : "text-red-500"}>
        [{stars}]
      </span>
    );
  };

  return (
    <div className="space-y-8 font-iosevka">
      {/* search input box */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-neutral-900 border-none outline-none text-white font-ibm-vga focus:ring-0 text-sm p-3"
        placeholder="Type to search books..."
      />

      {/* sort controls */}
      <div className="flex gap-4 font-ibm-vga">
        {[
          { key: 'title' as const, label: 'TITLE' },
          { key: 'rating' as const, label: 'RATING' },
          { key: 'year' as const, label: 'YEAR' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCurrentSort(key)}
            className={`
              relative px-4 py-1 transition-all duration-200
              ${currentSort === key
                ? 'text-cyan-400 border border-cyan-400'
                : 'text-neutral-400 border border-transparent'}
              hover:text-cyan-400 hover:border-cyan-400
            `}
          >
            <span className="relative z-10">
              [{label}]
            </span>
            {currentSort === key && (
              <div className="absolute inset-0 bg-cyan-400/10 animate-glow"></div>
            )}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* list */}
      <div className="space-y-12">
        {displayedBooks.map((book, index) => (
          <div key={book.title} className="relative">
            <div className="space-y-3">
              <h3 className="font-ibm-vga">
                <a href={book.link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-cyan-400 hover:text-cyan-300">
                  {book.title}
                </a>
              </h3>

              <div className="flex items-center gap-4 text-neutral-400">
                <span>{book.author}</span>
                <span className="text-red-500"># {book.year}</span>
                {renderStars(book.rating)}
              </div>

              <p className="text-neutral-500 text-sm leading-relaxed">{book.description}</p>

              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <span key={tag} className="text-cyan-300 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* divider line thing */}
            {index < displayedBooks.length - 1 && (
              <div className="h-px bg-neutral-800 mt-6"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;
