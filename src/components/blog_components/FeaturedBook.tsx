import React from 'react';
import type { Book } from '../../types/books';

interface FeaturedBookProps {
    book: Book & {
        image: {
            url: string;
            alt: string;
        };
    };
}

const FeaturedBook: React.FC<FeaturedBookProps> = ({ book }) => {
    const renderStars = (rating: number) => {
        const stars = "★".repeat(rating);
        return (
            <span className={rating === 5 ? "text-yellow-500" : "text-red-500"}>
                [{stars}]
            </span>
        );
    };

    return (
        <div className="border border-neutral-800 bg-neutral-900/50 p-6 my-8">
            <div className="flex flex-col sm:flex-row gap-6">
                {/* image section */}
                <div className="sm:w-48 flex-shrink-0 flex items-center">
                    <img
                        src={book.image.url}
                        alt={book.image.alt}
                        className="w-full object-contain"
                        style={{ maxHeight: '256px' }}
                    />
                </div>
                {/* begin content */}
                <div className="flex-1 space-y-4">
                    {/* title section */}
                    <h3 className="font-ibm-vga text-xl">
                        <a href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300">
                            {book.title}
                        </a>
                    </h3>

                    {/* book metadata here */}
                    <div className="flex flex-wrap items-center gap-4 text-neutral-400 font-ibm-vga">
                        <span>{book.author}</span>
                        <span className="text-red-500"># {book.year}</span>
                        {renderStars(book.rating)}
                    </div>

                    {/* desc */}
                    <p className="text-neutral-300 text-sm leading-relaxed">{book.description}</p>

                    {/* tags */}
                    <div className="flex flex-wrap gap-2">
                        {book.tags.map((tag) => (
                            <span key={tag} className="text-cyan-300 text-sm font-ibm-vga">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* go to book site link */}
                    {book.link && (
                        <div className="pt-2">
                            <a
                                href={book.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-500 hover:text-red-400 font-ibm-vga group inline-flex items-center gap-2"
                            >
                                <span>Read more</span>
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeaturedBook;
