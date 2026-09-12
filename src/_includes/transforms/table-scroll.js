export function processTableScroll(html) {
  if (!html.includes('<table')) return html;
  return html.replace(/<table[\s\S]*?<\/table>/gi, (t) => `<div class="table-wrap">${t}</div>`);
}
