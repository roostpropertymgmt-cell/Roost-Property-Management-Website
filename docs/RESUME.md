# Roost PM — Resume Here

## Live
Site: https://roost-property-management-website.pages.dev
API:  POST /api/lead (Astro API route)
Data: https://roost-data.nick-morgan.workers.dev/data/local-spots/annapolis

## Cloudflare Pages
Project: roost-property-management-website
Secrets: MAKE_WEBHOOK_URL

## Dev
Run site: npm run dev  (http://localhost:4321/)
Pages dev: npm run cf:dev  (http://127.0.0.1:8788/)
Build: npm run build
Deploy: npm run deploy

## Current Checks
- /api/lead → forwards to Make (200, {"ok":true,"forwarded":true})
- robots.txt and sitemap.xml present
- Home form uses /api/lead in prod (no localhost)

## Next 3
1) Add Severna Park + Glen Burnie pages with FAQPage JSON-LD
2) Route Worker under domain (/data/* → roost-data) and switch fetches to /data/...
3) Add GA4 or Plausible

## Handy cURL
curl -i -X POST https://roost-property-management-website.pages.dev/api/lead -H "Content-Type: application/json" -d '{"name":"Nick","email":"lead@example.com","phone":"4105551212","message":"Hi"}'
