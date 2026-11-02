import { getImage } from 'astro:assets';

// Images de cartes et visuels de pages choisis dans l'admin : Keystatic les range dans src/assets/builds/<build>/.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/builds/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

/** Version légère pour un fond en filigrane : 800 px de large en WebP suffisent. */
export async function imageDeCarte(chemin: string | null) {
  const source = chemin ? images[chemin]?.default : undefined;
  if (!source) return undefined;
  return getImage({ src: source, width: Math.min(800, source.width), format: 'webp', quality: 60 });
}

/** Visuel en tête de la page d'un build, sur toute la largeur du contenu. */
export async function visuelDePage(chemin: string | null) {
  const source = chemin ? images[chemin]?.default : undefined;
  if (!source) return undefined;
  return getImage({ src: source, width: Math.min(2000, source.width), format: 'webp', quality: 78 });
}

/** Aperçu affiché quand un lien est partagé (og:image) : 1200 × 630 en JPEG, lu partout. */
export async function imageDePartage(chemin: string | null) {
  const source = chemin ? images[chemin]?.default : undefined;
  if (!source) return undefined;
  return getImage({ src: source, width: 1200, height: 630, fit: 'cover', format: 'jpg', quality: 80 });
}
