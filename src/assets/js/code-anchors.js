(function() {
    const article = document.querySelector('article');
    if (!article) return;

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

    article.querySelectorAll('h2, h3, h4').forEach((heading, i) => {
        if (!heading.id) {
            const base = slugify(heading.textContent) || ('h-' + i);
            let id = base;
            let n = 2;
            while (usedIds.has(id)) {
                id = base + '-' + n;
                n++;
            }
            heading.id = id;
            usedIds.add(id);
        }
        if (heading.querySelector('.heading-anchor')) return;
        const a = document.createElement('a');
        a.className = 'heading-anchor';
        a.href = '#' + heading.id;
        a.setAttribute('aria-hidden', 'true');
        a.textContent = '[\u00a7]';
        heading.appendChild(a);
    });

    const blocks = article.querySelectorAll('pre > code');
    if (!blocks.length) return;

    blocks.forEach((code, blockIdx) => {
        const blockId = 'cb' + (blockIdx + 1);
        const pre = code.closest('pre');
        pre.id = blockId;

        const rawText = code.textContent.trimEnd();

        const lines = code.innerHTML.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();

        code.innerHTML = lines.map((line, i) => {
            const id = blockId + '-' + (i + 1);
            return '<span id="' + id + '"><a href="#' + id + '" aria-hidden="true" tabindex="-1"></a>' + line + '</span>';
        }).join('');

        const btn = document.createElement('button');
        btn.className = 'copy-button';
        btn.textContent = 'copy';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(rawText).then(() => {
                btn.textContent = 'copied';
                setTimeout(() => { btn.textContent = 'copy'; }, 2000);
            }).catch(() => {
                btn.textContent = 'error';
                setTimeout(() => { btn.textContent = 'copy'; }, 2000);
            });
        });
        pre.appendChild(btn);
    });
})();
