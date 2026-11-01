import Markdoc, { type Config, type Node } from '@markdoc/markdoc';
import { getImage } from 'astro:assets';

// Images insérées dans les pages : Keystatic les range dans src/assets/pages/<build>/<page>/.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/pages/**/*.{jpg,jpeg,png,webp,avif,gif,svg,JPG,JPEG,PNG,WEBP,GIF}',
  { eager: true },
);

const configuration: Config = {
  nodes: {
    image: {
      ...Markdoc.nodes.image,
      attributes: {
        ...Markdoc.nodes.image.attributes,
        width: { type: Number },
        height: { type: Number },
      },
      transform(node, config) {
        return new Markdoc.Tag('img', { ...node.transformAttributes(config), loading: 'lazy', decoding: 'async' });
      },
    },
    link: {
      ...Markdoc.nodes.link,
      // Les liens vers d'autres sites s'ouvrent dans un nouvel onglet.
      transform(node, config) {
        const attributs = node.transformAttributes(config);
        const externe = /^https?:\/\//.test(attributs.href ?? '');
        return new Markdoc.Tag(
          'a',
          externe ? { ...attributs, target: '_blank', rel: 'noopener noreferrer' } : attributs,
          node.transformChildren(config),
        );
      },
    },
  },
};

/** Contenu d'une page écrit dans l'admin, en HTML, avec ses images converties en WebP. */
export async function contenuEnHtml(document: Node) {
  for (const noeud of document.walk()) {
    if (noeud.type !== 'image') continue;
    const source = images[decodeURI(noeud.attributes.src)]?.default;
    if (!source) continue;
    // Les GIF (animés) et les SVG passent tels quels.
    if (source.format === 'gif' || source.format === 'svg') {
      Object.assign(noeud.attributes, { src: source.src, width: source.width, height: source.height });
      continue;
    }
    const image = await getImage({ src: source, width: Math.min(1600, source.width), format: 'webp', quality: 75 });
    Object.assign(noeud.attributes, {
      src: image.src,
      width: Number(image.attributes.width),
      height: Number(image.attributes.height),
    });
  }
  return Markdoc.renderers.html(Markdoc.transform(document, configuration));
}
