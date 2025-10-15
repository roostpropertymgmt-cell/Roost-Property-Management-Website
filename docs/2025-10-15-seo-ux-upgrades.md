# Roost PM — SEO/AEO + UX Upgrades (2025-10-15)

## Summary
High-impact search and experience upgrades across the site:
- Service Areas hub and city pages expanded (Anne Arundel + Howard/Columbia).
- Structured data: Organization, ItemList hub, Breadcrumbs, FAQPage per city.
- OpenGraph/Twitter meta wired site-wide.
- Header logo and icons.
- SSR middleware: cache-control for HTML and “Nearby Areas” internal links injected server-side.
- Tooling: verify script, add-city script, manifest.

## Scope
- URLs:
  - /service-areas/, /service-areas/anne-arundel/, /service-areas/howard/
  - City pages under Anne Arundel: severna-park, glen-burnie, pasadena, annapolis, millersville, odenton
  - City under Howard: columbia
- Static data:
  - /org.json, /service-areas.itemlist.json, /breadcrumbs/*/*.json, *.faq.json
- Assets:
  - /logo.png, /icon-192.png, /icon-512.png, /favicon.png, /apple-touch-icon.png
- Middleware:
  - src/middleware.ts (HTML no-store, Nearby Areas SSR injection)

## Key Changes
- Hub content: updated items list plus ItemList JSON-LD linking all areas.
- City pages: added canonical, FAQPage JSON-LD references, OG/Twitter meta.
- Breadcrumb JSON-LD per city.
- Nearby Areas: server-side injected section for internal linking.
- Footer renders script hook previously; now SSR handles crawl-visible content.

## Verification
- Run: `npm run ship` or `npm run build && npm run deploy:prod && npm run verify`
- Expected `bin/verify.sh` output:
  - HEADER:1
  - HUB_H1:1
  - HUB_JSON:1
  - City checks (SP/GB/PAS/ANNAP/MILL/ODEN): non-zero
  - LOGO_ROOT, LOGO_PM: non-zero
  - COL_TW: 1
- Nearby Areas present (server-rendered):
  - `curl -sL https://roost-property-management-website.pages.dev/service-areas/anne-arundel/severna-park/ | grep -o 'id="nearby-areas"' | wc -l` → 1
  - `curl -sL https://roost-property-management-website.pages.dev/service-areas/howard/columbia/ | grep -o 'id="nearby-areas"' | wc -l` → 1

## Rollback
- Revert middleware injection by restoring previous src/middleware.ts.
- Remove nearby block by deleting injection code and redeploying.
- Remove links by editing docs and JSON under /public.

## Open Items
- Add more Howard County cities (Ellicott City, Elkridge).
- Polish /services/property-management/ hero + CTAs.
- Preconnect GA, font loading optimizations, image width/height audit.
- County-level ItemList JSON-LD and hub pages for all counties.
