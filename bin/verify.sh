#!/usr/bin/env bash
set -euo pipefail
BASE="https://roost-property-management-website.pages.dev"
CB="?cb=$(date +%s)"
root_header=$(curl -sL "$BASE/$CB" | grep -o '<header[^>]*data-test="site-header"' | wc -l | tr -d ' ')
hub_h1=$(curl -sL "$BASE/service-areas/$CB" | grep -o '<h1[^>]*>Service Areas<' | wc -l | tr -d ' ')
hub_json=$(curl -sL "$BASE/service-areas.itemlist.json$CB" | grep -io '"@type"[[:space:]]*:[[:space:]]*"ItemList"' | wc -l | tr -d ' ')
sp=$(curl -sL "$BASE/service-areas/anne-arundel/severna-park/$CB" | grep -o 'Quick Answers' | wc -l | tr -d ' ')
gb=$(curl -sL "$BASE/service-areas/anne-arundel/glen-burnie/$CB" | grep -o 'Quick Answers' | wc -l | tr -d ' ')
pas=$(curl -sL "$BASE/service-areas/anne-arundel/pasadena/$CB" | grep -o 'Quick Answers' | wc -l | tr -d ' ')
ann=$(curl -sL "$BASE/service-areas/anne-arundel/annapolis/$CB" | grep -o 'Quick Answers' | wc -l | tr -d ' ')
mil=$(curl -sL "$BASE/service-areas/anne-arundel/millersville/$CB" | grep -o 'Quick Answers' | wc -l | tr -d ' ')
ode=$(curl -sL "$BASE/service-areas/anne-arundel/odenton/$CB" | grep -o 'Quick Answers' | wc -l | tr -d ' ')
logo_root=$(curl -sL "$BASE/$CB" | grep -o '/logo.png' | wc -l | tr -d ' ')
logo_pm=$(curl -sL "$BASE/services/property-management/$CB" | grep -o '/logo.png' | wc -l | tr -d ' ' || echo 0)
col_twitter=$(curl -sL -H 'Cache-Control: no-cache' "$BASE/service-areas/howard/columbia/$CB" | sed -n '/<head>/,/<\/head>/p' | grep -i 'twitter:card' | wc -l | tr -d ' ')
printf "HEADER:%s HUB_H1:%s HUB_JSON:%s SP:%s GB:%s PAS:%s ANNAP:%s MILL:%s ODEN:%s LOGO_ROOT:%s LOGO_PM:%s COL_TW:%s\n" "$root_header" "$hub_h1" "$hub_json" "$sp" "$gb" "$pas" "$ann" "$mil" "$ode" "$logo_root" "$logo_pm" "$col_twitter"
