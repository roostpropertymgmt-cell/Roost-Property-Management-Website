# Roost PM — Bootup Notes

## 0) Open project
cd ~/PycharmProjects/Roost-Property-Management-Website
git pull
npm ci

## 1) Build, deploy, verify
npm run build && npm run deploy:prod && npm run verify

## 2) Quick health checks
curl -sL https://roost-property-management-website.pages.dev/ | grep -o 'data-test="site-header"' | wc -l
curl -sL https://roost-property-management-website.pages.dev/service-areas/ | grep -o '<h1[^>]*>Service Areas<' | wc -l
curl -sL https://roost-property-management-website.pages.dev/service-areas.itemlist.json | grep -io '"@type"[[:space:]]*:[[:space:]]*"ItemList"' | wc -l
curl -sL https://roost-property-management-website.pages.dev/services/property-management/ | grep -o '/logo.png' | wc -l

## 3) Nearby Areas SSR verification
curl -sL https://roost-property-management-website.pages.dev/service-areas/anne-arundel/severna-park/ | grep -o 'id="nearby-areas"' | wc -l
curl -sL https://roost-property-management-website.pages.dev/service-areas/howard/columbia/ | grep -o 'id="nearby-areas"' | wc -l

## 4) Add a new city page
bin/add-city.sh "City Name" city-slug
npm run ship

## 5) Move a city to a different county
mkdir -p src/pages/service-areas/howard
git mv src/pages/service-areas/anne-arundel/<city>/index.astro src/pages/service-areas/howard/<city>/index.astro 2>/dev/null || mv src/pages/service-areas/anne-arundel/<city>/index.astro src/pages/service-areas/howard/<city>/index.astro
git mv public/service-areas/anne-arundel/<city>.faq.json public/service-areas/howard/<city>.faq.json 2>/dev/null || mv public/service-areas/anne-arundel/<city>.faq.json public/service-areas/howard/<city>.faq.json
perl -0777 -i.bak -pe 's|/service-areas/anne-arundel/<city>/|/service-areas/howard/<city>/|g; s|/service-areas/anne-arundel/<city>.faq.json|/service-areas/howard/<city>.faq.json|g' src/pages/service-areas/howard/<city>/index.astro
node -e 'const fs=require("fs");const p="public/service-areas.itemlist.json";const j=JSON.parse(fs.readFileSync(p));j.itemListElement=j.itemListElement.filter(e=>!e.url.endsWith("/service-areas/anne-arundel/<city>/"));const add=(n,u)=>{if(!j.itemListElement.find(e=>e.url===u))j.itemListElement.push({"@type":"ListItem","position":j.itemListElement.length+1,"name":n,"url":u});};add("Howard County","https://roost-property-management-website.pages.dev/service-areas/howard/");add("<City Proper>","https://roost-property-management-website.pages.dev/service-areas/howard/<city>/");fs.writeFileSync(p,JSON.stringify(j,null,2));console.log("OK");'
touch public/_redirects
grep -q '/service-areas/anne-arundel/<city>/' public/_redirects || printf '/service-areas/anne-arundel/<city>/  /service-areas/howard/<city>/ 301\n' >> public/_redirects
npm run ship

## 6) Global metadata and org JSON-LD
find src/pages -name "*.astro" -print0 | xargs -0 perl -0777 -i.bak -pe 's|</title>\s*|</title>\n    <script type="application/ld+json" src="/org.json"></script>\n    <link rel="manifest" href="/site.webmanifest">\n|i'

## 7) Verify OG/Twitter on a page
curl -sL -H 'Cache-Control: no-cache' 'https://roost-property-management-website.pages.dev/service-areas/howard/columbia/?cb=1' | sed -n '/<head>/,/<\/head>/p' | grep -i 'twitter:card' | wc -l

## 8) Logo + icons present
curl -sI https://roost-property-management-website.pages.dev/logo.png | head -n1
curl -sI https://roost-property-management-website.pages.dev/icon-192.png | head -n1
curl -sI https://roost-property-management-website.pages.dev/icon-512.png | head -n1

## 9) Git hygiene
git status
git add -A
git commit -m "Work in progress"
git push

## 10) Known follow-ups
- Add Howard County cities: Ellicott City, Elkridge
- Improve /services/property-management/ hero + CTAs
- Performance: preconnect GA, font loading, image width/height audit
- County-level hubs for all counties
- Move Nearby Areas data to a single source-of-truth and render at build time
