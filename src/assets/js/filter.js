(function() {
  const filters = document.querySelectorAll('.category-filter');
  const posts = document.querySelectorAll('.post-item');
  const yearHeadings = document.querySelectorAll('.year-heading');

  if (!filters.length) return;

  function filterByCategory(category) {
    filters.forEach(f => f.classList.remove('active'));
    const activeFilter = document.querySelector(`.category-filter[data-category="${category}"]`);
    if (activeFilter) activeFilter.classList.add('active');

    posts.forEach(post => {
      if (category === 'all' || post.dataset.category === category) {
        post.classList.remove('hidden');
      } else {
        post.classList.add('hidden');
      }
    });

    yearHeadings.forEach(heading => {
      let ul = heading.nextElementSibling;
      while (ul && ul.tagName !== 'UL') {
        ul = ul.nextElementSibling;
      }
      if (ul) {
        const visiblePosts = ul.querySelectorAll('.post-item:not(.hidden)');
        heading.classList.toggle('hidden', visiblePosts.length === 0);
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category');
  if (initialCategory) filterByCategory(initialCategory);

  filters.forEach(filter => {
    filter.addEventListener('click', function() {
      const category = this.dataset.category;
      filterByCategory(category);

      const url = new URL(window.location);
      if (category === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      history.replaceState({}, '', url);
    });
  });
})();
