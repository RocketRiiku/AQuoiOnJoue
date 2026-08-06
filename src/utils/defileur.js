/**
 * Le déroulé des jeux « tirer et montrer », sans une ligne de rendu.
 *
 * Six jeux du catalogue n'attendent rien d'autre du téléphone qu'une carte à
 * lire à voix haute, puis la suivante : Le Joker, Oui ou non ?, Tu préfères ?,
 * Du Coq à l'Âne, Qui de nous ?, Sang bleu. Aucun score, aucune réponse à
 * révéler, aucune équipe. Leur **mécanique** se déduit entièrement de deux
 * données déjà au catalogue — le `type` de leur contenu, qui donne le mot du
 * bouton de tirage, et `chronoTour`, qui décide s'il y a un décompte. D'où un
 * seul réducteur pour les six, plutôt que six copies du même écran. Seul le
 * rappel d'avant-partie s'écrit jeu par jeu (`RAPPELS`, plus bas).
 *
 * Le nom de ce qu'on tire vit dans `pioche.js` : le quiz d'animateur en a eu
 * besoin à son tour, et c'est le vocabulaire de LancerJeu, pas celui d'ici.
 *
 * **La pile ne se recharge pas toute seule.** Elle est mélangée une fois au
 * départ et se parcourt sans répétition : revoir la même proposition à vingt
 * minutes d'intervalle casse le jeu bien plus sûrement que d'arriver au bout
 * d'une liste de cinquante. Quand elle est épuisée, l'écran le dit et propose
 * de remélanger.
 *
 * La blessure critique est le septième jeu de la famille et **ne passe pas par
 * ici** : son tirage est un jet de dé, donc *avec remise*. La même face peut
 * retomber, et c'est précisément le sel du jeu. Voir `blessureCritique.js`.
 */
import { melangeAleatoire } from './pioche';

/**
 * Le geste ou la règle à rappeler avant la première carte, par jeu.
 *
 * **La seule chose du défileur qui ne se déduise pas des données.** Le mot du
 * bouton vient du `type` de la ligne, le chrono de `chronoTour` ; une phrase
 * d'accroche, elle, s'écrit. Elle ne répète pas les règles de la fiche : elle
 * porte ce qui se perd entre la lecture et la première carte — la contrainte
 * qui fait le jeu, ou le matériel à sortir de sa boîte.
 *
 * Un jeu sans entrée ici ouvre directement sur sa première carte : le rappel
 * est une aide, pas un péage.
 */
const RAPPELS = {
  'le-joker':
    'Chacun démarre avec un seul Joker. Refuser une question le brûle : après ça, il faudra répondre à tout.',
  'oui-ou-non':
    'On répond par oui ou par non, tous en même temps, à main levée. Ni justification, ni nuance.',
  'tu-preferes':
    'Tout le monde répond en même temps, à main levée. Pas d’abstention, pas de demande de précision.',
  'du-coq-a-l-ane':
    'Une feuille et un stylo par personne. La phrase tirée se recopie en haut de la vôtre, puis on passe à son voisin de gauche.',
  'qui-de-nous':
    'Au signal, tout le monde pointe quelqu’un du doigt. Sans réfléchir, et sans discuter.',
  'sang-bleu':
    'Distribuez une carte face cachée à chacun, qui la plaque sur son front sans la regarder. L’As vaut 1, le Roi vaut 13.'
};

export const rappelDe = (slug) => RAPPELS[slug] ?? null;

export function etatInitial({ cartes, melanger = melangeAleatoire }) {
  return { pile: melanger(cartes), index: 0 };
}

/**
 * @param etat   état courant
 * @param action `suivante` | `precedente` | `recommencer`
 */
export function reducteur(etat, action) {
  switch (action.type) {
    // Un cran au-delà de la dernière carte : c'est l'état « pile épuisée », et
    // non une carte de plus. L'écran de fin s'y accroche.
    case 'suivante':
      return etat.index < etat.pile.length ? { ...etat, index: etat.index + 1 } : etat;

    // Revenir en arrière, parce qu'on lit à voix haute et qu'on tape vite : une
    // carte tournée par erreur emporte sinon une question que personne n'a
    // entendue. Même raison que l'annulation de Trois fois rien.
    case 'precedente':
      return etat.index > 0 ? { ...etat, index: etat.index - 1 } : etat;

    case 'recommencer':
      return etatInitial({ cartes: etat.pile, melanger: action.melanger });

    default:
      return etat;
  }
}

export const carteCourante = (etat) => etat.pile[etat.index] ?? null;

export const epuise = (etat) => etat.index >= etat.pile.length;

/** Ce qu'il reste **après** la carte affichée. */
export const restantes = (etat) => Math.max(0, etat.pile.length - etat.index - 1);
