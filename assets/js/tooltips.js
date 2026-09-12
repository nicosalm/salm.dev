(function() {
    const SEL = 'a[data-host], abbr[data-tip]';

    document.querySelectorAll('abbr[title]').forEach((el) => {
        el.dataset.tip = el.title;
        el.setAttribute('aria-label', el.title);
        el.removeAttribute('title');
    });

    const tip = document.createElement('div');
    tip.className = 'cursor-tip';
    tip.setAttribute('aria-hidden', 'true');
    const tab = document.createElement('span');
    tab.className = 'tip-tab';
    const box = document.createElement('span');
    box.className = 'tip-box';
    tip.append(tab, box);
    document.body.appendChild(tip);

    let active = null;

    function label(raw) {
        try {
            return new URL(raw).hostname.replace(/^www\./, '') || raw;
        } catch {
            return raw;
        }
    }

    function fill(el) {
        const url = el.dataset.url;
        tip.classList.toggle('tabbed', !!url);
        if (url) tab.textContent = label(url);
        box.textContent = el.dataset.host || el.dataset.tip;
    }

    function place(x, y) {
        const pad = 8;
        const w = tip.offsetWidth;
        const h = tip.offsetHeight;
        let left = x + 14;
        let top = y - h - 3;
        if (left + w > window.innerWidth - pad) left = x - w - 14;
        if (left < pad) left = pad;
        if (top < pad) top = y + 22;
        tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    }

    document.addEventListener('mouseover', (ev) => {
        const el = ev.target.closest(SEL);
        if (!el || el === active) return;
        active = el;
        fill(el);
        tip.classList.add('visible');
        place(ev.clientX, ev.clientY);
    });

    document.addEventListener('mousemove', (ev) => {
        if (!active) return;
        if (!ev.target.closest(SEL)) {
            active = null;
            tip.classList.remove('visible');
            return;
        }
        place(ev.clientX, ev.clientY);
    });

    document.addEventListener('mouseout', (ev) => {
        if (active && !ev.relatedTarget?.closest?.(SEL)) {
            active = null;
            tip.classList.remove('visible');
        }
    });

    document.addEventListener('focusin', (ev) => {
        const el = ev.target.closest(SEL);
        if (!el) return;
        if (el.matches(':hover')) return;
        const r = el.getBoundingClientRect();
        active = el;
        fill(el);
        tip.classList.add('visible');
        place(r.right, r.bottom);
    });

    document.addEventListener('mousedown', () => {
        active = null;
        tip.classList.remove('visible');
    });

    document.addEventListener('focusout', () => {
        active = null;
        tip.classList.remove('visible');
    });

    window.addEventListener('scroll', () => {
        if (active) { active = null; tip.classList.remove('visible'); }
    }, { passive: true });
})();
