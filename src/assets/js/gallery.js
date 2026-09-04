(function() {
    var gallery = document.querySelector('.gallery');
    if (!gallery) return;

    var cards = gallery.querySelectorAll('.gallery-card');
    var filters = document.querySelectorAll('.gallery-filters .category-filter');
    var anyFlipped = false;

    function unflip() {
        if (!anyFlipped) return;
        cards.forEach(function(card) {
            card.classList.remove('flipped');
        });
        anyFlipped = false;
    }

    gallery.addEventListener('click', function(ev) {
        var card = ev.target.closest('.gallery-card');
        if (!card) return;
        card.classList.toggle('flipped');
        anyFlipped = gallery.querySelector('.gallery-card.flipped') !== null;
    });

    window.addEventListener('scroll', unflip, { passive: true });

    filters.forEach(function(filter) {
        filter.addEventListener('click', function() {
            var category = filter.dataset.category;
            filters.forEach(function(other) {
                other.classList.toggle('active', other === filter);
            });
            cards.forEach(function(card) {
                card.classList.toggle('hidden', category !== 'all' && card.dataset.category !== category);
            });
            unflip();
        });
    });
})();
