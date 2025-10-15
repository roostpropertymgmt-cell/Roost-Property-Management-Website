const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'src', 'pages');
const metaRe = /<meta\s+name="description"\s+content=\{description\}\s*\/>/i;
const block = `<meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.url?.href || ""} />
    <meta property="og:image" content="/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content="/logo.png" />`;

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.isFile() && p.endsWith('.astro')) {
      const src = fs.readFileSync(p, 'utf8');
      if (metaRe.test(src) && !src.includes('og:title')) {
        const out = src.replace(metaRe, block);
        fs.writeFileSync(p, out);
        console.log('UPDATED', p);
      }
    }
  }
}
walk(ROOT);
