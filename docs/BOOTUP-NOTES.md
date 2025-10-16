Roost PM – Master Bootup Notes

These notes consolidate the latest changes and boot‑up procedures for the Roost Property Management website. The updates here capture the high‑impact work completed around 15 Oct 2025 and outline commands for building, deploying and verifying the site. Keep this document up to date as new cities and features are added.

Recent Upgrades (15 Oct 2025)

Service area expansion: Added a new service areas hub and created county and city pages for Anne Arundel County and Howard County (Columbia). URLs such as /service-areas/, /service-areas/anne-arundel/, /service-areas/howard/ and city pages (e.g. severna‑park, glen‑burnie, pasadena, annapolis, millersville, odenton, columbia) are now live.

Structured data: Added Organization, ItemList (hub), BreadcrumbList and FAQPage JSON‑LD to improve SEO. Each city page includes a canonical tag and FAQ schema.

Open Graph & Twitter cards: Site‑wide meta tags for social sharing are wired up for improved previews.

Assets: Centralized logo and icon assets (/logo.png, /icon-192.png, /icon-512.png, /favicon.png, /apple-touch-icon.png). Verify that these assets are served with a 200 response.

SSR middleware: Implemented a middleware (src/middleware.ts) that injects the Nearby Areas section server‑side. This also sets Cache-Control: no-store on HTML responses to avoid stale metadata.

Tooling: Added helper scripts such as bin/verify.sh, bin/add-city.sh and a manifest builder to streamline verification and new city creation.

Verification checklist

After deploying, run npm run verify or bin/verify.sh to confirm the following:

Hub and city pages render the correct H1 tags and JSON‑LD sections.

Logo assets resolve (counts > 0 for LOGO_ROOT and LOGO_PM).

The Nearby Areas section is injected server‑side; verify with curl -sL <city-page> | grep -o 'id="nearby-areas"' | wc -l and expect 1.

The Twitter card is present (e.g. COL_TW: 1 for the Columbia page).

If any of these checks fail, consult the “Known Issues & Follow‑ups” section for mitigations.

Known Issues & Follow‑ups

Nearby Areas SSR verification pending – The middleware now injects the section server‑side, but confirm with curl that the <div id="nearby‑areas"> element appears. Status: pending production confirmation.

Router collision cleanup – There was a duplicate route warning for Annapolis (annapolis.astro vs. annapolis/index.astro). The stray file has been renamed. Status: verify that npm run build shows no warnings.

Cache/verification flakiness on meta tags – Occasionally the twitter:card meta returns zero. To mitigate, cache‑bust with Cache-Control: no‑cache in verification scripts. Status: monitor.

Follow‑ups –

Add more Howard County cities (Ellicott City, Elkridge) and build county‑level hubs for all counties.

Polish /services/property-management/ hero section and call‑to‑actions.

Improve performance by pre‑connecting to Google Analytics, optimizing font loading and auditing image dimensions.

Centralize Nearby Areas data so it can be rendered at build time rather than injected at runtime.

Boot‑up Instructions

Use these steps when starting work on the project or preparing a deployment.

Open the project

cd ~/PycharmProjects/Roost-Property-Management-Website
git pull
npm ci


Build, deploy and verify

Build the site, deploy to Cloudflare Pages and run the verification script:

npm run build && npm run deploy:prod && npm run verify


Quick health checks

Perform these basic checks to ensure critical elements are present:

# Header present on home page
curl -sL https://roost-property-management-website.pages.dev/ | grep -o 'data-test="site-header"' | wc -l

# Service areas hub H1 present
curl -sL https://roost-property-management-website.pages.dev/service-areas/ | grep -o '<h1[^>]*>Service Areas<' | wc -l

# ItemList JSON-LD present
curl -sL https://roost-property-management-website.pages.dev/service-areas.itemlist.json | grep -io '"@type"[[:space:]]*:[[:space:]]*"ItemList"' | wc -l

# Logo renders on the services page
curl -sL https://roost-property-management-website.pages.dev/services/property-management/ | grep -o '/logo.png' | wc -l


Nearby Areas SSR verification

Confirm that the Nearby Areas section appears on city pages without client‑side JavaScript:

curl -sL https://roost-property-management-website.pages.dev/service-areas/anne-arundel/severna-park/ | grep -o 'id="nearby-areas"' | wc -l
curl -sL https://roost-property-management-website.pages.dev/service-areas/howard/columbia/ | grep -o 'id="nearby-areas"' | wc -l


Add a new city page

To create a new city under a county, run the helper script and ship:

bin/add-city.sh "City Name" city-slug
npm run ship


Move a city to a different county

If a city needs to move counties, relocate the page and update its metadata. The following sequence accomplishes this (replace the placeholders with actual slugs):

# ensure target directory exists
mkdir -p src/pages/service-areas/target-county

# move the city page
git mv src/pages/service-areas/source-county/<city>/index.astro src/pages/service-areas/target-county/<city>/index.astro 2>/dev/null || \
  mv src/pages/service-areas/source-county/<city>/index.astro src/pages/service-areas/target-county/<city>/index.astro

# move FAQ JSON
git mv public/service-areas/source-county/<city>.faq.json public/service-areas/target-county/<city>.faq.json 2>/dev/null || \
  mv public/service-areas/source-county/<city>.faq.json public/service-areas/target-county/<city>.faq.json

# update URLs inside the Astro template
perl -0777 -i.bak -pe 's|/service-areas/source-county/<city>/|/service-areas/target-county/<city>/|g; s|/service-areas/source-county/<city>.faq.json|/service-areas/target-county/<city>.faq.json|g' \
  src/pages/service-areas/target-county/<city>/index.astro

# update the ItemList JSON to remove the old entry and add the new one
node -e '
  const fs = require("fs");
  const p = "public/service-areas.itemlist.json";
  const j = JSON.parse(fs.readFileSync(p));
  // remove old entry
  j.itemListElement = j.itemListElement.filter(e => !e.url.endsWith("/service-areas/source-county/<city>/"));
  // helper to add unique entries
  const add = (name, url) => {
    if (!j.itemListElement.find(e => e.url === url)) {
      j.itemListElement.push({"@type": "ListItem", position: j.itemListElement.length + 1, name, url});
    }
  };
  add("Target County", "https://roost-property-management-website.pages.dev/service-areas/target-county/");
  add("City Name", `https://roost-property-management-website.pages.dev/service-areas/target-county/<city>/`);
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
  console.log("ItemList updated");
'

# add a redirect from the old path to the new path
grep -q '/service-areas/source-county/<city>/' public/_redirects || printf '/service-areas/source-county/<city>/ /service-areas/target-county/<city>/ 301\n' >> public/_redirects

npm run ship


Global metadata and org JSON‑LD

To embed the Organization JSON‑LD site‑wide, you can insert a <script> tag after each page’s <title> tag. For example:

find src/pages -name "*.astro" -print0 | xargs -0 perl -0777 -i.bak -pe \
  's|</title>\s|</title>\n  <script type="application/ld+json" src="/org.json"></script>\n\n|i'


Verify OG/Twitter metadata

To check that a page includes the correct Open Graph and Twitter tags, issue a no‑cache request and grep for twitter:card:

curl -sL -H 'Cache-Control: no-cache' 'https://roost-property-management-website.pages.dev/service-areas/howard/columbia/?cb=1' \
  | sed -n '/<head>/,/<\/head>/p' | grep -i 'twitter:card' | wc -l


Logo and icon presence

Use HTTP HEAD requests to ensure the logo and icons are served:

curl -sI https://roost-property-management-website.pages.dev/logo.png | head -n1
curl -sI https://roost-property-management-website.pages.dev/icon-192.png | head -n1
curl -sI https://roost-property-management-website.pages.dev/icon-512.png | head -n1


Git hygiene

Always check your working tree and commit frequently:

git status
git add -A
git commit -m "Work in progress"
git push


Additional follow‑ups

Add cities: Ellicott City and Elkridge under Howard County.

Improve hero and CTAs on /services/property-management/.

Performance optimizations: GA preconnect, font loading and image dimension audit.

Create hubs and ItemList JSON‑LD for every county.

Move Nearby Areas data to a single source of truth and render it at build time.

Environment & API Overview

Live site: https://roost-property-management-website.pages.dev

API endpoint: POST /api/lead (Astro API route) forwards form submissions to Make. Use data from https://roost-data.nick-morgan.workers.dev/data/local-spots/annapolis
 as a reference.

Cloudflare Pages project: roost-property-management-website with secret MAKE_WEBHOOK_URL set.

Development commands:

Run site locally: npm run dev (available at http://localhost:4321/
)

Cloudflare Pages dev server: npm run cf:dev (http://127.0.0.1:8788/
)

Build: npm run build

Deploy: npm run deploy

Current checks

/api/lead returns a 200 with { "ok": true, "forwarded": true }.

robots.txt and sitemap.xml are present.

The contact form on the home page posts to /api/lead in production (not to localhost).

Next three tasks

Add city pages – Create Severna Park and Glen Burnie pages with FAQPage JSON‑LD.

Implement route worker – Add a Worker under /data/* to serve static data (e.g. /data/local-spots/annapolis) and update fetches accordingly.

Add analytics – Implement GA4 or Plausible for site analytics.

Handy cURL Example

Use the following cURL command to test the lead API:

curl -i -X POST https://roost-property-management-website.pages.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Nick","email":"lead@example.com","phone":"4105551212","message":"Hi"}'


This request should return a 200 response with an acknowledgment that the lead was forwarded.
