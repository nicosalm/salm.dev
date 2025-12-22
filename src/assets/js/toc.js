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

    headings.forEach(function(heading, index) {
        if (!heading.id) {
            heading.id = 'heading-' + index;
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
})();
