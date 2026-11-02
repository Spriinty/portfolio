import type { APIRoute } from 'astro';
import { ADRESSE_VIDEOS, lireBuilds } from '../lib/contenu';

// Plan du site pour les moteurs de recherche : l'accueil, chaque build, ses sous-pages et ses vidéos.
// Mêmes adresses que les liens du site et les balises canoniques (sans barre oblique finale).
export const GET: APIRoute = async ({ site }) => {
  const builds = await lireBuilds();
  const pages = [
    { chemin: '/', date: builds.map((build) => build.derniereActivite).filter(Boolean).sort().at(-1) },
    ...builds.flatMap((build) => [
      { chemin: `/${build.slug}`, date: build.derniereActivite },
      ...build.sousPages.map((page) => ({ chemin: `/${build.slug}/${page.slug}`, date: null })),
      ...(build.videos.length > 0
        ? [{ chemin: `/${build.slug}/${ADRESSE_VIDEOS}`, date: build.videos[0].date }]
        : []),
    ]),
  ];
  const urls = pages.map(
    ({ chemin, date }) =>
      `  <url><loc>${new URL(chemin, site)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
