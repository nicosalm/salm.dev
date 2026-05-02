<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
      <link rel="stylesheet" href="/styles/styles.css"/>
    </head>
    <body>
      <header class="site-header">
        <a href="/" class="site-title">salm.dev</a>
        <nav>
          <a href="/writing">writing</a><span class="sep">|</span><a
          href="/about">about</a><span class="sep">|</span><a
          href="/friends">friends</a><span class="sep">|</span><a
          href="/status">status</a><span class="sep">|</span><a
          href="https://github.com/nicosalm/">github</a>
        </nav>
      </header>
      <main>
        <h1>RSS Feed</h1>
        <p>This is an RSS feed. Copy the URL into your feed reader to subscribe. Learn more about RSS at <a href="https://aboutfeeds.com">aboutfeeds.com</a>.</p>
        <ul class="post-list">
          <xsl:for-each select="/rss/channel/item">
            <li class="post-item">
              <a class="post-link">
                <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
              <span class="dot-leader"></span>
              <time class="post-date"><xsl:value-of select="substring(pubDate, 5, 7)"/></time>
            </li>
          </xsl:for-each>
        </ul>
      </main>
    </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
