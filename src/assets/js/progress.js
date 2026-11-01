(function() {
    const root = document.documentElement;
    let queued = false;

    function update() {
        const max = root.scrollHeight - innerHeight;
        document.body.style.setProperty('--progress', max > 0 ? Math.min(1, scrollY / max) : 1);
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
