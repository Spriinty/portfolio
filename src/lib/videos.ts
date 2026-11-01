import { getImage } from 'astro:assets';
import sharp from 'sharp';
import { siFacebook, siInstagram, siTiktok, siYoutube, type SimpleIcon } from 'simple-icons';
import type { Plateforme, Video } from './contenu';

export const PLATEFORMES: Record<Plateforme, { nom: string; icone: SimpleIcon }> = {
  tiktok: { nom: 'TikTok', icone: siTiktok },
  instagram: { nom: 'Instagram', icone: siInstagram },
  youtube: { nom: 'YouTube', icone: siYoutube },
  facebook: { nom: 'Facebook', icone: siFacebook },
};

// Miniatures choisies dans l'admin : Keystatic les range dans src/assets/videos/<video>/.
const miniatures = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/videos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

export function miniatureAjoutee(video: Video) {
  return video.miniature ? miniatures[video.miniature]?.default : undefined;
}

/** Identifiant d'une vidéo YouTube : youtu.be/ID, watch?v=ID, shorts/ID, embed/ID ou live/ID. */
function idYouTube(adresse: string) {
  try {
    const url = new URL(adresse);
    if (url.hostname === 'youtu.be') return url.pathname.split('/')[1] || null;
    return url.searchParams.get('v') ?? /^\/(?:shorts|embed|live)\/([\w-]+)/.exec(url.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

async function adresseMiniature(video: Video) {
  const youtube = video.liens.find((lien) => lien.plateforme === 'youtube');
  const id = youtube && idYouTube(youtube.url);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  // TikTok donne parfois la miniature dans son oEmbed (sans clé), parfois non.
  const tiktok = video.liens.find((lien) => lien.plateforme === 'tiktok');
  if (tiktok) {
    const reponse = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktok.url)}`, {
      signal: AbortSignal.timeout(8000),
    });
    const donnees = reponse.ok ? await reponse.json() : null;
    if (typeof donnees?.thumbnail_url === 'string') return donnees.thumbnail_url;
  }
  // Instagram et Facebook exigent un compte développeur Meta : miniature à ajouter dans l'admin.
  return null;
}

const telechargees = new Map<string, Promise<Uint8Array | null>>();

/**
 * Miniature récupérée sur la plateforme, en WebP, ou null. Elle est téléchargée au build et servie
 * par le site (les liens d'images de TikTok expirent). Une panne de TikTok ou de YouTube ne doit
 * jamais faire échouer le build : la carte s'affiche alors sans image.
 */
export function miniatureDistante(video: Video) {
  const cle = JSON.stringify([video.slug, video.liens]);
  let miniature = telechargees.get(cle);
  if (!miniature) {
    miniature = (async () => {
      try {
        const adresse = await adresseMiniature(video);
        if (!adresse) return null;
        const reponse = await fetch(adresse, { signal: AbortSignal.timeout(10000) });
        if (!reponse.ok) return null;
        // trim() retire les bandes noires que YouTube ajoute autour des shorts.
        const octets = await sharp(await reponse.arrayBuffer())
          .trim()
          .resize({ width: 480, withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer();
        return new Uint8Array(octets);
      } catch {
        return null;
      }
    })();
    telechargees.set(cle, miniature);
  }
  return miniature;
}

/** Adresse de la miniature d'une carte vidéo, ou undefined pour une carte sans image. */
export async function miniatureDe(video: Video) {
  const ajoutee = miniatureAjoutee(video);
  if (ajoutee) {
    const image = await getImage({ src: ajoutee, width: Math.min(480, ajoutee.width), format: 'webp', quality: 70 });
    return image.src;
  }
  return (await miniatureDistante(video)) ? `/miniatures/${video.slug}.webp` : undefined;
}

const formatDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export function dateVideo(date: string) {
  return formatDate.format(new Date(`${date}T12:00:00`));
}
