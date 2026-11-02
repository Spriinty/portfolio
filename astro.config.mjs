// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// L'admin (/keystatic) est déployée : en ligne elle passe par GitHub et exige une connexion
// avec un compte ayant accès au repo (voir src/lib/admin.ts).
export default defineConfig({
  // Adresse publique, pour les aperçus de partage (og:image). À changer avec le domaine définitif.
  site: 'https://spriinty-studio.vercel.app',
  integrations: [react(), keystatic()],
  adapter: vercel(),
});
