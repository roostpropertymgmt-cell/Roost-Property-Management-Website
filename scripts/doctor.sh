#!/usr/bin/env bash
set -euo pipefail
echo "Checking homepage for hardcoded localhost fetch…"
if curl -s https://roost-property-management-website.pages.dev | grep -E 'fetch\("http://127\.0\.0\.1' -n >/dev/null; then
  echo "Found hardcoded localhost fetch"; exit 1;
else
  echo "OK: no hardcoded localhost fetch";
fi
echo "Checking API lead endpoint…"
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://roost-property-management-website.pages.dev/api/lead -H "Content-Type: application/json" -d '{"name":"Diag","email":"diag@example.com"}' | grep -q '^200$' && echo "OK: /api/lead 200" || { echo "Fail: /api/lead"; exit 1; }
echo "Checking robots.txt…"
curl -s https://roost-property-management-website.pages.dev/robots.txt | grep -E '^Sitemap:' -q && echo "OK: robots" || { echo "Missing robots sitemap line"; exit 1; }
echo "Checking sitemap.xml…"
curl -sI https://roost-property-management-website.pages.dev/sitemap.xml | grep -q ' 200 ' && echo "OK: sitemap" || { echo "Fail: sitemap"; exit 1; }
echo "Checking /api/health (Make forwarding)…"
curl -s https://roost-property-management-website.pages.dev/api/health | grep -q '"ok":true' && echo "OK: /api/health" || { echo "Fail: /api/health"; exit 1; }
echo "All checks passed."
