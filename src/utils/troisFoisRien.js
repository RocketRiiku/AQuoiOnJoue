/**
 * Moteur de « Trois fois rien » — le déroulé, sans une ligne de rendu.
 *
 * Le kit de ce jeu n'est pas un simple tirage : les mêmes mots reviennent aux
 * trois manches, le chrono coupe un tour au milieu, et le pot qui se vide met
 * fin à la manche même s'il reste du temps. Cette mécanique tient dans un
 * réducteur pur, testable sans navigateur — l'écran ne fait que l'afficher.
 */

/** Papiers pliés par joueur, réglable depuis les paramètres avancés. */
export const MOTS_PAR_JOUEUR = 5;

/** Les trois manches, dans l'ordre. Le mot à deviner ne change pas, la consigne si. */
export const MANCHES = [
  {
    titre: 'On parle',
    consigne: 'Faites deviner en parlant librement, sans jamais prononcer le mot.'
  },
  {
    titre: 'Un seul mot',
    consigne: 'Un seul mot d’indice par carte, et rien d’autre.'
  },
  {
    titre: 'Mime',
    consigne: 'Plus un son : uniquement le mime.'
  }
];

/** Mélange sans modifier le tableau reçu (Fisher-Yates). */
export function melangeAleatoire(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Le pot d'une partie : cinq mots par joueur, tirés une fois pour toutes.
 *
 * Plafonné à ce que le catalogue contient — à seize joueurs, cinq mots chacun
 * dépasseraient les 120 disponibles, et mieux vaut un pot un peu court qu'un
 * `undefined` au milieu d'une manche.
 */
export function composerPot(
  mots,
  joueurs,
  { melanger = melangeAleatoire, motsParJoueur = MOTS_PAR_JOUEUR } = {}
) {
  const voulus = Math.min(joueurs * motsParJoueur, mots.length);
  return melanger(mots).slice(0, voulus);
}

export function nomsEquipes(nombre) {
  return Array.from({ length: nombre }, (_, i) => `Équipe ${i + 1}`);
}

export function etatInitial({ pot, equipes, melanger = melangeAleatoire }) {
  return {
    equipes,
    // Une case par équipe et par manche : c'est ce que « scoring: manches »
    // décrit, et le total n'est qu'une somme de la grille.
    scores: equipes.map(() => MANCHES.map(() => 0)),
    manche: 0,
    equipeActive: 0,
    pot,
    restants: melanger(pot),
    // Dernier geste du tour, pour pouvoir le défaire. Remis à zéro dès qu'on
    // change de phase : on n'annule pas un mot d'un tour déjà clos.
    dernier: null,
    phase: 'pret'
  };
}

const suivante = (etat) => (etat.equipeActive + 1) % etat.equipes.length;

const ajouterPoint = (scores, equipe, manche, delta = 1) =>
  scores.map((ligne, i) =>
    i === equipe ? ligne.map((v, m) => (m === manche ? Math.max(0, v + delta) : v)) : ligne
  );

/**
 * @param etat   état courant
 * @param action `commencer` | `trouve` | `passe` | `tempsEcoule` |
 *               `tourSuivant` | `mancheSuivante` | `rejouer`
 */
export function reducteur(etat, action) {
  switch (action.type) {
    case 'commencer':
      return etat.phase === 'pret' ? { ...etat, phase: 'tour', dernier: null } : etat;

    case 'trouve': {
      if (etat.phase !== 'tour') return etat;
      const restants = etat.restants.slice(1);
      return {
        ...etat,
        scores: ajouterPoint(etat.scores, etat.equipeActive, etat.manche),
        restants,
        dernier: { action: 'trouve', mot: etat.restants[0] },
        // Le pot vidé met fin à la manche séance tenante, chrono compris : il
        // n'y a plus rien à faire deviner.
        phase: restants.length === 0 ? 'bilanManche' : 'tour'
      };
    }

    case 'passe':
      // Le mot repart au fond du pot : il reviendra dans le même tour si le
      // temps le permet, sinon plus tard. Rien à faire s'il est seul.
      return etat.phase === 'tour' && etat.restants.length > 1
        ? {
            ...etat,
            restants: [...etat.restants.slice(1), etat.restants[0]],
            dernier: { action: 'passe', mot: etat.restants[0] }
          }
        : etat;

    /**
     * Défait le dernier geste du tour.
     *
     * Les deux surfaces de réponse occupent toute la largeur et on tape vite :
     * un « Trouvé » de travers vole un point *et* retire un mot du pot. Sans
     * retour en arrière, la partie continue faussée.
     */
    case 'annuler': {
      if (etat.phase !== 'tour' || !etat.dernier) return etat;
      if (etat.dernier.action === 'trouve') {
        return {
          ...etat,
          scores: ajouterPoint(etat.scores, etat.equipeActive, etat.manche, -1),
          restants: [etat.dernier.mot, ...etat.restants],
          dernier: null
        };
      }
      // « Passer » avait envoyé le mot au fond : on le remonte en tête.
      return {
        ...etat,
        restants: [
          etat.restants[etat.restants.length - 1],
          ...etat.restants.slice(0, -1)
        ],
        dernier: null
      };
    }

    case 'tempsEcoule':
      return etat.phase === 'tour' ? { ...etat, phase: 'bilanTour', dernier: null } : etat;

    case 'tourSuivant':
      return etat.phase === 'bilanTour'
        ? { ...etat, equipeActive: suivante(etat), phase: 'pret', dernier: null }
        : etat;

    case 'mancheSuivante': {
      if (etat.phase !== 'bilanManche') return etat;
      if (etat.manche === MANCHES.length - 1) return { ...etat, phase: 'fin' };
      const melanger = action.melanger ?? melangeAleatoire;
      return {
        ...etat,
        manche: etat.manche + 1,
        // Les mêmes mots, remélangés : c'est tout le principe du jeu.
        restants: melanger(etat.pot),
        equipeActive: suivante(etat),
        dernier: null,
        phase: 'pret'
      };
    }

    // Rattrapage d'erreur : un pouce qui glisse sur « Trouvé » ne doit pas
    // gâcher la manche. On corrige la case de la manche en cours, jamais en
    // dessous de zéro.
    case 'ajusterScore':
      return {
        ...etat,
        scores: etat.scores.map((ligne, i) =>
          i === action.equipe
            ? ligne.map((v, m) => (m === etat.manche ? Math.max(0, v + action.delta) : v))
            : ligne
        )
      };

    case 'reinitialiserEquipe':
      return {
        ...etat,
        scores: etat.scores.map((ligne, i) =>
          i === action.equipe ? ligne.map(() => 0) : ligne
        )
      };

    case 'rejouer':
      return etatInitial({
        pot: action.pot ?? etat.pot,
        equipes: etat.equipes,
        melanger: action.melanger
      });

    default:
      return etat;
  }
}

/**
 * Remet une partie restaurée dans un état jouable.
 *
 * Un tour interrompu ne reprend jamais en plein chrono : on revient à l'écran
 * d'annonce de l'équipe, pot et scores intacts. Reprendre à dix-sept secondes
 * d'un tour qu'on a quitté il y a une heure n'aurait aucun sens, et le geste
 * d'annulation en attente encore moins.
 */
export function reprendre(etat) {
  return {
    ...etat,
    phase: etat.phase === 'tour' ? 'pret' : etat.phase,
    dernier: null
  };
}

export const motCourant = (etat) => etat.restants[0] ?? null;

/** Ce que l'équipe qui joue a trouvé dans la manche en cours. */
export const scoreDuTour = (etat) => etat.scores[etat.equipeActive][etat.manche];

export const totalEquipe = (etat, equipe) =>
  etat.scores[equipe].reduce((somme, points) => somme + points, 0);

/** Index des équipes en tête. Plusieurs en cas d'égalité. */
export function vainqueurs(etat) {
  const totaux = etat.equipes.map((_, i) => totalEquipe(etat, i));
  const meilleur = Math.max(...totaux);
  return totaux.flatMap((total, i) => (total === meilleur ? [i] : []));
}
