import type { APIRoute } from 'astro';
import { CONTACT_DESTINATAIRE, RESEND_API_KEY, TURNSTILE_SECRET_KEY } from 'astro:env/server';

// Seule route du site, avec l'admin, à tourner sur Vercel : le formulaire de contact.
// L'adresse de réception n'est jamais dans les pages, elle vit dans les variables Vercel.
export const prerender = false;

const EXPEDITEUR = 'Spriinty’s Studio <studio@workmi.pro>';
const SECRET_TURNSTILE =
  TURNSTILE_SECRET_KEY ?? (import.meta.env.DEV ? '1x0000000000000000000000000000000AA' : undefined);

const reponse = (statut: number, corps: { ok: boolean; erreur?: string }) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const donnees = await request.formData().catch(() => null);
  if (!donnees) return reponse(400, { ok: false, erreur: 'Formulaire illisible.' });
  const champ = (nom: string) => String(donnees.get(nom) ?? '').trim();

  // Champ piège invisible : un humain le laisse vide. On répond comme si tout allait bien.
  if (champ('site')) return reponse(200, { ok: true });

  const nom = champ('nom').slice(0, 100);
  const email = champ('email');
  const message = champ('message');
  if (!nom) return reponse(400, { ok: false, erreur: 'Indiquez votre nom.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return reponse(400, { ok: false, erreur: 'Cette adresse e-mail ne semble pas valide.' });
  }
  if (message.length < 10) return reponse(400, { ok: false, erreur: 'Votre message est un peu court.' });
  if (message.length > 5000) return reponse(400, { ok: false, erreur: 'Votre message dépasse 5 000 caractères.' });

  if (!SECRET_TURNSTILE) return reponse(503, { ok: false, erreur: 'Le formulaire n’est pas encore en service.' });
  const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: SECRET_TURNSTILE, response: champ('cf-turnstile-response'), remoteip: clientAddress }),
  })
    .then((r) => r.json())
    .catch(() => null);
  if (!verification?.success) {
    return reponse(400, { ok: false, erreur: 'La vérification anti-robot a échoué. Réessayez dans un instant.' });
  }

  if (!RESEND_API_KEY || !CONTACT_DESTINATAIRE) {
    if (import.meta.env.DEV) {
      console.info(`[contact] message d'essai de ${nom} <${email}>, non envoyé (pas de clé Resend en local)`);
      return reponse(200, { ok: true });
    }
    return reponse(503, { ok: false, erreur: 'Le formulaire n’est pas encore en service.' });
  }

  const envoi = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: EXPEDITEUR,
      to: [CONTACT_DESTINATAIRE],
      reply_to: email,
      subject: `Studio · message de ${nom}`,
      text: `${message}\n\n— ${nom} <${email}>\nEnvoyé depuis le formulaire de Spriinty’s Studio.`,
    }),
  }).catch(() => null);
  if (!envoi?.ok) {
    return reponse(502, { ok: false, erreur: 'L’envoi a échoué. Réessayez plus tard.' });
  }
  return reponse(200, { ok: true });
};
