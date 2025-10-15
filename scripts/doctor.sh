#!/usr/bin/env bash
set -euo pipefail
echo "Checking homepage for localhost refs…"
curl -s https://roost-property-management-website.pages.dev | grep -E '127\.0\.0\.1' -n && { echo "Found localhost refs"; exit 1; } || echo "OK: no localhost"
echo "Checking API lead endpoint…"
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://roost-property-management-website.pages.dev/api/lead -H "Content-Type: application/json" -d '{"name":"Diag","email":"diag@example.com"}' | grep -q '^200$' && echo "OK: /api/lead 200" || { echo "Fail: /api/lead"; exit 1; }
echo "Checking robots.txt…"
curl -s https://roost-property-management-website.pages.dev/robots.txt | grep -E '^Sitemap:' -q && echo "OK: robots" || { echo "Missing robots sitemap line"; exit 1; }
echo "Checking sitemap.xml…"
curl -sI https://roost-property-management-website.pages.dev/sitemap.xml | grep -q '200' && echo "OK: sitemap" || { echo "Fail: sitemap"; exit 1; }
echo "All checks passed."
