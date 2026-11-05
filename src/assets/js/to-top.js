(function() {
    const toTop = document.createElement('a');
    toTop.className = 'to-top';
    toTop.href = '#top';
    toTop.textContent = 'top';
    toTop.hidden = true;
    document.body.appendChild(toTop);

    let queued = false;

    function update() {
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
