export type Statut = 'plein-regime' | 'au-ralenti' | 'au-garage';
export type ChoixStatut = Statut | 'auto';

/** Nombre de jours sans activité avant qu'un build en mode automatique change de statut. */
export const SEUILS = { ralenti: 30, garage: 90 } as const;

export const LIBELLES: Record<Statut, string> = {
  'plein-regime': 'Plein régime',
  'au-ralenti': 'Au ralenti',
  'au-garage': 'Au garage',
};

export function joursDepuis(date: string, maintenant = new Date()): number {
  // Une date « AAAA-MM-JJ » est lue comme minuit UTC.
  return Math.floor((maintenant.getTime() - Date.parse(date)) / 86_400_000);
}

export function statutAuto(derniereActivite: string | null, maintenant = new Date()): Statut {
  if (!derniereActivite) return 'au-garage';
  const jours = joursDepuis(derniereActivite, maintenant);
  if (jours > SEUILS.garage) return 'au-garage';
  if (jours > SEUILS.ralenti) return 'au-ralenti';
  return 'plein-regime';
}

export function statutEffectif(
  choix: ChoixStatut,
  derniereActivite: string | null,
  maintenant = new Date(),
): Statut {
  return choix === 'auto' ? statutAuto(derniereActivite, maintenant) : choix;
}
