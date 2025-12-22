export function processSidenotes(html) {
  const footnotes = {};
  const footnotePattern = /<li id="(fn\d+)"[^>]*class="footnote-item"[^>]*>([\s\S]*?)<\/li>/gi;

  let match;
  while ((match = footnotePattern.exec(html)) !== null) {
    const fnId = match[1];
    let content = match[2];
    content = content.replace(/<a[^>]*class="footnote-backref"[^>]*>[\s\S]*?<\/a>/gi, '');
    content = content.replace(/^\s*<p>([\s\S]*)<\/p>\s*$/i, '$1');
    content = content.trim();
    const snId = fnId.replace('fn', 'sn');
    footnotes[snId] = content;
  }

  if (Object.keys(footnotes).length === 0) {
    return html;
  }

  const refPattern = /<sup class="footnote-ref"><a href="#(fn\d+)" id="fnref(\d+)"[^>]*>\[?(\d+)\]?<\/a><\/sup>/gi;

  let result = html.replace(refPattern, (match, fnId, fnRefNum, fnNum) => {
    const snId = fnId.replace('fn', 'sn');
    if (footnotes[snId]) {
      const content = footnotes[snId];
      return `<sup class="fnref" data-sidenote="${snId}"><a href="#${snId}" id="snref${fnNum}" title="Sidenote ${fnNum}">${fnNum}</a></sup><span class="footnote" id="${snId}" data-sidenote="${snId}"><a class="fnref" href="#snref${fnNum}" title="Sidenote ${fnNum} Reference">${fnNum}</a> ${content}</span>`;
    }
    return match;
  });

  result = result.replace(/<hr class="footnotes-sep"[^>]*>/gi, '');
  result = result.replace(/<section class="footnotes"[^>]*>[\s\S]*?<\/section>/gi, '');

  return result;
}
