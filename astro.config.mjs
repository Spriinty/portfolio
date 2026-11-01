// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// L'admin (/keystatic) est déployée : en ligne elle passe par GitHub et exige une connexion
// avec un compte ayant accès au repo (voir src/lib/admin.ts).
export default defineConfig({
  integrations: [react(), keystatic()],
  adapter: vercel(),
});
