#!/usr/bin/env bash
# Builds the site and creates release/zee-telephonics-website.zip:
#   upload/public_html/   -> everything that goes inside public_html on the server
#   upload/zee-private/   -> config template that goes NEXT TO public_html (not inside it)
#   database/schema.sql   -> import once in phpMyAdmin
#   source/               -> the complete source code
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
OUT=release/zee-telephonics-website
rm -rf release && mkdir -p "$OUT/upload/public_html" "$OUT/upload/zee-private" "$OUT/database" "$OUT/source"
cp -a dist/. "$OUT/upload/public_html/"
cp server/config/config.example.php "$OUT/upload/zee-private/config.example.php"
cp database/schema.sql "$OUT/database/schema.sql"
cp README.md "$OUT/README.md"
cp docs/DEPLOYMENT-HOSTINGER.md "$OUT/DEPLOYMENT-HOSTINGER.md"
git ls-files -z | xargs -0 -I{} cp --parents {} "$OUT/source/"
# Safety: never ship a real config.
if find "$OUT" -name config.php | grep -q .; then echo "Refusing to package: a config.php was found" >&2; exit 1; fi
(cd release && zip -qr zee-telephonics-website.zip zee-telephonics-website)
echo "Created release/zee-telephonics-website.zip"
