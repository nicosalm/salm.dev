export function processSidenotes(html) {
  if (!html.includes('footnote-item')) return html;

  const footnotes = {};
  const footnotePattern = /<li id="(fn[\w-]+)"[^>]*class="footnote-item"[^>]*>([\s\S]*?)<\/li>/gi;

  let liMatch;
  while ((liMatch = footnotePattern.exec(html)) !== null) {
    const fnId = liMatch[1];
    let content = liMatch[2];
    content = content.replace(/<a[^>]*class="footnote-backref"[^>]*>[\s\S]*?<\/a>/gi, '');
    content = content.replace(/^\s*<p>([\s\S]*)<\/p>\s*$/i, '$1');
    content = content.trim();
    const snId = fnId.replace(/^fn/, 'sn');
    footnotes[snId] = content;
  }

  if (Object.keys(footnotes).length === 0) {
    return html;
  }

  const refPattern = /<sup class="footnote-ref"><a href="#(fn[\w-]+)" id="(fnref[\w-]+)"[^>]*>\[?(\d+)\]?<\/a><\/sup>/gi;

  return html.replace(refPattern, (original, fnId, fnRefId, fnNum) => {
    const snId = fnId.replace(/^fn/, 'sn');
    const content = footnotes[snId];
    if (!content) return original;
    return `<sup class="fnref" data-sidenote="${snId}"><a href="#${fnId}" id="${fnRefId}" title="Sidenote ${fnNum}">${fnNum}</a></sup><span class="footnote" id="${snId}" data-sidenote="${snId}"><a class="fnref" href="#${fnRefId}" title="Sidenote ${fnNum} Reference">${fnNum}</a> ${content}</span>`;
  });
}
