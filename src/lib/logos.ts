import {
  siAstro,
  siBlender,
  siClaude,
  siDiscord,
  siDotnet,
  siElevenlabs,
  siFacebook,
  siGithub,
  siGithubpages,
  siGodotengine,
  siGooglegemini,
  siInstagram,
  siItchdotio,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siPrisma,
  siReact,
  siResend,
  siSteam,
  siSteamdeck,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTiktok,
  siTwitch,
  siTypescript,
  siVercel,
  siVite,
  siWebgl,
  siWordpress,
  siX,
  siYoutube,
  type SimpleIcon,
} from 'simple-icons';

// Nom tel qu'écrit dans « Fabriqué avec » (en minuscules) → logo Simple Icons (licence CC0).
// Un outil absent de cette table n'a pas de logo dans l'animation : Keystatic, Phaser, Google Labs,
// Google Flow, CapCut et C# n'existent pas dans Simple Icons, et leur « Canvas » est un logiciel
// scolaire, pas le canvas HTML.
const LOGOS: Record<string, SimpleIcon> = {
  claude: siClaude,
  'claude code': siClaude,
  gemini: siGooglegemini,
  'google gemini': siGooglegemini,
  astro: siAstro,
  react: siReact,
  'next.js': siNextdotjs,
  typescript: siTypescript,
  'tailwind css': siTailwindcss,
  supabase: siSupabase,
  prisma: siPrisma,
  postgresql: siPostgresql,
  stripe: siStripe,
  resend: siResend,
  'node.js': siNodedotjs,
  webgl: siWebgl,
  vite: siVite,
  godot: siGodotengine,
  wordpress: siWordpress,
  php: siPhp,
  vercel: siVercel,
  github: siGithub,
  'github pages': siGithubpages,
  'itch.io': siItchdotio,
  '.net': siDotnet,
  blender: siBlender,
  elevenlabs: siElevenlabs,
  'eleven labs': siElevenlabs,
  steam: siSteam,
  'steam deck': siSteamdeck,
  steamdeck: siSteamdeck,
};

/** Logos des outils listés dans « Fabriqué avec », sans doublon (Claude et Claude Code partagent le leur). */
export function logosDesTechnos(technos: readonly { outils: string }[]) {
  const vus = new Set<string>();
  const logos: { nom: string; chemin: string }[] = [];
  for (const { outils } of technos) {
    for (const outil of outils.split(',')) {
      const icone = LOGOS[outil.trim().toLowerCase()];
      if (!icone || vus.has(icone.slug)) continue;
      vus.add(icone.slug);
      logos.push({ nom: icone.title, chemin: icone.path });
    }
  }
  return logos;
}

// Logos des liens d'un build, reconnus à leur adresse (github.io est exclu : c'est souvent le jeu lui-même).
const ICONES_DES_SITES: [RegExp, SimpleIcon][] = [
  [/(^|\.)tiktok\.com$/, siTiktok],
  [/(^|\.)instagram\.com$/, siInstagram],
  [/(^|\.)(youtube\.com|youtu\.be)$/, siYoutube],
  [/(^|\.)(facebook\.com|fb\.com)$/, siFacebook],
  [/(^|\.)itch\.io$/, siItchdotio],
  [/(^|\.)github\.com$/, siGithub],
  [/(^|\.)(x\.com|twitter\.com)$/, siX],
  [/(^|\.)(discord\.gg|discord\.com)$/, siDiscord],
  [/(^|\.)twitch\.tv$/, siTwitch],
  [/(^|\.)steampowered\.com$/, siSteam],
];

export function iconeDeLien(adresse: string) {
  try {
    const hote = new URL(adresse).hostname;
    return ICONES_DES_SITES.find(([motif]) => motif.test(hote))?.[1];
  } catch {
    return undefined;
  }
}
