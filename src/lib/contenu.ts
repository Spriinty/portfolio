import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

const lecteur = createReader(process.cwd(), config);

// Le lecteur Keystatic lit les fichiers sans que Vite le sache. Les importer ici les rattache
// aux pages : en dev, un build ajouté ou modifié dans l'admin met aussi à jour la liste des pages.
import.meta.glob('/src/content/**/*.yaml', { query: '?raw', eager: true });

export async function lireStudio() {
  const studio = await lecteur.singletons.studio.read();
  if (!studio) throw new Error('Contenu du studio introuvable : src/content/studio.yaml');
  return studio;
}

/** Builds triés par numéro, sans ceux masqués dans l'admin. */
export async function lireBuilds() {
  const entrees = await lecteur.collections.builds.all();
  return entrees
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((build) => build.visible)
    .sort((a, b) => a.numero - b.numero);
}

export type Build = Awaited<ReturnType<typeof lireBuilds>>[number];
