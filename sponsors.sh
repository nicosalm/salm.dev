sponsors_file="src/sponsors/sponsors.txt"
avatars_dir="src/assets/sponsors"
mkdir -p "$avatars_dir"
if [ -f "$sponsors_file" ]; then
    while IFS= read -r bleh || [ -n "$bleh" ]; do
        [ -z "$bleh" ] && continue
        [ "${bleh#\#}" != "$bleh" ] && continue
        temp_png="${avatars_dir}/${bleh}.png"
        avatar_file="${avatars_dir}/${bleh}.jpg"
        curl -sL "https://github.com/${bleh}.png" -o "$temp_png"
        cjpegli "$temp_png" "$avatar_file" --quality 85
        rm "$temp_png"
    done < "$sponsors_file"
fi
