const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

export const onRequest: PagesFunction = async (ctx) => {
  const method = ctx.request.method.toUpperCase();
  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (method !== 'POST') return new Response(JSON.stringify({ ok:false, error:'Method not allowed' }), { status:405, headers:{...corsHeaders,'content-type':'application/json'} });

  try {
    if ((ctx.request.headers.get('content-type') || '').indexOf('application/json') === -1) {
      return new Response(JSON.stringify({ ok:false, error:'Content-Type must be application/json' }), { status:415, headers:{...corsHeaders,'content-type':'application/json'} });
    }

    const body = await ctx.request.json().catch(() => null) as Record<string, any> | null;
    if (!body) return new Response(JSON.stringify({ ok:false, error:'Invalid JSON' }), { status:400, headers:{...corsHeaders,'content-type':'application/json'} });

    if (typeof body._hp === 'string' && body._hp.trim() !== '') {
      return new Response(JSON.stringify({ ok:true, spam:true }), { status:200, headers:{...corsHeaders,'content-type':'application/json'} });
    }

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const source = (body.source || '').toString().trim();
    if (!name || (!email && !phone)) {
      return new Response(JSON.stringify({ ok:false, error:'Name and email or phone are required.' }), { status:400, headers:{...corsHeaders,'content-type':'application/json'} });
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ ok:false, error:'Invalid email format.' }), { status:400, headers:{...corsHeaders,'content-type':'application/json'} });
    }
    if (phone && !/^[0-9\-\+\(\)\s\.]{7,}$/.test(phone)) {
      return new Response(JSON.stringify({ ok:false, error:'Invalid phone format.' }), { status:400, headers:{...corsHeaders,'content-type':'application/json'} });
    }

    const payload = {
      name, email: email || undefined, phone: phone || undefined, message, source,
      receivedAt: new Date().toISOString(),
      ip: ctx.request.headers.get('cf-connecting-ip') || undefined,
      userAgent: ctx.request.headers.get('user-agent') || undefined,
      referer: ctx.request.headers.get('referer') || undefined,
    };

    const hook = (ctx.env as { MAKE_WEBHOOK_URL?: string }).MAKE_WEBHOOK_URL;
    if (!hook || /REPLACE_WITH_YOUR/i.test(hook)) {
      // dev fallback: no real webhook configured
      return new Response(JSON.stringify({ ok:true, dev:true, note:'MAKE_WEBHOOK_URL not set or placeholder', payload }), {
        status:200, headers:{...corsHeaders,'content-type':'application/json'}
      });
    }

    try {
      const f = await fetch(hook, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
      if (!f.ok) {
        const text = await f.text();
        return new Response(JSON.stringify({ ok:false, error:'Webhook failed', status:f.status, text }), {
          status:502, headers:{...corsHeaders,'content-type':'application/json'}
        });
      }
      return new Response(JSON.stringify({ ok:true }), { status:200, headers:{...corsHeaders,'content-type':'application/json'} });
    } catch (netErr: any) {
      // Treat network errors as soft dev success
      return new Response(JSON.stringify({ ok:true, dev:true, note:'Webhook network error (dev fallback)', error: String(netErr), payload }), {
        status:200, headers:{...corsHeaders,'content-type':'application/json'}
      });
    }
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error: e?.message || 'Unknown error' }), {
      status:500, headers:{...corsHeaders,'content-type':'application/json'}
    });
  }
};
