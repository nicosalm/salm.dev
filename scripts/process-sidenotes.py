#!/usr/bin/env python3

import sys
import re
from html.parser import HTMLParser
from html import unescape

class SidenoteProcessor:
    def __init__(self, html_content):
        self.html = html_content
        self.footnotes = {}

    def extract_footnotes(self):
        """Extract all footnotes from the footnotes section"""
        # Match footnotes - capture content before the backlink
        footnote_pattern = r'<li id="(fn\d+)"><p>(.*?)<a[^>]*class="footnote-back"[^>]*>.*?</a>\s*</p>\s*</li>'
        matches = re.finditer(footnote_pattern, self.html, re.DOTALL)

        for match in matches:
            fn_id = match.group(1)
            content = match.group(2).strip()
            self.footnotes[fn_id] = content

    def process(self):
        """Convert footnotes to sidenotes"""
        self.extract_footnotes()

        if not self.footnotes:
            return self.html

        # Replace each footnote reference with inline sidenote
        def replace_ref(match):
            fn_id = match.group(1)
            fn_num = match.group(2)

            if fn_id in self.footnotes:
                content = self.footnotes[fn_id]
                # Create inline footnote span like RedPenguin's style
                sidenote = f'<sup class="fnref"><a href="#{fn_id}" id="note{fn_num}" title="Footnote {fn_num}">{fn_num}</a></sup><span class="footnote" id="{fn_id}"><a class="fnref" href="#note{fn_num}" title="Footnote {fn_num} Reference">{fn_num}</a> {content}</span>'
                return sidenote
            return match.group(0)

        # Find and replace footnote references (handle newlines in HTML)
        ref_pattern = r'<a\s+href="#(fn\d+)"\s+class="footnote-ref"\s+id="fnref\d+"\s+role="doc-noteref"><sup>(\d+)</sup></a>'
        result = re.sub(ref_pattern, replace_ref, self.html, flags=re.DOTALL)

        # Remove the footnotes section
        result = re.sub(
            r'<section id="footnotes"[^>]*>.*?</section>',
            '',
            result,
            flags=re.DOTALL
        )

        return result

def main():
    if len(sys.argv) != 2:
        print("Usage: process-sidenotes.py <html-file>")
        sys.exit(1)

    filepath = sys.argv[1]

    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    processor = SidenoteProcessor(html)
    result = processor.process()

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(result)

if __name__ == '__main__':
    main()
