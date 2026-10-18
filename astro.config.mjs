// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// En stockage local, l'API de Keystatic n'a aucune protection : l'admin n'est ajoutée qu'avec
// `astro dev`, jamais au build de production. À remplacer par `keystatic()` une fois le
// stockage GitHub configuré (connexion obligatoire avec un compte ayant accès au repo).
function keystaticEnDevSeulement() {
  const integration = keystatic();
  return {
    name: 'keystatic-en-dev-seulement',
    hooks: {
      /** @param {Parameters<typeof integration.hooks['astro:config:setup']>[0]} options */
      'astro:config:setup': (options) => {
        if (options.command === 'dev') integration.hooks['astro:config:setup'](options);
      },
    },
  };
}

export default defineConfig({
  integrations: [react(), keystaticEnDevSeulement()],
  adapter: vercel(),
});
