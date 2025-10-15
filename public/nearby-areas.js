(function () {
  function $(s, r){return (r||document).querySelector(s)}
  function $el(tag, attrs={}, children=[]) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else n.setAttribute(k,v); });
    children.forEach(c=>n.appendChild(typeof c==='string'?document.createTextNode(c):c));
    return n;
  }
  const p = location.pathname.replace(/\/+$/,'');
  const m = p.match(/^\/service-areas\/([^/]+)\/([^/]+)$/);
  if(!m){ return; }
  const key = m[1] + '/' + m[2];
  const map = {
    "anne-arundel/severna-park": [
      { name: "Pasadena", url: "/service-areas/anne-arundel/pasadena/" },
      { name: "Annapolis", url: "/service-areas/anne-arundel/annapolis/" },
      { name: "Millersville", url: "/service-areas/anne-arundel/millersville/" }
    ],
    "anne-arundel/glen-burnie": [
      { name: "Pasadena", url: "/service-areas/anne-arundel/pasadena/" },
      { name: "Severna Park", url: "/service-areas/anne-arundel/severna-park/" },
      { name: "Odenton", url: "/service-areas/anne-arundel/odenton/" }
    ],
    "anne-arundel/pasadena": [
      { name: "Glen Burnie", url: "/service-areas/anne-arundel/glen-burnie/" },
      { name: "Severna Park", url: "/service-areas/anne-arundel/severna-park/" },
      { name: "Annapolis", url: "/service-areas/anne-arundel/annapolis/" }
    ],
    "anne-arundel/annapolis": [
      { name: "Severna Park", url: "/service-areas/anne-arundel/severna-park/" },
      { name: "Pasadena", url: "/service-areas/anne-arundel/pasadena/" },
      { name: "Millersville", url: "/service-areas/anne-arundel/millersville/" }
    ],
    "anne-arundel/millersville": [
      { name: "Odenton", url: "/service-areas/anne-arundel/odenton/" },
      { name: "Severna Park", url: "/service-areas/anne-arundel/severna-park/" },
      { name: "Annapolis", url: "/service-areas/anne-arundel/annapolis/" }
    ],
    "anne-arundel/odenton": [
      { name: "Millersville", url: "/service-areas/anne-arundel/millersville/" },
      { name: "Severna Park", url: "/service-areas/anne-arundel/severna-park/" },
      { name: "Glen Burnie", url: "/service-areas/anne-arundel/glen-burnie/" }
    ],
    "howard/columbia": [
      { name: "Anne Arundel County", url: "/service-areas/anne-arundel/" },
      { name: "Severna Park", url: "/service-areas/anne-arundel/severna-park/" },
      { name: "Odenton", url: "/service-areas/anne-arundel/odenton/" }
    ]
  };
  const items = map[key] || [];
  if(items.length === 0){ return; }
  const main = $('main') || $('body');
  const section = $el('section', { class: 'mt-12', id: 'nearby-areas' }, [
    $el('h2', { class: 'text-xl font-semibold mb-3' }, ['Nearby Areas']),
    $el('ul', { class: 'flex flex-wrap gap-3' },
      items.map(it => $el('li', {}, [
        $el('a', { href: it.url, class: 'inline-block rounded-lg border px-3 py-1 hover:bg-slate-50' }, [it.name])
      ]))
    )
  ]);
  main.appendChild(section);
})();
