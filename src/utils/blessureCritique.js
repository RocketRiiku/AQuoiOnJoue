/**
 * Le jet de dé de « La blessure critique », sans une ligne de rendu.
 *
 * Le jeu ne défile pas une pile : il **relance un dé à vingt faces**, et la
 * même face peut retomber trois fois de suite. C'est toute la différence avec
 * les six autres jeux de la famille (`defileur.js`), qui parcourent leur
 * contenu sans répétition — ici, tirer sans remise supprimerait le jeu.
 *
 * Les effets sont rangés par face dans `lancerJeu.js` : la position dans le
 * tableau **est** le résultat du dé, index 0 pour le 1. Rien à chercher, rien
 * à analyser dans le texte affiché.
 */

/** Un d20, et pas autre chose : les vingt effets sont écrits face par face. */
export const FACES = 20;

/**
 * Les jets gardés en mémoire.
 *
 * Le jeu est un fil rouge : les contraintes s'empilent sur toute la soirée, et
 * « c'était quoi, ton 5 ? » revient forcément. Douze suffisent à retrouver ce
 * qui court encore, sans transformer l'écran en registre.
 */
export const MEMOIRE = 12;

/** @param tirage remplaçable dans les tests, où le hasard n'a rien à prouver. */
export const lancer = (tirage = Math.random) => Math.floor(tirage() * FACES) + 1;

export function etatInitial() {
  return { face: null, historique: [] };
}

/**
 * @param etat   état courant
 * @param action `lancer` (avec une `face` imposée, sinon tirée) | `oublier`
 */
export function reducteur(etat, action) {
  switch (action.type) {
    case 'lancer': {
      const face = action.face ?? lancer();
      return { face, historique: [face, ...etat.historique].slice(0, MEMOIRE) };
    }

    // Fin de soirée, ou table qui repart de zéro : on efface les contraintes
    // sans quitter le jeu.
    case 'oublier':
      return etatInitial();

    default:
      return etat;
  }
}

/** L'effet correspondant à une face, `null` tant que le dé n'a pas été jeté. */
export const effetDe = (effets, face) => (face ? effets[face - 1] ?? null : null);
