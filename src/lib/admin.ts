// En dev, l'admin Keystatic écrit dans les fichiers du projet. En ligne, elle écrit dans le repo
// GitHub : connexion obligatoire, et seul un compte ayant accès au repo peut enregistrer.
// Lancer le dev avec PUBLIC_KEYSTATIC_GITHUB=1 force le mode GitHub (création de l'app, tests).
export const ADMIN_GITHUB = import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_GITHUB === '1';

export const REPO = 'Spriinty/portfolio';
const BRANCHE = 'master';

/** Adresse d'une page de l'admin, par exemple `collection/builds/item/workmi`. */
export function lienAdmin(chemin: string) {
  return ADMIN_GITHUB ? `/keystatic/branch/${BRANCHE}/${chemin}` : `/keystatic/${chemin}`;
}
