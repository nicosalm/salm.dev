function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}

export function processLinkHosts(html) {
  return html.replace(/<a\s((?:"[^"]*"|'[^']*'|[^>"'])*href="https?:\/\/[^"]*"(?:"[^"]*"|'[^']*'|[^>"'])*)>([\s\S]*?)<\/a>/gi, (whole, attrs, inner) => {
    if (/data-host=/i.test(attrs)) return whole;
    if (/<(?:img|picture|svg)\b/i.test(inner)) return whole;
    if (!inner.replace(/<[^>]*>/g, '').trim()) return whole;
    const href = attrs.match(/href="([^"]*)"/i);
    const hostname = href && host(href[1]);
    return hostname ? `<a ${attrs} data-host="${hostname}">${inner}</a>` : whole;
  });
}
