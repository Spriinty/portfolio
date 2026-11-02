import { joursDepuis } from './statut';

const formatCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/** « 12 oct. 2026 » pour une date « AAAA-MM-JJ ». */
export function dateCourte(date: string) {
  return formatCourt.format(new Date(`${date}T12:00:00`));
}

const relatif = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

/** « aujourd’hui », « hier », « il y a 3 jours », « il y a 2 mois »… */
export function depuis(date: string, maintenant = new Date()) {
  const jours = Math.max(0, joursDepuis(date, maintenant));
  if (jours < 14) return relatif.format(-jours, 'day');
  if (jours < 60) return relatif.format(-Math.round(jours / 7), 'week');
  if (jours < 365) return relatif.format(-Math.round(jours / 30), 'month');
  return relatif.format(-Math.round(jours / 365), 'year');
}
