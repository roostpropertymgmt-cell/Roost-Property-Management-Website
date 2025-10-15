#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 2 ]; then
  echo "Usage: bin/add-city.sh \"City Name\" city-slug"
  exit 1
fi
NAME="$1"
SLUG="$2"

PAGE="src/pages/service-areas/anne-arundel/$SLUG"
FAQ_JSON="public/service-areas/anne-arundel/$SLUG.faq.json"
HUB_PAGE="src/pages/service-areas/index.astro"
HUB_JSON="public/service-areas.itemlist.json"
SITEMAP="public/sitemap.xml"

mkdir -p "$PAGE" "public/service-areas/anne-arundel"

cat > "$PAGE/index.astro" <<ASTRO
---
import Header from "../../../../components/Header.astro";
import FairHousing from "../../../../components/FairHousing.astro";
import Footer from "../../../../components/Footer.astro";
const title = "${NAME} Property Management | Roost Property Management";
const description = "${NAME}, MD property management: faster leasing, fewer surprises. See quick answers and FAQs.";
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href="/service-areas/anne-arundel/${SLUG}/" />
    <script type="application/ld+json" src="/service-areas/anne-arundel/${SLUG}.faq.json"></script>
  </head>
  <body class="min-h-screen bg-white text-slate-900">
    <Header />
    <main class="mx-auto max-w-4xl px-6 py-12">
      <h1 class="text-3xl font-semibold mb-6">${NAME}, MD Property Management</h1>
      <section class="mb-8">
        <h2 class="text-xl font-semibold mb-3">Quick Answers</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Typical leasing time: 2–4 weeks for well-priced homes.</li>
          <li>Deposit: Usually one month’s rent; screening dependent.</li>
          <li>Local compliance handled case-by-case.</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-xl font-semibold mb-3">Frequently Asked Questions</h2>
        <p>See structured FAQs in the page head (FAQPage JSON-LD).</p>
      </section>
      <FairHousing />
    </main>
    <Footer />
  </body>
</html>
ASTRO

cat > "$FAQ_JSON" <<JSON
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"How fast do rentals lease in ${NAME}?","acceptedAnswer":{"@type":"Answer","text":"Often 2–4 weeks for well-priced homes; season and condition affect timing."}},
    {"@type":"Question","name":"What deposit do you require?","acceptedAnswer":{"@type":"Answer","text":"Usually one month’s rent, based on screening and local rules."}},
    {"@type":"Question","name":"Do you handle local compliance and HOAs?","acceptedAnswer":{"@type":"Answer","text":"Yes, we review requirements case-by-case before listing."}}
  ]
}
JSON

if ! grep -q "/service-areas/anne-arundel/${SLUG}/" "$HUB_PAGE"; then
  awk -v NAME="$NAME" -v SLUG="$SLUG" '
    BEGIN{added=0}
    /const items = \[/ {print; next}
    /\];/ && !added { print "  { name: \"" NAME "\", url: \"/service-areas/anne-arundel/" SLUG "/\" }"; print; added=1; next }
    {print}
  ' "$HUB_PAGE" > /tmp/index.astro && mv /tmp/index.astro "$HUB_PAGE"
fi

node -e '
  const fs = require("fs");
  const p = process.argv[1];
  const name = process.argv[2];
  const slug = process.argv[3];
  const url = `https://roost-property-management-website.pages.dev/service-areas/anne-arundel/${slug}/`;
  const j = JSON.parse(fs.readFileSync(p));
  if (!j.itemListElement.find(e => e.url === url)) {
    j.itemListElement.push({"@type":"ListItem","position":j.itemListElement.length+1,"name":name,"url":url});
    fs.writeFileSync(p, JSON.stringify(j, null, 2));
  }
  console.log("HUB_JSON_UPDATED");
' "$HUB_JSON" "$NAME" "$SLUG"

if ! grep -q "/service-areas/anne-arundel/${SLUG}/" "$SITEMAP"; then
  awk -v SLUG="$SLUG" '
    /<\/urlset>/ {
      print "  <url>";
      print "    <loc>https://roost-property-management-website.pages.dev/service-areas/anne-arundel/" SLUG "/</loc>";
      print "    <changefreq>weekly</changefreq>";
      print "    <priority>0.7</priority>";
      print "  </url>";
    }
    {print}
  ' "$SITEMAP" > /tmp/sitemap.xml && mv /tmp/sitemap.xml "$SITEMAP"
fi

echo "CITY_ADDED:${NAME}:${SLUG}"
