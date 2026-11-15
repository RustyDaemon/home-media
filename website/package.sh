#!/usr/bin/env bash
# Package the static website into a zip for upload to a static host.
#
# Usage:
#   ./package.sh              # writes dist/home-media-website.zip next to this script
#   ./package.sh out/site.zip # writes to a custom path (relative to where you run it)
#
# index.html sits at the top level of the zip. Only site files are included,
# so README.md, this script and dist/ never get published.

set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILES=(index.html 404.html robots.txt sitemap.xml assets)

out="${1:-$SITE_DIR/dist/home-media-website.zip}"
[[ "$out" = /* ]] || out="$PWD/$out"

if ! command -v zip >/dev/null 2>&1; then
  echo "error: 'zip' is not installed" >&2
  exit 1
fi

cd "$SITE_DIR"

for f in "${FILES[@]}"; do
  if [[ ! -e "$f" ]]; then
    echo "error: missing $SITE_DIR/$f" >&2
    exit 1
  fi
done

mkdir -p "$(dirname "$out")"
rm -f "$out" # zip adds to an existing archive, so start fresh

zip -r -X -q "$out" "${FILES[@]}" -x '*.DS_Store'

count="$(zipinfo -1 "$out" | grep -vc '/$')"
size="$(du -h "$out" | cut -f1 | tr -d ' ')"
echo "Created $out ($count files, $size)"
