const fs = require('fs');
const path = require('path');

function inject(file, items, importPath) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('NearbyAreas')) return;

  // 1) add import after frontmatter (second --- line)
  const fmEnd = (() => {
    const idx1 = s.indexOf('---');
    if (idx1 === -1) return -1;
    const idx2 = s.indexOf('---', idx1 + 3);
    return idx2 === -1 ? -1 : idx2 + 3;
  })();
  if (fmEnd === -1) throw new Error('Frontmatter not found in ' + file);

  const before = s.slice(0, fmEnd);
  const after = s.slice(fmEnd);
  const importLine = `\nimport NearbyAreas from "${importPath}";\n`;
  s = before + importLine + after;

  // 2) inject block before </main>
  const block = `\n    <NearbyAreas items={${JSON.stringify(items)}} />\n`;
  s = s.replace(/<\/main>/i, match => block + match);

  fs.writeFileSync(file, s);
  console.log('UPDATED', file);
}

// Define targets and link sets
const pages = [
  {
    file: 'src/pages/service-areas/anne-arundel/severna-park/index.astro',
    items: [
      { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
      { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
      { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' }
    ]
  },
  {
    file: 'src/pages/service-areas/anne-arundel/glen-burnie/index.astro',
    items: [
      { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
      { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
      { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' }
    ]
  },
  {
    file: 'src/pages/service-areas/anne-arundel/pasadena/index.astro',
    items: [
      { name: 'Glen Burnie', url: '/service-areas/anne-arundel/glen-burnie/' },
      { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
      { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' }
    ]
  },
  {
    file: 'src/pages/service-areas/anne-arundel/annapolis/index.astro',
    items: [
      { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
      { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
      { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' }
    ]
  },
  {
    file: 'src/pages/service-areas/anne-arundel/millersville/index.astro',
    items: [
      { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
      { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
      { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' }
    ]
  },
  {
    file: 'src/pages/service-areas/anne-arundel/odenton/index.astro',
    items: [
      { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
      { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
      { name: 'Glen Burnie', url: '/service-areas/anne-arundel/glen-burnie/' }
    ]
  },
  {
    file: 'src/pages/service-areas/howard/columbia/index.astro',
    items: [
      { name: 'Anne Arundel County', url: '/service-areas/anne-arundel/' },
      { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
      { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' }
    ]
  }
];

for (const p of pages) {
  if (!fs.existsSync(p.file)) continue;
  const rel = path.relative(path.dirname(p.file), 'src/components/NearbyAreas.astro').replace(/\\/g, '/');
  inject(p.file, p.items, rel.startsWith('.') ? rel : './' + rel);
}
