(function() {
    const article = document.querySelector('article');
    if (!article) return;

    const headings = article.querySelectorAll('h2, h3');
    if (headings.length < 2) return;

    const tocWrapper = document.createElement('details');
    tocWrapper.className = 'toc-wrapper';
    tocWrapper.open = true;

    const summary = document.createElement('summary');
    summary.textContent = 'Contents';
    tocWrapper.appendChild(summary);

    const tocList = document.createElement('ul');
    tocList.className = 'toc';

    function slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const usedIds = new Set();
    article.querySelectorAll('[id]').forEach(function(el) {
        usedIds.add(el.id);
    });

    headings.forEach(function(heading, index) {
        if (!heading.id) {
            const base = slugify(heading.textContent) || ('heading-' + index);
            let id = base;
            let n = 2;
            while (usedIds.has(id)) {
                id = base + '-' + n;
                n++;
            }
            heading.id = id;
            usedIds.add(id);
        }

        const li = document.createElement('li');
        li.className = 'toc-' + heading.tagName.toLowerCase();

        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;

        li.appendChild(link);
        tocList.appendChild(li);
    });

    tocWrapper.appendChild(tocList);

    const firstElement = article.firstElementChild;
    if (firstElement) {
        article.insertBefore(tocWrapper, firstElement);
    } else {
        article.appendChild(tocWrapper);
    }

    function positionAuthorsNote() {
        const note = document.querySelector('.authors-note');
        if (!note) return;

        if (window.innerWidth >= 1200) {
            const tocHeight = tocWrapper.offsetHeight;
            note.style.top = (tocHeight + 16) + 'px';
        } else {
            note.style.top = '';
        }
    }

    positionAuthorsNote();
    window.addEventListener('resize', positionAuthorsNote);
    tocWrapper.addEventListener('toggle', positionAuthorsNote);
})();
