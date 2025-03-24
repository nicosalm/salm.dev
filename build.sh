#!/bin/bash

escape() {
  echo "$1" | sed '
    s/&/\&amp;/g;
    s/</\&lt;/g;
    s/>/\&gt;/g;
    s/"/\&quot;/g;
    s/'"'"'/\&apos;/g
  '
}

format_date_rfc() {
  local date_str="$1"
  if [ -n "$date_str" ]; then
    date -d "$date_str" "+%a, %d %b %Y %H:%M:%S %z" 2>/dev/null ||                  # 1. GNU
    date -j -f "%Y-%m-%d" "$date_str" "+%a, %d %b %Y %H:%M:%S %z" 2>/dev/null ||    # 2. BSD
    echo "Thu, 01 Jan 1970 00:00:00 +0000"                                          # 3. Linux epoch time (RFC format)
  else
    echo "Thu, 01 Jan 1970 00:00:00 +0000"
  fi
}

setup_directories() {
  rm -rf dist
  mkdir -p dist/{writing,about,assets,styles}
  cp -r src/assets/* dist/assets/
  cp -r src/styles/* dist/styles/
  cp src/index.html dist/
  cp src/about/index.html dist/about/
  cp src/assets/favicon.svg dist/assets/
}

process_post() {
  local dir="$1"
  local name=$(basename "$dir")
  local mdfile="${dir}index.md"

  [ ! -f "$mdfile" ] && return

  mkdir -p "dist/writing/$name"

  local title=$(head -n 1 "$mdfile" | sed 's/^# //')
  local date=$(grep -m 1 "Date:" "$mdfile" | sed 's/Date: //')

  local date_rfc=$(format_date_rfc "$date")
  [ -z "$date" ] && date="1970-01-01"

  local desc=$(grep -m 1 "^>" "$mdfile" | sed 's/^> //')
  [ -z "$desc" ] && desc="Read more at salm.dev"

  POSTS+=("$date|$date_rfc|$title|$name|$desc")

  pandoc "$mdfile" --standalone --template=src/templates/post.html --mathjax \
      -o "dist/writing/$name/index.html" -V title="$title" -V date="$date"

  if [ -d "${dir}images" ]; then
      mkdir -p "dist/writing/$name/images"
      cp -r "${dir}images/"* "dist/writing/$name/images/" 2>/dev/null || true
  fi
}

generate_posts_index() {
  cat > dist/writing/index.html << HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="stylesheet" href="/styles/styles.css">
    <link rel="alternate" type="application/rss+xml" title="rss feed | salm.dev" href="/rss.xml">
    <title>writing | salm.dev</title>
</head>
<body>
    <div>
        <header><a href="/">home</a> / writing</header>
        <h1>Writing (<a href="../rss.xml">RSS</a>)</h1>
        <ul>
HTML

  (IFS=$'\n'; sort -r <<<"${POSTS[*]}") | while IFS="|" read -r date _ title name _; do
    echo "<li>$date :: <a href=\"/writing/$name/\">$title</a></li>" >> dist/writing/index.html
  done

  cat >> dist/writing/index.html << HTML
        </ul>
    </div>
    <footer><p>© 2025 salm.dev</p></footer>
</body>
</html>
HTML
}

generate_rss_feed() {
  local now="$1"
  cat > dist/rss.xml << XML
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>salm.dev</title>
  <link>https://salm.dev</link>
  <description>Hot takes and cool things</description>
  <language>en-us</language>
  <lastBuildDate>$now</lastBuildDate>
  <atom:link href="https://salm.dev/rss.xml" rel="self" type="application/rss+xml" />
XML

  (IFS=$'\n'; sort -r <<<"${POSTS[*]}") | while IFS="|" read -r _ date_rfc title name desc; do
    cat >> dist/rss.xml << XML
  <item>
    <title>$(escape "$title")</title>
    <link>https://salm.dev/writing/$name/</link>
    <guid>https://salm.dev/writing/$name/</guid>
    <pubDate>$date_rfc</pubDate>
    <description><![CDATA[ $(escape "$desc") ]]></description>
  </item>
XML
  done

  echo "</channel></rss>" >> dist/rss.xml
}

NOW=$(date "+%a, %d %b %Y %H:%M:%S %z")
POSTS=()

setup_directories

for dir in src/writing/*/; do
  process_post "$dir"
done

generate_posts_index
generate_rss_feed "$NOW"

echo "-- build done! --"
