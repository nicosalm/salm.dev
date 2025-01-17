// TableOfContents.tsx
import React, { useState, useEffect } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const createId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector('.prose');
    if (!article) return;

    const elements = Array.from(article.querySelectorAll('h2, h3')) as HTMLHeadingElement[];
    const headingData: Heading[] = elements.map(heading => ({
      id: heading.id || createId(heading.textContent || ''),
      text: heading.textContent || '',
      level: parseInt(heading.tagName.substring(1)),
    }));

    elements.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = headingData[index].id;
      }
    });

    setHeadings(headingData);

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-20% 0% -35% 0%'
    });

    elements.forEach(element => observer.observe(element));

    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClickScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    }
  };

  if (headings.length === 0) return null;

  const tocContent = (
    <nav>
      {headings.map(heading => <a key={heading.id} href={`#${heading.id}`} className={`block mb-2 transition-colors ${heading.level === 2 ? 'ml-0' : 'ml-4'} ${activeId === heading.id ? 'text-cyan-400' : 'text-neutral-400 hover:text-cyan-400'}`} onClick={(e) => handleClickScroll(e, heading.id)}><span className="text-red-500 mr-2">{heading.level === 2 ? '##' : '>>>'}</span>{heading.text}</a>)}
    </nav>
  );

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed right-4 bottom-4 z-30 bg-black border border-neutral-800 p-3 text-red-500 font-ibm-vga text-sm flex items-center gap-2 appearance-none" style={{ WebkitTapHighlightColor: 'transparent', WebkitAppearance: 'none', backgroundColor: '#000000' }}><span>{isOpen ? '×' : '$'}</span><span>TOC</span></button>

      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-20 bg-black border-t border-neutral-800 transform transition-transform duration-300 font-ibm-vga text-sm ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="text-red-500 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><span>$</span><span>TABLE_OF_CONTENTS</span></div>
            <button onClick={() => setIsOpen(false)} className="text-red-500 hover:text-red-400">[ESC]</button>
          </div>
          {tocContent}
        </div>
      </div>

      <div className="hidden lg:block fixed right-4 top-32 w-64 max-h-[calc(100vh-10rem)] overflow-y-auto font-ibm-vga text-sm z-10">
        <div className="border border-neutral-800 bg-black p-4">
          <div className="text-red-500 mb-4 flex items-center gap-2"><span>$</span><span>TABLE_OF_CONTENTS</span></div>
          {tocContent}
        </div>
      </div>
    </>
  );
};

export default TableOfContents;
