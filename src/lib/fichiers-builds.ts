// Fichiers des builds lus au moment du build du site, admin comprise : un build créé dans l'admin
// n'apparaît ici (pages, couleurs déjà utilisées) qu'après le redéploiement qui suit.
const fichiers = import.meta.glob<string>('/src/content/builds/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Builds triés par numéro, avec le texte brut de leur fichier. */
export const FICHIERS_BUILDS = Object.entries(fichiers)
  .map(([chemin, texte]) => ({
    slug: chemin.slice(chemin.lastIndexOf('/') + 1, -'.yaml'.length),
    nom:
      /^nom: (.+)$/m
        .exec(texte)?.[1]
        ?.trim()
        .replace(/^(['"])(.*)\1$/, '$2') ?? 'Build',
    numero: Number(/^numero: (\d+)$/m.exec(texte)?.[1] ?? 99),
    texte,
  }))
  .sort((a, b) => a.numero - b.numero);
