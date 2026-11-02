import { PUBLIC_TURNSTILE_SITE_KEY } from 'astro:env/client';

// En dev, la clé de test de Cloudflare (toujours validée) permet d'essayer le formulaire sans compte.
// En ligne, sans clé dans les variables Vercel, le formulaire et son lien ne s'affichent pas.
export const CLE_TURNSTILE = PUBLIC_TURNSTILE_SITE_KEY ?? (import.meta.env.DEV ? '1x00000000000000000000AA' : undefined);
