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
  cp src/assets/88x31/88x31.jpg dist/88x31.jpg
  cp src/404.html dist/
}

has_math_content() {
  local file="$1"
  grep -q -E '(^|[[:space:][:punct:]])\$[^\$\n]{1,100}\$' "$file" && return 0
  grep -q -E '\$\$[^$\n]+\$\$' "$file" && return 0
  grep -q -E '\\begin\{(equation|align|math|displaymath)\*?\}' "$file" && return 0
  grep -q -E '\\[\(\)\[\]]' "$file" && return 0
  return 1
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

  local math_flag=""
  if has_math_content "$mdfile"; then
      math_flag="-V has_math=true"
      echo "Math content detected in $name"
  fi

  pandoc "$mdfile" --standalone --template=src/templates/post.html --mathjax \
    -o "dist/writing/$name/index.html" -V title="$title" -V date="$date" $math_flag

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
    <style>
        .post-link {
            position: relative;
            display: inline-block;
        }

        .post-link[data-description]:hover::after {
            content: attr(data-description);
            position: absolute;
            left: 0;
            top: 100%;
            margin-top: 5px;
            z-index: 1;
            width: 320px;
            background-color: #fff;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            color: #555;
            font-size: 0.9rem;
            line-height: 1.4;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div>
        <header><a href="/">home</a> / writing</header>
        <h1>writing (<a href="../rss.xml">RSS</a>)</h1>
        <p>My programming adventures, unfiltered thoughts, and current obsessions.</p>
        <ul>
HTML
  (IFS=$'\n'; sort -r <<<"${POSTS[*]}") | while IFS="|" read -r date date_rfc title name desc; do
    local escaped_desc=$(escape "$desc")
    echo "<li>$date :: <a href=\"/writing/$name/\" class=\"post-link\" data-description=\"$escaped_desc\">$title</a></li>" >> dist/writing/index.html
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

inline_css() {
  css_content=$(cat dist/styles/styles.css)
  find dist -name "*.html" | while read -r html_file; do
    if grep -q '<link rel="stylesheet" href="/styles/styles.css">' "$html_file"; then
      tmp_file=$(mktemp)

      awk '{
        if ($0 ~ /<link rel="stylesheet" href="\/styles\/styles.css">/) {
          print "<style>"
          system("cat dist/styles/styles.css")
          print "</style>"
        } else {
          print $0
        }
      }' "$html_file" > "$tmp_file"

      mv "$tmp_file" "$html_file"
    fi
  done
  echo "CSS has been inlined."
}

NOW=$(date "+%a, %d %b %Y %H:%M:%S %z")
POSTS=()

setup_directories

for dir in src/writing/*/; do
  process_post "$dir"
done

generate_posts_index
generate_rss_feed "$NOW"
inline_css

echo "-- build done! --"
