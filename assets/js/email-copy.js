document.querySelectorAll('[data-email]').forEach(function(el) {
    el.setAttribute('role', 'button');
    el.style.cursor = 'pointer';
    var label = el.querySelector('.copy-label');
    if (!label) el.title = 'copy email';
    var timer;
    el.addEventListener('click', function(ev) {
        ev.preventDefault();
        var e = el.dataset.email.split('').reverse().join('');
        navigator.clipboard.writeText(e);
        if (label) label.textContent = 'copied'; else el.title = 'copied';
        clearTimeout(timer);
        timer = setTimeout(function() {
            if (label) label.textContent = 'copy'; else el.title = 'copy email';
        }, 2000);
    });
});
