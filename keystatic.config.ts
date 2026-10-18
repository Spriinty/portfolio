import { collection, config, fields, singleton } from '@keystatic/core';
import { SEUILS } from './src/lib/statut';

const couleur = (label: string, description?: string) =>
  fields.text({
    label,
    description,
    validation: {
      isRequired: true,
      pattern: { regex: /^#[0-9a-fA-F]{6}$/, message: 'Format attendu : #RRGGBB' },
    },
  });

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'Spriinty’s Studio' } },

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

  collections: {
    builds: collection({
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
          description: 'Date de la dernière vidéo, mise à jour ou session de travail',
          defaultValue: { kind: 'today' },
        }),
        couleurs: fields.object(
          {
            titre: couleur('Titre', 'Nom du build sur la carte et sur sa page'),
            fond: couleur('Fond de la page', 'Couleur sombre : le texte reste clair'),
            accent: couleur('Accent', 'Boutons et détails de la page'),
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
        pages: fields.text({ label: 'Sous-pages prévues', description: 'Ex. Vidéos · Outillage' }),
      },
    }),
  },
});
