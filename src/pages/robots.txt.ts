import type { APIRoute } from 'astro';

const body = [
  'User-agent: *',
  'Allow: /',
  'Sitemap: https://roost-property-management-website.pages.dev/sitemap.xml',
  ''
].join('\n');

export const GET: APIRoute = async () =>
  new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });

