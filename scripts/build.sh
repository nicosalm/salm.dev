#!/bin/bash

set -euo pipefail

escape() {
  printf '%s' "$1" | sed '
    s/&/\&amp;/g;
    s/</\&lt;/g;
    s/>/\&gt;/g;
    s/"/\&quot;/g;
    s/'"'"'/\&apos;/g
  '
}

format_date_rfc() {
  local date_str="$1"
  if [[ -n "$date_str" ]]; then
    date -d "$date_str" "+%a, %d %b %Y %H:%M:%S %z" 2>/dev/null ||
    date -j -f "%Y-%m-%d" "$date_str" "+%a, %d %b %Y %H:%M:%S %z" 2>/dev/null ||
    echo "Thu, 01 Jan 1970 00:00:00 +0000"
  else
    echo "Thu, 01 Jan 1970 00:00:00 +0000"
  fi
}

setup_directories() {
  rm -rf dist
  mkdir -p dist/{writing,sponsors,about,links,assets,styles}
  cp -r src/assets/* dist/assets/
  cp -r src/styles/* dist/styles/
  cp src/index.html dist/
  cp src/about/index.html dist/about/
  cp src/links/index.html dist/links/
  cp src/sponsors/index.html dist/sponsors/
  cp src/assets/88x31/88x31.gif dist/88x31.gif
  cp src/404.html dist/
}

has_math_content() {
  local file="$1"
  grep -qE '(^|[[:space:][:punct:]])\$[^\$\n]{1,100}\$' "$file" ||
  grep -qE '\$\$[^$\n]+\$\$' "$file" ||
  grep -qE '\\begin\{(equation|align|math|displaymath)\*?\}' "$file" ||
  grep -qE '\\[\(\)\[\]]' "$file"
}

has_code_content() {
  local file="$1"
  grep -qE '^```' "$file" ||
  grep -qE '^    [[:space:]]*[[:alnum:]]' "$file" ||
  grep -qE '`[^`]+`' "$file"
}

is_featured() {
  local file="$1"
  grep -q '<span class="featured">featured</span>' "$file"
}

extract_tags() {
  local mdfile="$1"
  grep -o '<span class="tags">[^<]*</span>' "$mdfile" 2>/dev/null |
  sed 's/<span class="tags">\([^<]*\)<\/span>/\1/' |
  tr ',' '\n' |
  sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

process_post() {
  local dir="$1"
  local name
  name=$(basename "$dir")
  local mdfile="${dir}index.md"

  [[ ! -f "$mdfile" ]] && return

  mkdir -p "dist/writing/$name"

  local title date date_rfc desc tags featured
  title=$(head -n 1 "$mdfile" | sed 's/^# //')
  date=$(grep -o '<span class="date">[^<]*</span>' "$mdfile" | head -1 | sed 's/<span class="date">\([^<]*\)<\/span>/\1/')
  date_rfc=$(format_date_rfc "$date")
  [[ -z "$date" ]] && date="1970-01-01"

  desc=$(awk '/<div class="description">/{flag=1; next} /<span class="date">/{flag=0} flag' "$mdfile" | tr '\n' ' ' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  [[ -z "$desc" ]] && desc="Read more at salm.dev!"

  tags=$(extract_tags "$mdfile")

  if is_featured "$mdfile"; then
    featured="true"
  else
    featured="false"
  fi

  POSTS+=("$date|$date_rfc|$title|$name|$desc|$featured")

  if [[ -n "$tags" ]]; then
    while IFS= read -r tag; do
      [[ -n "$tag" ]] && POST_TAGS+=("$name|$tag")
    done <<< "$tags"
  fi

  local tmpfile
  tmpfile=$(mktemp)
  mv "$tmpfile" "${tmpfile}.md"
  tmpfile="${tmpfile}.md"
  awk '
    /<span class="tags">/ { in_tags = 1 }
    /<\/span>/ && in_tags { in_tags = 0; next }
    /<span class="featured">/ { in_featured = 1 }
    /<\/span>/ && in_featured { in_featured = 0; next }
    !in_tags && !in_featured { print }
  ' "$mdfile" > "$tmpfile"

  local pandoc_cmd="pandoc $tmpfile --standalone --template=src/templates/post.html --reference-location=document"

  if has_math_content "$mdfile"; then
    pandoc_cmd="$pandoc_cmd --mathjax -V has_math=true"
    echo "math detected in $name"
  fi

  if has_code_content "$mdfile"; then
    pandoc_cmd="$pandoc_cmd --highlight-style=pygments"
  fi

  $pandoc_cmd -o "dist/writing/$name/index.html" -V title="$title"

  python3 scripts/process-sidenotes.py "dist/writing/$name/index.html"

  rm "$tmpfile"

  if [[ -d "${dir}images" ]]; then
    mkdir -p "dist/writing/$name/images"
    cp -r "${dir}images/"* "dist/writing/$name/images/" 2>/dev/null || true
  fi

  POST_DATA+=("$name|$title|$date|$tags")
}

generate_tag_pages() {
  local all_tags
  all_tags=$(printf '%s\n' "${POST_TAGS[@]}" | cut -d'|' -f2 | sort -u)

  mkdir -p dist/writing/tag

  local tag_cloud="" max_count=1 top_k=20

  while IFS= read -r tag; do
    [[ -z "$tag" ]] && continue
    local count
    count=$(printf '%s\n' "${POST_TAGS[@]}" | grep -c "|${tag}$")
    [[ "$count" -gt "$max_count" ]] && max_count=$count
  done <<< "$all_tags"

  local tag_counts=""
  while IFS= read -r tag; do
    [[ -z "$tag" ]] && continue
    local count
    count=$(printf '%s\n' "${POST_TAGS[@]}" | grep -c "|${tag}$")
    tag_counts="${tag_counts}${count}|${tag}\n"
  done <<< "$all_tags"

  local sorted_tags
  sorted_tags=$(printf '%b' "$tag_counts" | sort -t'|' -k1,1nr -k2,2 | head -n "$top_k")

  while IFS='|' read -r count tag; do
    [[ -z "$tag" ]] && continue

    generate_single_tag_page "$tag" "$count" "$max_count"

    local size
    if [[ $max_count -eq 1 ]]; then
      size="0.875"
    else
      size=$(awk -v c="$count" -v m="$max_count" 'BEGIN {
        base = 0.875;
        scale = 0.625;
        printf "%.3f", base + scale * log(c) / log(m)
      }')
    fi

    tag_cloud="${tag_cloud}<a href=\"/writing/tag/${tag}/\" style=\"font-size: ${size}rem;\">${tag}</a> "
  done <<< "$sorted_tags"

  echo "$tag_cloud" > dist/writing/tag-cloud.html
}

generate_single_tag_page() {
  local tag="$1"

  mkdir -p "dist/writing/tag/$tag"

  {
    cat << HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="dns-prefetch" href="https://tracking.salm.dev" />
    <link rel="preload" href="/assets/fonts/charter_regular.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/firacode_regular.woff2" as="font" type="font/woff2" crossorigin />
    <style>:root{--bg-color:#fff;--text-color:#1a1a2a;--text-secondary:#666;--link-color:#0066dd;--border-color:#eee;--code-bg:#f5f5f5;--font-family-body:"charter",sans-serif;--font-family-code:"firacode","Fira Code","Consolas",monospace;--font-size-base:1rem;--font-size-small:.95rem;--line-height:1.6;--line-height-heading:1.2;--spacing-tiny:.25rem;--spacing-small:.5rem;--spacing-medium:1rem;--spacing-large:1.5rem;--spacing-xl:2rem;--transition:.3s ease;--border-standard:1px solid var(--border-color);--heading-margin:var(--spacing-large) 0 var(--spacing-medium)}@media (prefers-color-scheme:dark){:root{--bg-color:#0d0d18;--text-color:#e3e3e8;--text-secondary:#9090a0;--link-color:#6699ff;--border-color:#2a2a3e;--code-bg:#16161e}}*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--font-family-body);font-size:var(--font-size-base);line-height:var(--line-height);max-width:1400px;color:var(--text-color);background-color:var(--bg-color);margin:0 auto;padding:40px 20px 20px 0}h1,h2,h3,h4,h5,h6{font-family:var(--font-family-body);margin:var(--heading-margin);line-height:var(--line-height-heading);color:var(--text-color);font-variant:small-caps;max-width:35em}h1{font-size:2.375rem;margin-top:var(--spacing-small)}h2{font-size:1.875rem;margin-top:var(--spacing-xl)}h3{font-size:1.625rem}h4{font-size:1.375rem}p{margin-bottom:var(--spacing-medium);max-width:40em}a{color:var(--link-color);text-decoration:underline}header{margin-bottom:var(--spacing-medium)}.site-header{display:flex;align-items:center;gap:var(--spacing-large);margin-bottom:var(--spacing-medium)}.main-nav{display:flex;gap:var(--spacing-medium);font-size:1rem}</style>
    <link rel="stylesheet" href="/styles/styles.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="/styles/styles.css"></noscript>
    <link rel="alternate" type="application/rss+xml" title="rss feed | salm.dev" href="/rss.xml">
    <title>$tag | writing | salm.dev</title>
</head>
<body>
    <header><a href="/">home</a> / <a href="/writing">writing</a> / tag / $tag</header>
    <h1>Tag: $tag</h1>
    <div>
HTML

    local current_year="" first_year=true
    while IFS="|" read -r date date_rfc title name desc featured; do
      local has_tag=false
      for entry in "${POST_TAGS[@]}"; do
        IFS="|" read -r post_name post_tag <<< "$entry"
        if [[ "$post_name" == "$name" && "$post_tag" == "$tag" ]]; then
          has_tag=true
          break
        fi
      done

      if [[ "$has_tag" == true ]]; then
        local year="${date:0:4}"
        local short_date="${date:5}"
        local escaped_desc
        escaped_desc=$(escape "$desc")

        local icons_html=""
        if [[ "$featured" == "true" ]]; then
          icons_html="$icons_html <span class=\"featured-star\">★</span>"
        fi

        if [[ "$year" != "$current_year" ]]; then
          [[ -n "$current_year" ]] && echo "        </ul>"

          if [[ "$first_year" == true ]]; then
            echo "        <h4 class=\"year-heading first-year\">$year</h4>"
            first_year=false
          else
            echo "        <h4 class=\"year-heading\">$year</h4>"
          fi

          echo "        <ul>"
          current_year="$year"
        fi

        echo "          <li>$short_date :: <a href=\"/writing/$name/\" class=\"post-link\" data-description=\"$escaped_desc\">$title</a>$icons_html</li>"
      fi
    done < <(printf '%s\n' "${POSTS[@]}" | sort -r)

    echo "        </ul>"
    echo "    </div>"
    echo "    <footer><p>© 2025 salm.dev | nico@salm.dev | <a href="https://status.salm.dev/" target="_blank">status</a></p></footer>"
    echo "    <script src=\"https://tracking.salm.dev/api/script.js\" data-site-id=\"a3641cc346e8\" defer></script>"
    echo "</body>"
    echo "</html>"
  } > "dist/writing/tag/$tag/index.html"
}

generate_posts_index() {
  {
    cat << HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
    <link rel="dns-prefetch" href="https://tracking.salm.dev" />
    <link rel="preload" href="/assets/fonts/charter_regular.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/assets/fonts/firacode_regular.woff2" as="font" type="font/woff2" crossorigin />
    <style>:root{--bg-color:#fff;--text-color:#1a1a2a;--text-secondary:#666;--link-color:#0066dd;--border-color:#eee;--code-bg:#f5f5f5;--font-family-body:"charter",sans-serif;--font-family-code:"firacode","Fira Code","Consolas",monospace;--font-size-base:1rem;--font-size-small:.95rem;--line-height:1.6;--line-height-heading:1.2;--spacing-tiny:.25rem;--spacing-small:.5rem;--spacing-medium:1rem;--spacing-large:1.5rem;--spacing-xl:2rem;--transition:.3s ease;--border-standard:1px solid var(--border-color);--heading-margin:var(--spacing-large) 0 var(--spacing-medium)}@media (prefers-color-scheme:dark){:root{--bg-color:#0d0d18;--text-color:#e3e3e8;--text-secondary:#9090a0;--link-color:#6699ff;--border-color:#2a2a3e;--code-bg:#16161e}}*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--font-family-body);font-size:var(--font-size-base);line-height:var(--line-height);max-width:1400px;color:var(--text-color);background-color:var(--bg-color);margin:0 auto;padding:40px 20px 20px 0}h1,h2,h3,h4,h5,h6{font-family:var(--font-family-body);margin:var(--heading-margin);line-height:var(--line-height-heading);color:var(--text-color);font-variant:small-caps;max-width:35em}h1{font-size:2.375rem;margin-top:var(--spacing-small)}h2{font-size:1.875rem;margin-top:var(--spacing-xl)}h3{font-size:1.625rem}h4{font-size:1.375rem}p{margin-bottom:var(--spacing-medium);max-width:40em}a{color:var(--link-color);text-decoration:underline}header{margin-bottom:var(--spacing-medium)}.site-header{display:flex;align-items:center;gap:var(--spacing-large);margin-bottom:var(--spacing-medium)}.main-nav{display:flex;gap:var(--spacing-medium);font-size:1rem}</style>
    <link rel="stylesheet" href="/styles/styles.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="/styles/styles.css"></noscript>
    <link rel="alternate" type="application/rss+xml" title="rss feed | salm.dev" href="/rss.xml">
    <title>writing | salm.dev</title>
</head>
<body>
    <header><a href="/">home</a> / writing</header>
    <h1>Writing (<a href="../rss.xml">RSS</a>)</h1>
    <div class="writing-layout">
        <div class="writing-main">
HTML

    local current_year="" first_year=true
    while IFS="|" read -r date date_rfc title name desc featured; do
      local year="${date:0:4}"
      local short_date="${date:5}"
      local escaped_desc
      escaped_desc=$(escape "$desc")

      local icons_html=""
      if [[ "$featured" == "true" ]]; then
        icons_html="$icons_html <span class=\"featured-star\">★</span>"
      fi

      if [[ "$year" != "$current_year" ]]; then
        [[ -n "$current_year" ]] && echo "        </ul>"

        if [[ "$first_year" == true ]]; then
          echo "        <h4 class=\"year-heading first-year\">$year</h4>"
          echo "        <h4 class=\"tags-heading desktop-only\">Tags</h4>"
          first_year=false
        else
          echo "        <h4 class=\"year-heading\">$year</h4>"
        fi

        echo "        <ul>"
        current_year="$year"
      fi

      echo "          <li>$short_date :: <a href=\"/writing/$name/\" class=\"post-link\" data-description=\"$escaped_desc\">$title</a>$icons_html</li>"
    done < <(printf '%s\n' "${POSTS[@]}" | sort -r)

    echo "        </ul>"
    echo "        <h4 class=\"tags-heading mobile-only\">Tags</h4>"
    echo "        </div>"
    echo "        <div class=\"tags-section\">"

    [[ -f dist/writing/tag-cloud.html ]] && cat dist/writing/tag-cloud.html

    echo "        </div>"
    echo "    </div>"
    echo "    <footer><p>© 2025 salm.dev | nico@salm.dev | <a href="https://status.salm.dev/" target="_blank">status</a></p></footer>"
    echo "    <script src=\"https://tracking.salm.dev/api/script.js\" data-site-id=\"a3641cc346e8\" defer></script>"
    echo "</body>"
    echo "</html>"
  } > dist/writing/index.html
}

generate_similar_writing() {
  local current_name="$1"

  local prev_post="" next_post=""
  local sorted_posts
  sorted_posts=$(printf '%s\n' "${POSTS[@]}" | sort -r)

  local found_current=false
  while IFS="|" read -r date date_rfc title name desc featured; do
    if [[ "$found_current" == true && -z "$prev_post" ]]; then
      prev_post="$title|$name"
    fi
    if [[ "$name" == "$current_name" ]]; then
      found_current=true
    elif [[ "$found_current" == false ]]; then
      next_post="$title|$name"
    fi
  done <<< "$sorted_posts"

  local html="<div class=\"the-end\">~ fin ~</div>"
  html="${html}<div class=\"similar-writing\">"

  html="${html}<div class=\"post-navigation\">"
  if [[ -n "$prev_post" ]]; then
    IFS="|" read -r prev_title prev_name <<< "$prev_post"
    html="${html}<div class=\"nav-prev\">← Prev: <a href=\"/writing/${prev_name}/\">${prev_title}</a></div>"
  fi
  if [[ -n "$next_post" ]]; then
    IFS="|" read -r next_title next_name <<< "$next_post"
    html="${html}<div class=\"nav-next\">Next: <a href=\"/writing/${next_name}/\">${next_title}</a> →</div>"
  fi
  html="${html}</div>"

  html="${html}</div>"
  echo "$html"
}

inject_similar_writing() {
  for post_data in "${POST_DATA[@]}"; do
    IFS="|" read -r name title date tags <<< "$post_data"
    local similar_html
    similar_html=$(generate_similar_writing "$name" "$tags" "$date")

    local post_file="dist/writing/$name/index.html"
    if [[ -f "$post_file" ]]; then
      local tmpfile
      tmpfile=$(mktemp)
      awk -v similar="$similar_html" '
        /<\/article>/ {
          print $0
          print similar
          next
        }
        { print }
      ' "$post_file" > "$tmpfile"
      mv "$tmpfile" "$post_file"
    fi
  done
}

generate_rss_feed() {
  local now="$1"
  {
    cat << XML
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

    while IFS="|" read -r _ date_rfc title name desc featured; do
      cat << XML
  <item>
    <title>$(escape "$title")</title>
    <link>https://salm.dev/writing/$name/</link>
    <guid>https://salm.dev/writing/$name/</guid>
    <pubDate>$date_rfc</pubDate>
    <author>Nico Salm</author>
    <description><![CDATA[ $(escape "$desc") ]]></description>
  </item>
XML
    done < <(printf '%s\n' "${POSTS[@]}" | sort -r)

    echo "</channel></rss>"
  } > dist/rss.xml
}

NOW=$(date "+%a, %d %b %Y %H:%M:%S %z")
POSTS=()
POST_TAGS=()
POST_DATA=()

setup_directories

for dir in src/writing/*/; do
  process_post "$dir"
done

generate_tag_pages
generate_posts_index
inject_similar_writing
generate_rss_feed "$NOW"

echo "-- build done! --"
