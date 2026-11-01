import { createReader } from '@keystatic/core/reader';
import config, { ADRESSE_VIDEOS } from '../../keystatic.config';

export { ADRESSE_VIDEOS };

const lecteur = createReader(process.cwd(), config);

// Le lecteur Keystatic lit les fichiers sans que Vite le sache. Les importer ici les rattache
// aux pages : en dev, un build ajouté ou modifié dans l'admin met aussi à jour la liste des pages.
import.meta.glob('/src/content/**/*.{yaml,mdoc}', { query: '?raw', eager: true });

export async function lireStudio() {
  const studio = await lecteur.singletons.studio.read();
  if (!studio) throw new Error('Contenu du studio introuvable : src/content/studio.yaml');
  return studio;
}

const PLATEFORMES = ['tiktok', 'instagram', 'youtube', 'facebook'] as const;
export type Plateforme = (typeof PLATEFORMES)[number];

/** Vidéos de tous les builds, de la plus récente à la plus ancienne. */
export async function lireVideos() {
  const entrees = await lecteur.collections.videos.all();
  return entrees
    .map(({ slug, entry }) => ({
      slug,
      ...entry,
      liens: PLATEFORMES.filter((plateforme) => entry.liens[plateforme]).map((plateforme) => ({
        plateforme,
        url: entry.liens[plateforme] as string,
      })),
    }))
    .filter((video) => video.build && video.liens.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type Video = Awaited<ReturnType<typeof lireVideos>>[number];

/** Sous-pages publiées d'un build, dans l'ordre choisi dans l'admin. */
async function lirePages(build: string) {
  const collection = lecteur.collections[`pages-${build}`];
  if (!collection) return [];
  const entrees = await collection.all();
  return entrees
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((page) => page.visible && page.slug !== ADRESSE_VIDEOS)
    .sort((a, b) => a.ordre - b.ordre || a.titre.localeCompare(b.titre, 'fr'));
}

export type Page = Awaited<ReturnType<typeof lirePages>>[number];

/** Builds triés par numéro, sans ceux masqués dans l'admin, avec leurs sous-pages et leurs vidéos. */
export async function lireBuilds() {
  const [entrees, videos] = await Promise.all([lecteur.collections.builds.all(), lireVideos()]);
  const builds = await Promise.all(
    entrees.map(async ({ slug, entry }) => {
      const sesVideos = videos.filter((video) => video.build === slug);
      // Une vidéo plus récente que la date saisie à la main devient la dernière activité.
      const dates = [entry.derniereActivite, sesVideos[0]?.date].filter((date): date is string => !!date);
      return {
        slug,
        ...entry,
        derniereActivite: dates.sort().at(-1) ?? null,
        sousPages: await lirePages(slug),
        videos: sesVideos,
      };
    }),
  );
  return builds.filter((build) => build.visible).sort((a, b) => a.numero - b.numero);
}

export type Build = Awaited<ReturnType<typeof lireBuilds>>[number];

/** Sous-pages annoncées dans l'admin (« Sous-pages prévues ») qui n'existent pas encore. */
export function pagesPrevues(build: Build) {
  const cle = (texte: string) =>
    texte
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  const faites = new Set([
    ...build.sousPages.map((page) => cle(page.titre)),
    ...(build.videos.length > 0 ? [cle('Vidéos')] : []),
  ]);
  return (build.pages ?? '')
    .split(/[·,;\n]/)
    .map((nom) => nom.trim())
    .filter((nom) => nom && !faites.has(cle(nom)));
}
