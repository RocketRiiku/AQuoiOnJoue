/**
 * Le déroulé des quiz d'animateur, sans une ligne de rendu.
 *
 * Six jeux où quelqu'un pose et corrige : Sorry mon french, Lost in
 * translation, Le Fitch, Le souffleur, Soyez logique, Le juste chiffre. Un tour
 * y tient en trois gestes — on tire, on révèle, on désigne qui marque — et
 * c'est la seule famille qui ait besoin des trois.
 *
 * **C'est la composition des deux familles déjà écrites, plus la révélation.**
 * La pile vient du défileur : mélangée une fois, parcourue sans remise, un cran
 * au-delà de la dernière carte pour l'état « épuisée ». Le score vient de la
 * feuille de match : des gains à distribuer, un instantané pour défaire le
 * dernier geste, une correction à la main. Rien de tout cela n'est recopié —
 * l'état porte les champs que `enJeu` et `vainqueurs` attendent, et les deux
 * fonctions servent telles quelles.
 *
 * La nouveauté tient en un booléen. `revele` sépare le moment où la table
 * cherche de celui où elle sait, et c'est lui qui décide de tout l'écran : avant,
 * on lit la carte ; après, on distribue les points. Sans cette coupure, la
 * réponse s'afficherait en même temps que la question, ce qui est exactement le
 * défaut d'origine du Fitch.
 */

import { melangeAleatoire } from './pioche';

/**
 * Ce que les colonnes ne disent pas, écrit jeu par jeu.
 *
 * Même statut que `RAPPELS` dans `defileur.js` et que `JEUX` dans
 * `feuilleDeMatch.js`. Le reste vient du catalogue : le `type` de la ligne donne
 * le mot du bouton de tirage, `chronoTour` décide du décompte, `minPlayers` et
 * `maxPlayers` bornent l'effectif, `scoring` donne le mot du point.
 *
 * `bareme` mérite un mot. Les six jeux portent `compteur` au tableur, et la
 * colonne dit « +1 / −1 par joueur » — vrai pour quatre d'entre eux, faux pour
 * deux. Sorry mon french donne deux points à qui trouve le titre *et*
 * l'artiste ; Le Fitch compte cinq erreurs, dont il retire les fausses alertes.
 * Le barème vit donc ici, comme celui du Liars Club vit dans `feuilleDeMatch`.
 */
const JEUX = {
  'sorry-mon-french': {
    rappel:
      'Lisez les paroles à voix haute, sans chanter, et sans corriger la traduction. Le titre vaut un point, le titre et l’artiste en valent deux.',
    // Les vers portent de vrais sauts de ligne dans les données, et la carte les
    // rend tels quels : rien à déclarer ici.
    taille: 'phrase',
    question: 'Qui a trouvé ?',
    bareme: { max: 2, aide: 'Une tape pour le titre, deux pour le titre et l’artiste.' }
  },

  'lost-in-translation': {
    rappel:
      'Annoncez d’abord le thème — film ou série — puis le titre québécois. Le premier qui donne le titre français marque.',
    // Un titre, deux ou trois mots : la même taille qu'un mot à faire deviner.
    taille: 'mot',
    // Le thème se lit dans le `type` de la ligne, et les règles le font annoncer
    // avant le titre. Rien à écrire ici, rien à deviner à l'écran.
    theme: { 'titre québécois': 'Film', 'série québécoise': 'Série' },
    question: 'Qui a trouvé le titre français ?',
    bareme: { max: 1 }
  },

  'le-fitch': {
    rappel:
      'Lisez le résumé en entier, une seule fois. Cinq détails sont faux. Chacun note ce qu’il croit repérer, et on compare après.',
    taille: 'passage',
    /**
     * Le seul jeu de la famille où les deux textes se valent en longueur : cinq
     * cents signes de résumé, deux cents de correction. Empilés, ils passent
     * sous la ligne de flottaison ; l'écran bascule donc de l'un à l'autre, ce
     * qui est de toute façon le geste du jeu — on relit le résumé en tenant la
     * correction à côté.
     */
    comparer: { avant: 'Le résumé', apres: 'Les cinq erreurs' },
    question: 'Combien chacun en a-t-il trouvé ?',
    /**
     * Cinq erreurs à trouver, un point retiré par détail exact signalé à tort :
     * le solde d'un joueur va donc de −5 à +5. C'est une saisie de nombre et non
     * une désignation, d'où le compteur par joueur plutôt que la ligne à taper.
     */
    bareme: { min: -5, max: 5, saisie: true, aide: 'Erreurs trouvées, moins les fausses alertes.' }
  },

  'le-souffleur': {
    rappel:
      'Lisez la réplique, ou faites-la écouter si vous l’avez sous la main. Une mauvaise réponse fait passer son tour.',
    taille: 'phrase',
    question: 'Qui a trouvé l’œuvre ?',
    bareme: { max: 1 }
  },

  'soyez-logique': {
    rappel:
      'Une minute par énigme, et personne n’annonce avant la fin du chrono. La solution s’explique, elle ne se devine pas à moitié.',
    taille: 'phrase',
    question: 'Qui a résolu l’énigme ?',
    bareme: { max: 1 }
  },

  'le-juste-chiffre': {
    rappel:
      'Tout le monde écrit son estimation, puis on annonce en même temps. Le plus proche marque, mais toute réponse au-dessus de la vraie valeur saute.',
    taille: 'phrase',
    // Les règles annoncent cinq questions par partie : c'est cette échelle-là
    // que la table suit, pas les cent vingt cartes de la pile.
    manches: 5,
    question: 'Qui était le plus proche sans dépasser ?',
    bareme: { max: 1 }
  }
};

export const reglesDe = (slug) => JEUX[slug] ?? null;

/** Le barème complet d'un jeu, ses valeurs par défaut comprises. */
export const baremeDe = (regles) => ({
  min: 0,
  max: 1,
  saisie: false,
  aide: null,
  ...(regles?.bareme ?? {})
});

export function etatInitial({ cartes, joueurs, melanger = melangeAleatoire }) {
  return {
    pile: melanger(cartes),
    index: 0,
    revele: false,
    joueurs,
    scores: joueurs.map(() => 0),
    // Combien de cartes ont été comptées. C'est ce que « cinq questions au
    // total » compte, et non l'index dans la pile : une carte reprise en arrière
    // ne rejoue pas la manche.
    manches: 0,
    /**
     * Deux champs que ce kit n'utilise pas, et qui sont là quand même : `enJeu`
     * et `vainqueurs` de `feuilleDeMatch.js` les lisent, et les réécrire ici
     * pour deux familles qui comptent de la même façon aurait été le début de la
     * divergence. Personne ne sort d'un quiz, et aucun de ces six jeux n'a de
     * seuil.
     */
    sortis: joueurs.map(() => false),
    seuil: null,
    // Un seul cran d'annulation, jamais plus : la règle d'`EcranTour`, et un
    // geste peut ici toucher toute la table d'un coup.
    dernier: null,
    phase: 'partie'
  };
}

const instantane = (etat) => ({
  scores: etat.scores,
  manches: etat.manches,
  index: etat.index,
  revele: etat.revele,
  phase: etat.phase
});

/**
 * @param etat   état courant
 * @param action `reveler` | `masquer` | `marquer` | `precedente` | `annuler` |
 *               `ajuster` | `reinitialiser` | `remelanger` | `clore` | `rejouer`
 */
export function reducteur(etat, action) {
  switch (action.type) {
    /** La coupure du tour : la table cherchait, elle sait. */
    case 'reveler':
      return etat.revele ? etat : { ...etat, revele: true };

    // Refermer la réponse, pour relire l'énoncé à voix haute. Le Fitch en vit,
    // mais rien ne justifiait de le lui réserver.
    case 'masquer':
      return etat.revele ? { ...etat, revele: false } : etat;

    /**
     * On distribue, et on passe à la carte suivante d'un seul geste.
     *
     * Les deux ne se séparent pas du point de vue de la table : la question est
     * finie, les points sont mis, on enchaîne. Les scinder obligerait à taper
     * deux fois, et « Annuler » ne saurait plus quoi défaire — d'où
     * l'instantané, qui remonte aussi l'index et la révélation.
     */
    case 'marquer': {
      if (etat.phase !== 'partie') return etat;
      const gains = action.gains ?? [];
      const scores = etat.scores.map((valeur, i) => {
        const gain = gains.reduce((somme, g) => (g.joueur === i ? somme + g.points : somme), 0);
        // Jamais sous zéro : un joueur du Fitch qui signale cinq détails exacts
        // au premier tour reste à zéro, il ne part pas en négatif pour la soirée.
        return Math.max(0, valeur + gain);
      });
      return {
        ...etat,
        scores,
        manches: etat.manches + 1,
        index: etat.index + 1,
        revele: false,
        dernier: instantane(etat)
      };
    }

    // Revenir sur la carte d'avant, réponse cachée. Une carte tournée par erreur
    // emporte sinon une question que personne n'a entendue — même raison que le
    // défileur, à ceci près qu'ici la manche ne se décompte pas : elle n'a pas
    // été jouée.
    case 'precedente':
      return etat.index > 0 ? { ...etat, index: etat.index - 1, revele: false } : etat;

    /**
     * Défait le dernier geste, et lui seul.
     *
     * On tape vite, les lignes se ressemblent, et un point donné au voisin fausse
     * le classement jusqu'au bout de la soirée. L'annulation remet aussi la carte
     * et sa réponse : c'est le tour entier qu'on reprend, pas seulement le score.
     */
    case 'annuler':
      return etat.dernier ? { ...etat, ...etat.dernier, dernier: null } : etat;

    // Rattrapage à la main, sur le total. Sans toucher au dernier geste :
    // corriger n'est pas annuler.
    case 'ajuster':
      return {
        ...etat,
        scores: etat.scores.map((valeur, i) =>
          i === action.joueur ? Math.max(0, valeur + action.delta) : valeur
        )
      };

    case 'reinitialiser':
      return {
        ...etat,
        scores: etat.scores.map((valeur, i) => (i === action.joueur ? 0 : valeur))
      };

    // La pile épuisée se remélange sans toucher aux scores : c'est le contenu
    // qui repasse, pas la partie qui recommence.
    case 'remelanger':
      return {
        ...etat,
        pile: (action.melanger ?? melangeAleatoire)(etat.pile),
        index: 0,
        revele: false,
        dernier: null
      };

    // Aucun de ces six jeux ne dit quand s'arrêter, sauf Le juste chiffre et ses
    // cinq questions. Ailleurs, c'est la table qui tranche.
    case 'clore':
      return etat.phase === 'partie' ? { ...etat, phase: 'fin', dernier: null } : etat;

    case 'rejouer':
      return etatInitial({
        cartes: etat.pile,
        joueurs: etat.joueurs,
        melanger: action.melanger
      });

    default:
      return etat;
  }
}

/**
 * Remet une partie restaurée dans un état jouable.
 *
 * La réponse repart cachée et le geste en attente d'annulation est oublié.
 * Reprendre une soirée une heure plus tard sur une correction déjà affichée
 * ferait relire la réponse avant la question ; pouvoir défaire un point d'alors
 * n'aurait pas plus de sens. Même règle que `reprendre` des deux autres kits.
 */
export const reprendre = (etat) => ({ ...etat, revele: false, dernier: null });

export const carteCourante = (etat) => etat.pile[etat.index] ?? null;

export const epuise = (etat) => etat.index >= etat.pile.length;

/**
 * La partie a-t-elle atteint la longueur que ses règles annoncent ?
 *
 * Seul Le juste chiffre en déclare une. Ailleurs, `null` : rien ne se compte, et
 * « Terminer » dort dans le menu jusqu'à ce qu'on le demande.
 */
export function avancement(etat, manches) {
  if (!manches) return null;
  return {
    rang: Math.min(etat.manches + 1, manches),
    total: manches,
    complet: etat.manches >= manches
  };
}
