document.querySelectorAll('[data-email]').forEach(function(el) {
    var address = el.dataset.email.split('').reverse().join('');

    if (el.dataset.emailAction === 'mailto') {
        el.href = 'mailto:' + address;
        el.title = 'email me';
        return;
    }

    el.setAttribute('role', 'button');
    el.style.cursor = 'pointer';

    var label = el.querySelector('.copy-label');
    if (!label) el.title = 'copy email';
    var timer;
    el.addEventListener('click', function(ev) {
        ev.preventDefault();
        navigator.clipboard.writeText(address);
        if (label) label.textContent = 'copied'; else el.title = 'copied';
        clearTimeout(timer);
        timer = setTimeout(function() {
            if (label) label.textContent = 'copy'; else el.title = 'copy email';
        }, 2000);
    });
});
