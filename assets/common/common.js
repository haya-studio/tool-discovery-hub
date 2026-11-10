/* Shared directory behavior. Content is pre-rendered; no HTML is injected from search input. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const form = document.getElementById('filters');
  if (form) {
    const fields = ['q', 'category', 'pricing', 'signup'];
    for (const name of fields) {
      const field = form.elements.namedItem(name);
      const value = params.get(name) || '';
      if (field instanceof HTMLSelectElement) {
        field.value = [...field.options].some(option => option.value === value) ? value : '';
      } else field.value = value;
    }
    const cards = [...document.querySelectorAll('.tool-card')];
    const update = () => {
      const values = Object.fromEntries(fields.map(name => [name, form.elements.namedItem(name).value]));
      const words = values.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      for (const card of cards) {
        const matches = words.every(word => card.dataset.search.includes(word)) &&
          ['category', 'pricing', 'signup'].every(name => !values[name] || card.dataset[name] === values[name]);
        card.hidden = !matches;
        if (matches) count++;
      }
      document.getElementById('result-count').textContent = `${count} ${count === 1 ? 'tool' : 'tools'} found`;
      document.getElementById('empty-state').hidden = count !== 0;
      const next = new URLSearchParams();
      for (const name of fields) if (values[name]) next.set(name, values[name]);
      history.replaceState(null, '', location.pathname + (next.size ? '?' + next : '') + location.hash);
    };
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', event => { event.preventDefault(); update(); });
    form.addEventListener('reset', () => { setTimeout(update, 0); });
    window.addEventListener('popstate', () => location.reload());
    update();
  }
  const problemGrid = document.getElementById('problem-grid');
  if (problemGrid) {
    const category = params.get('category') || '';
    const items = [...problemGrid.querySelectorAll('[data-problem-category]')];
    const valid = items.some(item => item.dataset.problemCategory === category);
    for (const item of items) item.hidden = valid && item.dataset.problemCategory !== category;
    for (const link of document.querySelectorAll('.category-tabs a')) {
      if ((new URL(link.href).searchParams.get('category') || '') === (valid ? category : '')) link.setAttribute('aria-current', 'page');
    }
  }
})();
