import { collection, config, fields, singleton } from '@keystatic/core';
import { ADMIN_GITHUB, REPO } from './src/lib/admin';
import { couleur } from './src/lib/champ-couleur';
import { FICHIERS_BUILDS } from './src/lib/fichiers-builds';
import { SEUILS } from './src/lib/statut';

/** Adresse réservée dans chaque build : /<build>/videos liste ses vidéos. */
export const ADRESSE_VIDEOS = 'videos';

// Une collection de pages par build, rangée dans src/content/pages/<build>/ : chaque build a ses
// adresses (/workmi/presentation et /hundred-level-laser/presentation peuvent coexister).
function collectionDePages(slug: string, nom: string) {
  return collection({
    label: `Pages · ${nom}`,
    slugField: 'titre',
    path: `src/content/pages/${slug}/*`,
    format: { contentField: 'contenu' },
    entryLayout: 'content',
    columns: ['ordre'],
    schema: {
      titre: fields.slug({
        name: { label: 'Titre de la page', validation: { isRequired: true } },
        slug: {
          label: 'Adresse de la page',
          description: `Ex. presentation donne /${slug}/presentation`,
          validation: {
            pattern: {
              regex: new RegExp(`^(?!${ADRESSE_VIDEOS}$)`),
              message: `L’adresse « ${ADRESSE_VIDEOS} » est réservée à la page des vidéos du build`,
            },
          },
        },
      }),
      visible: fields.checkbox({
        label: 'Publier sur le site',
        description: 'Décocher pour garder la page en brouillon',
        defaultValue: true,
      }),
      ordre: fields.integer({
        label: 'Ordre dans le menu du build',
        defaultValue: 1,
        validation: { isRequired: true },
      }),
      resume: fields.text({
        label: 'Résumé',
        description: 'Une ou deux phrases : sur la carte de la page et pour les moteurs de recherche',
        multiline: true,
      }),
      contenu: fields.markdoc({
        label: 'Contenu',
        options: {
          heading: [2, 3],
          codeBlock: false,
          image: { directory: `src/assets/pages/${slug}`, publicPath: `/src/assets/pages/${slug}/` },
        },
      }),
    },
  });
}

const pagesDesBuilds: Record<`pages-${string}`, ReturnType<typeof collectionDePages>> = Object.fromEntries(
  FICHIERS_BUILDS.map(({ slug, nom }) => [`pages-${slug}`, collectionDePages(slug, nom)]),
);

const builds = collection({
  label: 'Builds',
  slugField: 'nom',
  path: 'src/content/builds/*',
  format: { data: 'yaml' },
  schema: {
    nom: fields.slug({
      name: { label: 'Nom du build' },
      slug: { label: 'Adresse de la page', description: 'Ex. comeback-guitar-lab donne /comeback-guitar-lab' },
    }),
    numero: fields.integer({ label: 'Numéro de build', validation: { isRequired: true, min: 1 } }),
    visible: fields.checkbox({ label: 'Afficher sur le site', defaultValue: true }),
    type: fields.text({ label: 'Type', description: 'Ex. Lutherie · restauration' }),
    resume: fields.text({ label: 'Résumé', multiline: true }),
    image: fields.image({
      label: 'Image de la carte',
      description:
        'Photo ou capture du projet (JPG, PNG ou WebP). Elle apparaît en filigrane au survol de la carte, et discrètement en permanence sur mobile.',
      directory: 'src/assets/builds',
      publicPath: '/src/assets/builds/',
    }),
    visuel: fields.image({
      label: 'Visuel de la page',
      description:
        'Grande image en tête de la page du build : capture, photo, image du jeu… Format paysage, au moins 1600 px de large. Elle sert aussi d’aperçu quand le lien est partagé.',
      directory: 'src/assets/builds',
      publicPath: '/src/assets/builds/',
    }),
    statut: fields.select({
      label: 'Statut',
      description: `Automatique : plein régime si la dernière activité date de moins de ${SEUILS.ralenti} jours, au ralenti jusqu’à ${SEUILS.garage} jours, au garage au-delà.`,
      options: [
        { label: 'Automatique (selon la dernière activité)', value: 'auto' },
        { label: 'Plein régime', value: 'plein-regime' },
        { label: 'Au ralenti', value: 'au-ralenti' },
        { label: 'Au garage', value: 'au-garage' },
      ],
      defaultValue: 'auto',
    }),
    derniereActivite: fields.date({
      label: 'Dernière activité',
      description:
        'Date de la dernière mise à jour ou session de travail. Une vidéo plus récente ajoutée dans « Vidéos » la remplace toute seule.',
      defaultValue: { kind: 'today' },
    }),
    couleurs: fields.object(
      {
        titre: couleur('Couleur du titre', 'Couleur du nom du build, sur sa carte et sur sa page', 'vive'),
        fond: couleur('Couleur de fond', 'Fond de la page du build : une teinte sombre, le texte reste clair', 'sombre'),
        accent: couleur("Couleur d'accent", 'Boutons et détails de la page du build', 'vive'),
      },
      { label: 'Couleurs' },
    ),
    liens: fields.array(
      fields.object({
        libelle: fields.text({ label: 'Libellé', validation: { isRequired: true } }),
        url: fields.url({ label: 'Adresse', validation: { isRequired: true } }),
      }),
      { label: 'Liens', itemLabel: (props) => props.fields.libelle.value || 'Nouveau lien' },
    ),
    pages: fields.text({
      label: 'Sous-pages prévues',
      description:
        'Ex. Vidéos · Outillage. Affichées « en préparation » tant qu’elles ne sont pas créées dans « Pages des builds » ou « Vidéos ».',
    }),
  },
});

const videos = collection({
  label: 'Vidéos',
  slugField: 'titre',
  path: 'src/content/videos/*',
  format: { data: 'yaml' },
  columns: ['build', 'date'],
  schema: {
    titre: fields.slug({
      name: { label: 'Titre de la vidéo', validation: { isRequired: true } },
      slug: { label: 'Nom du fichier', description: 'Rempli tout seul à partir du titre' },
    }),
    build: fields.relationship({
      label: 'Build',
      collection: 'builds',
      validation: { isRequired: true },
    }),
    date: fields.date({
      label: 'Date de publication',
      description: 'Elle sert aussi de dernière activité du build',
      defaultValue: { kind: 'today' },
      validation: { isRequired: true },
    }),
    liens: fields.object(
      {
        tiktok: fields.url({ label: 'TikTok' }),
        instagram: fields.url({ label: 'Instagram (reel)' }),
        youtube: fields.url({ label: 'YouTube (short ou vidéo)' }),
        facebook: fields.url({ label: 'Facebook' }),
      },
      {
        label: 'Liens',
        description:
          'Au moins un. Une vidéo publiée sur plusieurs plateformes reste une seule carte, avec un bouton par plateforme.',
      },
    ),
    miniature: fields.image({
      label: 'Miniature',
      description:
        'Facultative : sans image, celle de YouTube (ou de TikTok quand il la fournit) est récupérée toute seule. Une capture verticale suffit.',
      directory: 'src/assets/videos',
      publicPath: '/src/assets/videos/',
    }),
  },
});

const collections: { builds: typeof builds; videos: typeof videos } & typeof pagesDesBuilds = {
  builds,
  videos,
  ...pagesDesBuilds,
};

export default config({
  storage: ADMIN_GITHUB ? { kind: 'github', repo: REPO } : { kind: 'local' },
  ui: {
    brand: { name: 'Spriinty’s Studio' },
    navigation: {
      Studio: ['studio', 'builds'],
      Vidéos: ['videos'],
      'Pages des builds': Object.keys(pagesDesBuilds) as `pages-${string}`[],
    },
  },

  singletons: {
    studio: singleton({
      label: 'Le studio',
      path: 'src/content/studio',
      format: { data: 'yaml' },
      schema: {
        scene: fields.text({ label: 'Ligne de scène', description: 'Petite ligne au-dessus du grand titre' }),
        titre: fields.text({
          label: 'Grand titre',
          description: 'Chaque retour à la ligne donne une ligne du titre',
          multiline: true,
        }),
        intro: fields.text({ label: 'Introduction', multiline: true }),
        manifeste: fields.object(
          {
            surtitre: fields.text({ label: 'Surtitre' }),
            titre: fields.text({ label: 'Titre' }),
            texte: fields.text({ label: 'Texte', multiline: true }),
          },
          { label: 'Bloc « le studio ne ferme jamais »' },
        ),
        atelier: fields.object(
          {
            titre: fields.text({ label: 'Titre' }),
            texte: fields.text({ label: 'Texte', multiline: true }),
            technos: fields.array(
              fields.object({
                groupe: fields.text({ label: 'Groupe' }),
                outils: fields.text({ label: 'Outils', description: 'Séparés par des virgules' }),
              }),
              { label: 'Fabriqué avec', itemLabel: (props) => props.fields.groupe.value || 'Nouveau groupe' },
            ),
          },
          { label: 'Derrière le studio' },
        ),
        liens: fields.object(
          {
            linkedin: fields.url({ label: 'LinkedIn' }),
            github: fields.url({ label: 'GitHub' }),
            workmi: fields.url({ label: 'Workmi' }),
          },
          { label: 'Liens' },
        ),
      },
    }),
  },

  collections,
});
