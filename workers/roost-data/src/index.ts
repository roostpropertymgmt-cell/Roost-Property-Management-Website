export interface Env {
  ROOST_LOCAL_GRAPH: KVNamespace;
  CITIES: string;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

async function refreshCity(env: Env, city: string) {
  // TODO: replace with your real data sources (e.g., your Places/Event proxies)
  const now = new Date().toISOString();
  const demo = {
    city,
    updatedAt: now,
    spots: [
      { name: 'Demo Coffee', type: 'cafe', rating: 4.6 },
      { name: 'Harbor Park', type: 'park', rating: 4.8 }
    ],
  };
  // Cache for 3 days
  await env.ROOST_LOCAL_GRAPH.put(`local-spots:${city}`, JSON.stringify(demo), {
    expirationTtl: 60 * 60 * 24 * 3,
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname.startsWith('/data/local-spots/')) {
      const city = url.pathname.split('/').pop()!;
      const key = `local-spots:${city}`;

      // 1) Try KV first
      const cached = await env.ROOST_LOCAL_GRAPH.get(key);
      if (cached) {
        return new Response(cached, {
          status: 200,
          headers: { ...cors, 'content-type': 'application/json' },
        });
      }

      // 2) Populate if missing
      await refreshCity(env, city);
      const fresh = await env.ROOST_LOCAL_GRAPH.get(key);

      return new Response(fresh ?? JSON.stringify({ city, spots: [] }), {
        status: 200,
        headers: { ...cors, 'content-type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, hint: 'Use /data/local-spots/:city' }),
      { status: 200, headers: { ...cors, 'content-type': 'application/json' } }
    );
  },

  // Nightly refresh
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cities = (env.CITIES || '').split(',').map((s) => s.trim()).filter(Boolean);
    await Promise.all(cities.map((city) => refreshCity(env, city)));
  },
};
