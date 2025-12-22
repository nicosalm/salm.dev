(function() {
    const refs = document.querySelectorAll('sup.fnref[data-sidenote]');
    const notes = document.querySelectorAll('span.footnote[data-sidenote]');

    const noteMap = new Map();
    notes.forEach(note => noteMap.set(note.dataset.sidenote, note));

    const refMap = new Map();
    refs.forEach(ref => refMap.set(ref.dataset.sidenote, ref));

    refs.forEach(ref => {
        const note = noteMap.get(ref.dataset.sidenote);
        const link = ref.querySelector('a');
        if (note && link) {
            ref.addEventListener('mouseenter', () => note.classList.add('hover'));
            ref.addEventListener('mouseleave', () => note.classList.remove('hover'));
        }
    });

    notes.forEach(note => {
        const ref = refMap.get(note.dataset.sidenote);
        if (ref) {
            const link = ref.querySelector('a');
            note.addEventListener('mouseenter', () => { if (link) link.classList.add('hover'); });
            note.addEventListener('mouseleave', () => { if (link) link.classList.remove('hover'); });
        }
    });
})();
