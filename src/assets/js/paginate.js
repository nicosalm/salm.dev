(function() {
    document.querySelectorAll('[data-paginate]').forEach((list) => {
        const size = Number(list.dataset.paginate);
        const items = [...list.children].filter((el) => !el.hasAttribute('data-paginate-fixed'));
        const pages = Math.ceil(items.length / size);
        if (!size || pages < 2) return;

        const pager = document.createElement('nav');
        pager.className = 'pager';
        pager.setAttribute('aria-label', list.dataset.paginateLabel || 'pages');

        const pills = [];
        for (let i = 0; i < pages; i++) {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'page-pill';
            pill.textContent = i + 1;
            pill.addEventListener('click', () => show(i, true));
            pager.appendChild(pill);
            pills.push(pill);
        }
        list.after(pager);

        function show(page, scroll) {
            items.forEach((el, i) => {
                el.hidden = Math.floor(i / size) !== page;
            });
            pills.forEach((pill, i) => {
                pill.classList.toggle('active', i === page);
                if (i === page) pill.setAttribute('aria-current', 'page');
                else pill.removeAttribute('aria-current');
            });
            if (scroll && list.getBoundingClientRect().top < 0) list.scrollIntoView({ block: 'start' });
        }

        show(0, false);
    });
})();
