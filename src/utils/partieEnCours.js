/**
 * La partie de kit en cours, conservée entre deux visites.
 *
 * Une soirée se joue téléphone en main : on touche la bannière par erreur, on
 * répond à un message, l'onglet est recyclé par le système. Sans mémoire, une
 * demi-heure de partie disparaît sur un geste involontaire.
 *
 * Clé distincte de celle du programme de soirée, et propriétaire distinct :
 * `useNavigation` reste seul maître de l'URL et de la sélection de jeux, ce
 * module ne connaît que la partie en cours. Deux clés, deux responsables — ce
 * qui interdisait deux hooks sur l'historique n'interdit pas deux tiroirs.
 *
 * Le stockage local est un confort, jamais une dépendance : indisponible
 * (navigation privée, cookies bloqués), le kit fonctionne, la partie ne survit
 * simplement pas à la fermeture de l'onglet.
 */
const CLE = 'aquoionjoue:partie';

/** Au-delà, la partie est réputée abandonnée : personne ne reprend une soirée d'avant-hier. */
const PEREMPTION_MS = 12 * 60 * 60 * 1000;

export function lirePartie() {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const partie = JSON.parse(brut);
    if (!partie?.slug || !partie?.etat) return null;
    if (Date.now() - (partie.enregistreeLe ?? 0) > PEREMPTION_MS) {
      effacerPartie();
      return null;
    }
    return partie;
  } catch {
    return null;
  }
}

export function ecrirePartie({ slug, titre, etat, reglages }) {
  try {
    window.localStorage.setItem(
      CLE,
      JSON.stringify({ slug, titre, etat, reglages, enregistreeLe: Date.now() })
    );
  } catch {
    /* stockage indisponible : on continue en mémoire */
  }
}

export function effacerPartie() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* rien à faire : il n'y avait rien à effacer */
  }
}

/** La partie enregistrée concerne-t-elle ce jeu ? */
export function partieDuJeu(slug) {
  const partie = lirePartie();
  return partie && partie.slug === slug ? partie : null;
}
