// src/pages/api/lead.ts
import type { APIRoute } from 'astro';

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json',
};

const isValidMakeUrl = (u: string) => {
  try {
    const url = new URL(u);
    const hostOk =
      url.hostname === 'hook.us1.make.com' || url.hostname === 'hook.us2.make.com';
    return hostOk && url.pathname.length > 1;
  } catch {
    return false;
  }
};

export const OPTIONS: APIRoute = async () =>
  new Response(null, { headers: corsHeaders });

export const POST: APIRoute = async ({ request, locals }) => {
  // Cloudflare Pages adapter exposes runtime envs here:
  // locals.runtime.env.MAKE_WEBHOOK_URL
  const MAKE_WEBHOOK_URL =
    (locals as any)?.runtime?.env?.MAKE_WEBHOOK_URL as string | undefined;

  if (!MAKE_WEBHOOK_URL || !isValidMakeUrl(MAKE_WEBHOOK_URL)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          'Missing/invalid MAKE_WEBHOOK_URL (must be https://hook.us{1|2}.make.com/<id>)',
      }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Parse body
  let raw: Record<string, unknown> = {};
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Honeypot
  if ((raw as any)?._hp) {
    return new Response(JSON.stringify({ ok: true, spam: true }), {
      headers: corsHeaders,
    });
  }

  // Normalize
  const norm = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const name = norm(raw.name);
  const email = norm(raw.email).toLowerCase();
  const phoneRaw = norm(raw.phone);
  const message = norm(raw.message);

  const phone = phoneRaw.replace(/[^\d+]/g, '');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk) {
    return new Response(
      JSON.stringify({ ok: false, error: 'name and valid email are required' }),
      { status: 422, headers: corsHeaders }
    );
  }

  // Meta
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    '';
  const ua = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const cfCity = request.headers.get('cf-ipcity') || '';
  const cfCountry = request.headers.get('cf-ipcountry') || '';
  const cfRay = request.headers.get('cf-ray') || '';

  const payload = {
    name,
    email,
    phone,
    message,
    source: 'website',
    receivedAt: new Date().toISOString(),
    ip,
    userAgent: ua,
    referer,
    cf: { city: cfCity, country: cfCountry, ray: cfRay },
  };

  // Forward to Make
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return new Response(
      JSON.stringify({
        ok: false,
        forwarded: false,
        status: res.status,
        body: text.slice(0, 500),
      }),
      { status: 502, headers: corsHeaders }
    );
  }

  return new Response(JSON.stringify({ ok: true, forwarded: true }), {
    headers: corsHeaders,
  });
};

