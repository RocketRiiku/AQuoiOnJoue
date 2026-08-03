/**
 * Le déroulé des jeux qui ne tiennent qu'un score, sans une ligne de rendu.
 *
 * Cinq jeux du catalogue ont un bouton **sans aucun module de `kit`** : Le Liars
 * Club, Avez-vous confiance ?, Tudum, Qui rit sort, Sur parole. Rien à tirer,
 * aucune ligne dans `lancerJeu.js` — l'écran ne fait que compter, et
 * l'invariant du catalogue interdit d'ajouter du contenu à ces jeux.
 *
 * **Une seule primitive : un gain à distribuer.** Tout se ramène à « ces
 * joueurs-là marquent tant », et c'est le barème du jeu qui calcule le tant.
 * Le réducteur ne connaît donc ni conteur, ni duel, ni avertissement : il
 * applique des gains, tient un seuil quand il y en a un, et sait défaire le
 * dernier geste. Les cinq barèmes tiennent chacun en une expression, plus bas.
 *
 * **`elimination` n'est pas une primitive à part.** Chez ces deux jeux, on
 * cumule avant de sortir — deux avertissements pour Qui rit sort, trois pour
 * Sur parole. C'est un compteur doublé d'un `seuil`, et le sens de la victoire
 * suit : le plus haut total sans seuil, le dernier debout avec.
 */

import { melangeAleatoire } from './pioche';

/**
 * Ce qui ne se déduit d'aucune colonne, écrit jeu par jeu.
 *
 * Même statut que `RAPPELS` dans `defileur.js` : le reste vient du catalogue —
 * `scoring` donne le vocabulaire (un point, ou un avertissement), `chronoTour`
 * décide s'il y a un décompte, `minPlayers` borne l'effectif. Ne s'écrivent ici
 * que le **seuil** d'élimination, la **forme** de l'écran, et le **barème** des
 * jeux qui résolvent un tour d'un coup.
 *
 * Trois formes, et elles ne se devinent pas des données :
 *
 * - `auFil` — l'événement tombe n'importe quand, on tape la ligne du joueur ;
 * - `parTour` — un joueur désigné, tout le monde répond, on résout d'un coup ;
 * - `duel` — deux joueurs tirés au sort s'affrontent.
 */
const JEUX = {
  'qui-rit-sort': {
    forme: 'auFil',
    seuil: 2,
    rappel:
      'Tout le monde dans la même pièce. Un sourire repéré vaut un avertissement : touchez la ligne de celui qui a craqué.',
    // L'éliminé reste à l'écran : il rejoint le public et continue à saboter.
    libelleGeste: 'a souri'
  },

  'sur-parole': {
    forme: 'auFil',
    seuil: 3,
    rappel:
      'Trois cartes chacun, face cachée : l’As vaut 11, les figures valent 10. Touchez la ligne de celui qui perd le duel — au troisième avertissement, il sort.',
    libelleGeste: 'perd le duel'
  },

  'liars-club': {
    forme: 'parTour',
    roleCourant: 'raconte',
    questionTrouveurs: 'Qui a démasqué la vraie ?',
    rappel:
      'Chacun son tour, trois anecdotes : une vraie, deux inventées. La table interroge une minute, puis tout le monde vote en même temps.',
    /**
     * Un point à chaque joueur qui a trouvé, et **autant de points au conteur
     * qu'il a trompé de monde**. Le second chiffre se déduit du premier : le
     * demander à la table serait lui faire compter deux fois la même chose.
     */
    resoudre: ({ courant, trouveurs, enJeu }) => [
      ...trouveurs.map((joueur) => ({ joueur, points: 1 })),
      { joueur: courant, points: enJeu.length - 1 - trouveurs.length }
    ]
  },

  tudum: {
    forme: 'parTour',
    roleCourant: 'imite',
    questionTrouveurs: 'Qui a reconnu le son ?',
    rappel:
      'À son tour, un joueur imite son son à la voix. Les autres écrivent leur réponse sans rien dire, puis on révèle ensemble.',
    /**
     * Le bonus du proposeur **se substitue**, il ne s'ajoute pas : trois points
     * si toute la table a trouvé, deux si la moitié y est arrivée, rien sinon.
     */
    resoudre: ({ courant, trouveurs, enJeu }) => {
      const auditeurs = enJeu.length - 1;
      const tousTrouve = auditeurs > 0 && trouveurs.length === auditeurs;
      const moitie = auditeurs > 0 && trouveurs.length * 2 >= auditeurs;
      return [
        ...trouveurs.map((joueur) => ({ joueur, points: 1 })),
        { joueur: courant, points: tousTrouve ? 3 : moitie ? 2 : 0 }
      ];
    }
  },

  'avez-vous-confiance': {
    forme: 'duel',
    rappel:
      'Deux étiquettes par joueur, CONFIANCE et TRAHIR, gardées en main toute la partie. Les duellistes se placent dos à dos, six points en jeu.',
    /**
     * Les trois issues d'un duel, et leurs six points. Le barème est posé par
     * les règles : coopérer partage, trahir seul rafle, trahir tous les deux
     * brûle la mise.
     */
    issues: [
      { cle: 'confiance', libelle: 'Deux CONFIANCE', detail: 'trois points chacun', gains: [3, 3] },
      { cle: 'trahison', libelle: 'Une seule trahison', detail: 'le traître rafle les six', gains: [6, 0] },
      { cle: 'double', libelle: 'Deux trahisons', detail: 'les six points sont perdus', gains: [0, 0] }
    ]
  }
};

export const reglesDe = (slug) => JEUX[slug] ?? null;

/** Les noms par défaut. Aucun prénom n'est demandé : ils se renomment, ils ne se réclament pas. */
export const nomsJoueurs = (nombre) => Array.from({ length: nombre }, (_, i) => `Joueur ${i + 1}`);

export function etatInitial({ joueurs, seuil = null, forme = 'auFil' }) {
  return {
    joueurs,
    scores: joueurs.map(() => 0),
    // Deux tableaux parallèles plutôt qu'un objet par joueur : les scores
    // partent tels quels dans le tableau, et un nom en double ne casse rien.
    sortis: joueurs.map(() => false),
    // Qui est déjà passé. « Jusqu'à ce que chacun soit passé au moins une
    // fois » est une consigne de trois de ces jeux, et rien ne la porte sinon.
    passes: joueurs.map(() => false),
    courant: forme === 'parTour' ? 0 : null,
    duel: null,
    seuil,
    // Instantané de l'état d'avant, pour défaire le dernier geste. Un seul
    // niveau, jamais plus : c'est la règle d'EcranTour, et un geste ici peut
    // toucher cinq joueurs à la fois — un delta par joueur serait plus fragile
    // que la photo de ce qu'on vient de quitter.
    dernier: null,
    phase: 'partie'
  };
}

/** Les index des joueurs encore en course. */
export const enJeu = (etat) =>
  etat.joueurs.flatMap((_, i) => (etat.sortis[i] ? [] : [i]));

const instantane = (etat) => ({
  scores: etat.scores,
  sortis: etat.sortis,
  passes: etat.passes,
  courant: etat.courant,
  duel: etat.duel,
  phase: etat.phase
});

/** Le joueur suivant encore en course, en tournant. Nul si plus personne. */
function suivant(etat, depuis) {
  const total = etat.joueurs.length;
  for (let pas = 1; pas <= total; pas += 1) {
    const candidat = (depuis + pas) % total;
    if (!etat.sortis[candidat]) return candidat;
  }
  return depuis;
}

/**
 * Applique les gains, puis relit le seuil.
 *
 * Le seuil se relit **après** coup, sur le score obtenu : un jeu à
 * élimination compte des avertissements, et c'est le total qui fait sortir, pas
 * le geste. Quand il ne reste qu'un joueur, la partie s'arrête d'elle-même —
 * il n'y a plus personne à éliminer.
 */
function appliquer(etat, gains) {
  const scores = etat.scores.map((valeur, i) => {
    const gain = gains.reduce((somme, g) => (g.joueur === i ? somme + g.points : somme), 0);
    return Math.max(0, valeur + gain);
  });
  const sortis = etat.sortis.map(
    (sorti, i) => sorti || (etat.seuil !== null && scores[i] >= etat.seuil)
  );
  const restants = sortis.filter((sorti) => !sorti).length;
  return {
    scores,
    sortis,
    // Un seul survivant : c'est fini. Sans seuil, la fin se décide à la table.
    phase: etat.seuil !== null && restants <= 1 ? 'fin' : etat.phase
  };
}

/**
 * @param etat   état courant
 * @param action `marquer` | `annuler` | `ajuster` | `reinitialiser` |
 *               `tirerDuel` | `clore` | `rejouer`
 */
export function reducteur(etat, action) {
  switch (action.type) {
    /**
     * Le geste central : des gains à distribuer.
     *
     * `passes` marque ceux qui viennent de jouer leur tour, `avancer` fait
     * tourner le joueur courant. Les trois voyagent ensemble parce qu'ils ne
     * font qu'un geste aux yeux de la table, et qu'« Annuler » doit tout
     * défaire d'un coup.
     */
    case 'marquer': {
      if (etat.phase !== 'partie') return etat;
      const gains = action.gains ?? [];
      const { scores, sortis, phase } = appliquer(etat, gains);
      const passes = etat.passes.map(
        (passe, i) => passe || (action.passes ?? []).includes(i)
      );
      const apres = { ...etat, scores, sortis, passes, phase, dernier: instantane(etat) };
      return {
        ...apres,
        duel: null,
        courant: action.avancer ? suivant(apres, etat.courant ?? 0) : etat.courant
      };
    }

    /**
     * Défait le dernier geste, et lui seul.
     *
     * Les lignes se touchent au doigt, à cinq ou vingt, et elles se
     * ressemblent : viser la mauvaise vole un point à quelqu'un et en donne un
     * à un autre. Sans retour en arrière, la partie continue faussée — c'est le
     * même raisonnement que l'annulation d'un « Trouvé » de travers.
     */
    case 'annuler':
      return etat.dernier ? { ...etat, ...etat.dernier, dernier: null } : etat;

    // Rattrapage à la main, sur le total du joueur. Jamais sous zéro, et sans
    // toucher au dernier geste : corriger n'est pas annuler.
    case 'ajuster': {
      const { scores, sortis, phase } = appliquer(etat, [
        { joueur: action.joueur, points: action.delta }
      ]);
      return { ...etat, scores, sortis, phase };
    }

    case 'reinitialiser':
      return {
        ...etat,
        scores: etat.scores.map((valeur, i) => (i === action.joueur ? 0 : valeur)),
        // Remettre à zéro fait rentrer un joueur sorti : c'est tout l'intérêt
        // quand on l'a éliminé par erreur.
        sortis: etat.sortis.map((sorti, i) => (i === action.joueur ? false : sorti))
      };

    /** Le tirage des duellistes. Deux joueurs encore en course, au hasard. */
    case 'tirerDuel': {
      const melanger = action.melanger ?? melangeAleatoire;
      const disponibles = enJeu(etat);
      if (disponibles.length < 2) return etat;
      return { ...etat, duel: melanger(disponibles).slice(0, 2), dernier: null };
    }

    // Sans seuil, aucune règle ne dit quand on s'arrête : c'est la table qui
    // tranche, une fois que tout le monde est passé — ou avant.
    case 'clore':
      return etat.phase === 'partie' ? { ...etat, phase: 'fin', dernier: null } : etat;

    case 'rejouer':
      return etatInitial({
        joueurs: etat.joueurs,
        seuil: etat.seuil,
        forme: etat.courant === null ? 'auFil' : 'parTour'
      });

    default:
      return etat;
  }
}

/**
 * Remet une partie restaurée dans un état jouable.
 *
 * Rien à rembobiner ici — pas de chrono en cours, pas de carte tirée : on
 * oublie seulement le geste en attente d'annulation. Reprendre une soirée une
 * heure plus tard et pouvoir défaire un point d'alors n'aurait aucun sens.
 */
export const reprendre = (etat) => ({ ...etat, dernier: null });

export const tousPasses = (etat) => enJeu(etat).every((i) => etat.passes[i]);

/**
 * Qui mène, ou qui a gagné. Plusieurs en cas d'égalité.
 *
 * Le sens dépend du seuil, et c'est la seule chose que « gagner » veut dire de
 * différent d'un jeu à l'autre : le plus gros total quand on marque des points,
 * le dernier debout — et le moins puni — quand on encaisse des avertissements.
 */
export function vainqueurs(etat) {
  const candidats = etat.seuil !== null ? enJeu(etat) : etat.joueurs.map((_, i) => i);
  if (candidats.length === 0) return [];
  const scores = candidats.map((i) => etat.scores[i]);
  const cible = etat.seuil !== null ? Math.min(...scores) : Math.max(...scores);
  return candidats.filter((i) => etat.scores[i] === cible);
}
