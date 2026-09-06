#!/usr/bin/env bash
#
# Copy the ATMOS//NET frontend out of the Weather repo into weather/ and adapt
# it for hosting under a subpath.
#
# The console is developed in ../Weather (where it also has a local Node server
# and the desktop wallpaper renderer). Only the browser frontend belongs on the
# website, and it needs two adaptations:
#
#   1. Absolute asset paths (/css/…, /js/…, /assets/…) resolve to the apex when
#      served from /weather/, so every one 404s. They become relative.
#   2. wallpaper.html is a local-only tool driven by scripts/atmos-wallpaper and
#      has no meaning on a public site.
#
# Re-run this after changing the console, then commit the result.
set -euo pipefail

SRC="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../Weather/public" && pwd)}"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/weather"

[ -d "$SRC" ] || { echo "source not found: $SRC" >&2; exit 1; }

echo "  source: $SRC"
echo "  dest:   $DEST"

rm -rf "$DEST"
mkdir -p "$DEST"
cp -r "$SRC"/. "$DEST"/

# Local-only tooling has no place on the public site.
rm -f "$DEST/wallpaper.html"

# --- absolute -> relative -------------------------------------------------
# index.html sits at weather/, so its assets are one level down from it.
sed -i \
  -e 's|href="/assets/|href="assets/|g' \
  -e 's|href="/css/|href="css/|g' \
  -e 's|src="/js/|src="js/|g' \
  "$DEST/index.html"

# fonts.css sits at weather/css/, so ../ reaches weather/assets/.
sed -i 's|url(/assets/fonts/|url(../assets/fonts/|g' "$DEST/css/fonts.css"

# --- a way back to the site ----------------------------------------------
python3 "$(dirname "${BASH_SOURCE[0]}")/inject-backlink.py" "$DEST/index.html"

# --- verify no absolute ASSET references survive --------------------------
# Only asset paths are a problem. The injected back-link is deliberately
# href="/" — it points at the site root and must stay absolute.
if grep -rnE 'href="/(css|js|assets)/|src="/(css|js|assets)/|url\(/' \
     "$DEST" --include='*.html' --include='*.css'; then
  echo "  ERROR: absolute asset paths remain (they would 404 under /weather/)" >&2
  exit 1
fi

echo "  ok: $(find "$DEST" -type f | wc -l) files, no absolute paths"
