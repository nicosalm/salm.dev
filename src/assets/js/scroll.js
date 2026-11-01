(function() {
    const root = document.documentElement;

    const toTop = document.createElement('a');
    toTop.className = 'to-top';
    toTop.href = '#top';
    toTop.textContent = 'top';
    toTop.hidden = true;
    document.body.appendChild(toTop);

    let queued = false;

    function update() {
        const max = root.scrollHeight - innerHeight;
        document.body.style.setProperty('--progress', max > 0 ? Math.min(1, scrollY / max) : 1);
        toTop.hidden = scrollY < innerHeight;
        queued = false;
    }

    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
})();
