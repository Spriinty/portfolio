import {
  siAstro,
  siClaude,
  siGithub,
  siGithubpages,
  siGodotengine,
  siGooglegemini,
  siItchdotio,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siPrisma,
  siReact,
  siResend,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
  siWebgl,
  siWordpress,
  type SimpleIcon,
} from 'simple-icons';

// Nom tel qu'écrit dans « Fabriqué avec » (en minuscules) → logo Simple Icons (licence CC0).
// Un outil absent de cette table n'a pas de logo dans l'animation : Keystatic, Phaser et Google Labs
// n'existent pas dans Simple Icons, et leur « Canvas » est un logiciel scolaire, pas le canvas HTML.
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
