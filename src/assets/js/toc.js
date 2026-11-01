(function() {
    const article = document.querySelector('article');
    if (!article) return;

    const headings = article.querySelectorAll('h2, h3');
    if (headings.length < 2) return;

    const tocWrapper = document.createElement('details');
    tocWrapper.className = 'toc-wrapper';
    tocWrapper.open = window.innerWidth >= 1200;

    const summary = document.createElement('summary');
    summary.textContent = 'Contents';
    tocWrapper.appendChild(summary);

    const tocList = document.createElement('ul');
    tocList.className = 'toc';

    headings.forEach(function(heading) {
        const li = document.createElement('li');
        li.className = 'toc-' + heading.tagName.toLowerCase();

        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;

        li.appendChild(link);
        tocList.appendChild(li);
    });

    tocWrapper.appendChild(tocList);

    const introSelector = '.post-header, .authors-note';
    let insertBefore = null;
    for (const child of article.children) {
        if (!child.matches(introSelector)) {
            insertBefore = child;
            break;
        }
    }
    if (insertBefore) {
        article.insertBefore(tocWrapper, insertBefore);
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
