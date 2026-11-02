// Fichiers des builds lus au moment du build du site, admin comprise : un build créé dans l'admin
// n'apparaît ici (pages, couleurs déjà utilisées) qu'après le redéploiement qui suit.
const fichiers = import.meta.glob<string>('/src/content/builds/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const ordre = Object.values(
  import.meta.glob<string>('/src/content/ordre.yaml', { query: '?raw', import: 'default', eager: true }),
)[0];
const RANGS = [...(ordre ?? '').matchAll(/^\s*- (.+)$/gm)].map(([, slug]) => slug.trim());

/** Builds dans l'ordre de « Ordre des builds » (les absents à la fin), avec le texte brut de leur fichier. */
export const FICHIERS_BUILDS = Object.entries(fichiers)
  .map(([chemin, texte]) => ({
    slug: chemin.slice(chemin.lastIndexOf('/') + 1, -'.yaml'.length),
    nom:
      /^nom: (.+)$/m
        .exec(texte)?.[1]
        ?.trim()
        .replace(/^(['"])(.*)\1$/, '$2') ?? 'Build',
    texte,
  }))
  .sort((a, b) => rang(a.slug) - rang(b.slug) || a.nom.localeCompare(b.nom, 'fr'));

function rang(slug: string) {
  const i = RANGS.indexOf(slug);
  return i === -1 ? Infinity : i;
}
