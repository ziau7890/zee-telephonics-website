#!/usr/bin/env bash
# Builds nothing: run `npm run build` first. Needs PHP 8.1+, Python 3 with aiosmtpd, and Playwright.
set -euo pipefail
cd "$(dirname "$0")/../.."
TMP=$(mktemp -d)
export ZEE_E2E_DB="$TMP/leads.sqlite"
export ZEE_CONFIG="$PWD/tests/e2e/config.e2e.php"
sqlite3 "$ZEE_E2E_DB" < tests/php/schema.sqlite.sql 2>/dev/null || php -r '$p=new PDO("sqlite:".getenv("ZEE_E2E_DB"));$p->exec(file_get_contents("tests/php/schema.sqlite.sql"));'
python3 tests/e2e/smtp_sink.py "$TMP/mail" & SMTP=$!
php -S localhost:8099 -t dist tests/e2e/router.php >"$TMP/php.log" 2>&1 & PHP=$!
trap 'kill $SMTP $PHP 2>/dev/null || true' EXIT
sleep 1.5
node tests/e2e/site.e2e.cjs
echo
echo "Leads saved: $(php -r '$p=new PDO("sqlite:".getenv("ZEE_E2E_DB"));echo $p->query("SELECT COUNT(*) FROM leads")->fetchColumn();')"
echo "Emails captured: $(ls "$TMP/mail" | wc -l)"
echo "Files kept in $TMP"
