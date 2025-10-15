import type { MiddlewareHandler } from 'astro';

const nearbyMap: Record<string, { name: string; url: string }[]> = {
  'anne-arundel/severna-park': [
    { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
    { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
    { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
  ],
  'anne-arundel/glen-burnie': [
    { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
  ],
  'anne-arundel/pasadena': [
    { name: 'Glen Burnie', url: '/service-areas/anne-arundel/glen-burnie/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
  ],
  'anne-arundel/annapolis': [
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Pasadena', url: '/service-areas/anne-arundel/pasadena/' },
    { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
  ],
  'anne-arundel/millersville': [
    { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Annapolis', url: '/service-areas/anne-arundel/annapolis/' },
  ],
  'anne-arundel/odenton': [
    { name: 'Millersville', url: '/service-areas/anne-arundel/millersville/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Glen Burnie', url: '/service-areas/anne-arundel/glen-burnie/' },
  ],
  'howard/columbia': [
    { name: 'Anne Arundel County', url: '/service-areas/anne-arundel/' },
    { name: 'Severna Park', url: '/service-areas/anne-arundel/severna-park/' },
    { name: 'Odenton', url: '/service-areas/anne-arundel/odenton/' },
  ],
};

function renderNearby(items: { name: string; url: string }[]) {
  const links = items
    .map(
      (it) =>
        `<li><a class="inline-block rounded-lg border px-3 py-1 hover:bg-slate-50" href="${it.url}">${it.name}</a></li>`
    )
    .join('');
  return `
<section id="nearby-areas" class="mt-12">
  <h2 class="text-xl font-semibold mb-3">Nearby Areas</h2>
  <ul class="flex flex-wrap gap-3">
    ${links}
  </ul>
</section>`;
}

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const res = await next();
  const ct = res.headers.get('content-type') || '';
  const url = new URL(ctx.request.url);

  if (!ct.includes('text/html')) {
    return res;
  }

  const match = url.pathname.replace(/\/+$/, '').match(/^\/service-areas\/([^/]+)\/([^/]+)\/?$/);
  const key = match ? `${match[1]}/${match[2]}` : '';
  const items = nearbyMap[key];

  let html = await res.text();

  if (items && items.length) {
    const block = renderNearby(items);
    if (html.includes('</main>')) {
      html = html.replace('</main>', `${block}\n</main>`);
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', `${block}\n</body>`);
    } else {
      html += block;
    }
  }

  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'no-store, max-age=0');

  return new Response(html, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};
