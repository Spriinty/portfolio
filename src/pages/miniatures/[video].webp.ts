import type { APIRoute, GetStaticPaths } from 'astro';
import { lireVideos } from '../../lib/contenu';
import { miniatureAjoutee, miniatureDistante } from '../../lib/videos';

// Miniatures récupérées sur TikTok ou YouTube, enregistrées dans le site au moment du build.
export const getStaticPaths = (async () => {
  const videos = (await lireVideos()).filter((video) => !miniatureAjoutee(video));
  const miniatures = await Promise.all(videos.map((video) => miniatureDistante(video)));
  return videos.flatMap((video, i) => {
    const octets = miniatures[i];
    return octets ? [{ params: { video: video.slug }, props: { octets } }] : [];
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.octets as Uint8Array<ArrayBuffer>, { headers: { 'Content-Type': 'image/webp' } });
