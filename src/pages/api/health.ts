import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const MAKE_WEBHOOK_URL = (locals as any)?.runtime?.env?.MAKE_WEBHOOK_URL as string | undefined;
  const started = Date.now();

  try {
    if (!MAKE_WEBHOOK_URL) {
      return new Response(JSON.stringify({ ok:false, error:'missing MAKE_WEBHOOK_URL' }), { status: 500, headers: { 'content-type':'application/json' } });
    }
    // Send a tiny ping to Make (doesn’t reveal the URL)
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'health', ts: new Date().toISOString() })
    });
    const ms = Date.now() - started;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return new Response(JSON.stringify({ ok:false, forwarded:false, status:res.status, ms, body:text.slice(0,200) }), { status: 502, headers: { 'content-type':'application/json' } });
    }
    return new Response(JSON.stringify({ ok:true, forwarded:true, ms }), { headers: { 'content-type':'application/json' } });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status: 502, headers: { 'content-type':'application/json' } });
  }
};
