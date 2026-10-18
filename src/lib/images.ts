import { getImage } from 'astro:assets';

// Images de cartes choisies dans l'admin : Keystatic les range dans src/assets/builds/<build>/.
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
