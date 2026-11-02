import type { APIRoute } from 'astro';

// L'admin n'a rien à faire dans les moteurs de recherche.
export const GET: APIRoute = ({ site }) =>
  new Response(
    ['User-agent: *', 'Disallow: /keystatic', 'Disallow: /api/', '', `Sitemap: ${new URL('/sitemap.xml', site)}`, ''].join(
      '\n',
    ),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
