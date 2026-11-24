const EXTERNAL_LINK =
    /<a\s((?:"[^"]*"|'[^']*'|[^>"'])*href="https?:\/\/[^"]*"(?:"[^"]*"|'[^']*'|[^>"'])*)>([\s\S]*?)<\/a>/gi;
const NEW_TAB = 'target="_blank"';

function host(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "") || null;
    } catch {
        return null;
    }
}

function isTextLink(inner) {
    return !/<(?:img|picture|svg)\b/i.test(inner) && inner.replace(/<[^>]*>/g, "").trim() !== "";
}

export function processExternalLinks(html, siteHost) {
    return html.replace(EXTERNAL_LINK, (whole, attrs, inner) => {
        const hostname = host(attrs.match(/href="([^"]*)"/i)[1]);
        if (!hostname) return whole;
        const added = [];
        if (hostname !== siteHost && !/(?:^|\s)target=/i.test(attrs)) added.push(NEW_TAB);
        if (!/data-host=/i.test(attrs) && isTextLink(inner)) added.push(`data-host="${hostname}"`);
        return added.length ? `<a ${attrs} ${added.join(" ")}>${inner}</a>` : whole;
    });
}
