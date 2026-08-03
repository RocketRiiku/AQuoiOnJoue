import { contenuDuJeu } from '../data/lancerJeu';

/** Modules qui piochent du contenu, et exigent donc des lignes dans LancerJeu. */
export const MODULES_A_CONTENU = ['prompts', 'distribution', 'regle-secrete'];

const modules = (game) => game.kit ?? [];

/**
 * Le bouton « Lancer le jeu » apparaît dès qu'**un seul** des trois champs est
 * renseigné. Ils restent indépendants : un jeu peut tenir un score sans rien
 * avoir à tirer, ou cadencer des tours sans compter de points.
 *
 * Neuf jeux du catalogue n'ont aucun des trois. Sept sont des mécaniques pures
 * — Eau ou vodka ?, La pieuvre, Tête d'affiche, Je n'ai jamais, Chef
 * d'orchestre, Le 21, Carte blanche : rien à tirer, rien à compter. Les deux
 * autres sont des fils rouges à qui `scoring` est refusé par principe (Ban
 * word, Histoires secrètes) : leur partie courrait en parallèle des autres
 * kits, or le tiroir des parties en cours n'en tient qu'une. C'est un état
 * normal, pas un trou à combler.
 */
export function aUnKit(game) {
  return modules(game).length > 0 || Boolean(game.scoring) || Boolean(game.chronoTour);
}

export function aLeModule(game, nom) {
  return modules(game).includes(nom);
}

/** Vrai si le jeu déclare un module qui pioche du contenu. */
export function piocheDuContenu(game) {
  return modules(game).some((nom) => MODULES_A_CONTENU.includes(nom));
}

/**
 * Le kit est-il réellement jouable ?
 *
 * Un jeu qui annonce `prompts` sans une ligne de contenu tirerait dans le vide.
 * Plutôt que d'ouvrir un écran cassé, on n'affiche pas le bouton — et le test
 * du catalogue, lui, fait échouer la construction pour que le trou se voie.
 */
export function kitJouable(game) {
  if (!aUnKit(game)) return false;
  return !piocheDuContenu(game) || contenuDuJeu(game.slug).length > 0;
}
