const fs = require('fs');
const path = require('path');

function pickFile(dir) {
  const idx = path.join(dir, 'index.astro');
  if (fs.existsSync(idx)) return idx;
  const basename = path.basename(dir);
  const file = path.join(path.dirname(dir), basename + '.astro');
  if (fs.existsSync(file)) return file;
  return null;
}

function ensureImport(s, importPath) {
  const start = s.indexOf('---');
  if (start === -1) return `---\nimport NearbyAreas from "${importPath}";\n---\n` + s;
  const end = s.indexOf('---', start + 3);
  if (end === -1) return `---\nimport NearbyAreas from "${importPath}";\n---\n` + s;
  if (s.includes('import NearbyAreas')) return s;
  return s.slice(0, end + 3) + `\nimport NearbyAreas from "${importPath}";\n` + s.slice(end + 3);
}

function injectBlock(s, items) {
  const block = `\n    <NearbyAreas items={${JSON.stringify(items)}} />\n`;
  if (/<\/main>/i.test(s)) return s.replace(/<\/main>/i, m => block + m);
  if (/FairHousing\s*\/>/.test(s)) return s.replace(/FairHousing\s*\/>/, match => match + block);
  return s + block;
}

function inject(file, items) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes('<h2 class="text-xl font-semibold mb-3">Nearby Areas</h2>')) return;
  const rel = path.relative(path.dirname(file), 'src/components/NearbyAreas.astro').replace(/\\/g, '/');
  src = ensureImport(src, rel.startsWith('.') ? rel : './' + rel);
  src = injectBlock(src, items);
  fs.writeFileSync(file, src);
  console.log('UPDATED', file);
}

const targets = [
  { dir: 'src/pages/service-areas/anne-arundel/severna-park', items: [
    { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
    { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
    { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
  ]},
  { dir: 'src/pages/service-areas/anne-arundel/glen-burnie', items: [
    { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
  ]},
  { dir: 'src/pages/service-areas/anne-arundel/pasadena', items: [
    { name: 'Glen Burnie', url: '/service-areas/anne-arundel/glen-burnie/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
  ]},
  { dir: 'src/pages/service-areas/anne-arundel/annapolis', items: [
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
    { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
  ]},
  { dir: 'src/pages/service-areas/anne-arundel/millersville', items: [
    { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
  ]},
  { dir: 'src/pages/service-areas/anne-arundel/odenton', items: [
    { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Glen Burnie', url: '/service-areas/anne-arundel/glen-burnie/' },
  ]},
  { dir: 'src/pages/service-areas/howard/columbia', items: [
    { name: 'Anne Arundel County', url: '/service-areas/anne-arundel/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
  ]},
];

for (const t of targets) {
  const f = pickFile(t.dir);
  if (!f) { console.log('SKIP (missing)', t.dir); continue; }
  inject(f, t.items);
}
