import { describe, it, expect } from 'vitest';
import {
  avancement,
  baremeDe,
  carteCourante,
  epuise,
  etatInitial,
  reducteur,
  reglesDe,
  reprendre
} from './quizAnimateur';
import { enJeu, vainqueurs } from './feuilleDeMatch';
import { gamesList } from '../data/games';
import { contenuDuJeu } from '../data/lancerJeu';

/** Mélange neutre : les tests portent sur le déroulé, pas sur le hasard. */
const sansMelange = (tableau) => [...tableau];

const CARTES = [
  { type: 'question', contenu: 'une', reponse: 'A' },
  { type: 'question', contenu: 'deux', reponse: 'B' },
  { type: 'question', contenu: 'trois', reponse: 'C' }
];

const partie = (joueurs = ['Ana', 'Bo', 'Cy'], cartes = CARTES) =>
  etatInitial({ cartes, joueurs, melanger: sansMelange });

const jouer = (etat, actions) => actions.reduce((e, a) => reducteur(e, a), etat);

const SLUGS = [
  'sorry-mon-french',
  'lost-in-translation',
  'le-fitch',
  'le-souffleur',
  'soyez-logique',
  'le-juste-chiffre'
];

describe('quiz d’animateur', () => {
  it('démarre sur la première carte, réponse cachée', () => {
    const etat = partie();
    expect(carteCourante(etat).contenu).toBe('une');
    expect(etat.revele).toBe(false);
    expect(etat.scores).toEqual([0, 0, 0]);
  });

  it('révèle, puis se referme sans changer de carte', () => {
    // Refermer sert à relire l'énoncé à voix haute : la carte ne bouge pas.
    let etat = reducteur(partie(), { type: 'reveler' });
    expect(etat.revele).toBe(true);
    etat = reducteur(etat, { type: 'masquer' });
    expect(etat.revele).toBe(false);
    expect(carteCourante(etat).contenu).toBe('une');
  });

  it('compte les points et passe à la suivante d’un seul geste', () => {
    // Du point de vue de la table, la question est finie : les points tombent et
    // on enchaîne. Deux gestes obligeraient à taper deux fois.
    const etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 1, points: 1 }] }
    ]);
    expect(etat.scores).toEqual([0, 1, 0]);
    expect(carteCourante(etat).contenu).toBe('deux');
    expect(etat.revele).toBe(false);
    expect(etat.manches).toBe(1);
  });

  it('accepte deux points pour un seul joueur', () => {
    // Sorry mon french : le titre vaut un point, le titre et l'artiste deux.
    const etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: 2 }] }
    ]);
    expect(etat.scores).toEqual([2, 0, 0]);
  });

  it('accepte plusieurs marqueurs sur la même carte', () => {
    const etat = jouer(partie(), [
      { type: 'reveler' },
      {
        type: 'marquer',
        gains: [
          { joueur: 0, points: 1 },
          { joueur: 2, points: 1 }
        ]
      }
    ]);
    expect(etat.scores).toEqual([1, 0, 1]);
  });

  it('ne descend jamais un total sous zéro', () => {
    // Le Fitch retire un point par détail exact signalé à tort. Un joueur qui se
    // trompe cinq fois au premier tour reste à zéro : il ne part pas en négatif
    // pour toute la soirée.
    const etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: -3 }] }
    ]);
    expect(etat.scores).toEqual([0, 0, 0]);
  });

  it('retranche bien quand le joueur a des points d’avance', () => {
    const etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: 4 }] },
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: -3 }] }
    ]);
    expect(etat.scores).toEqual([1, 0, 0]);
  });

  it('défait le dernier geste, carte et réponse comprises', () => {
    // C'est le tour entier qu'on reprend : rendre le point sans revenir sur la
    // carte laisserait la question sautée.
    const avant = reducteur(partie(), { type: 'reveler' });
    const apres = reducteur(avant, { type: 'marquer', gains: [{ joueur: 1, points: 1 }] });
    const defait = reducteur(apres, { type: 'annuler' });

    expect(defait.scores).toEqual([0, 0, 0]);
    expect(carteCourante(defait).contenu).toBe('une');
    expect(defait.revele).toBe(true);
    expect(defait.manches).toBe(0);
  });

  it('n’annule qu’un seul cran', () => {
    let etat = partie();
    for (const joueur of [0, 1]) {
      etat = jouer(etat, [
        { type: 'reveler' },
        { type: 'marquer', gains: [{ joueur, points: 1 }] }
      ]);
    }
    etat = reducteur(etat, { type: 'annuler' });
    expect(etat.scores).toEqual([1, 0, 0]);
    // Le second « Annuler » ne fait rien : l'instantané a été consommé.
    expect(reducteur(etat, { type: 'annuler' }).scores).toEqual([1, 0, 0]);
  });

  it('revient en arrière sans décompter la manche', () => {
    // La carte n'a pas été jouée : la faire compter fausserait « cinq questions
    // au total ».
    let etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: 1 }] }
    ]);
    etat = reducteur(etat, { type: 'precedente' });
    expect(carteCourante(etat).contenu).toBe('une');
    expect(etat.manches).toBe(1);
    expect(etat.revele).toBe(false);
  });

  it('ne recule pas au-delà de la première carte', () => {
    const etat = reducteur(partie(), { type: 'precedente' });
    expect(etat.index).toBe(0);
  });

  it('s’épuise un cran après la dernière carte', () => {
    let etat = partie();
    for (let i = 0; i < CARTES.length; i += 1) {
      etat = jouer(etat, [{ type: 'reveler' }, { type: 'marquer', gains: [] }]);
    }
    expect(epuise(etat)).toBe(true);
    expect(carteCourante(etat)).toBeNull();
  });

  it('remélange sans toucher aux scores', () => {
    // C'est le contenu qui repasse, pas la partie qui recommence.
    let etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 2, points: 1 }] }
    ]);
    etat = reducteur(etat, { type: 'remelanger', melanger: sansMelange });
    expect(etat.scores).toEqual([0, 0, 1]);
    expect(etat.index).toBe(0);
    expect(etat.dernier).toBeNull();
  });

  it('corrige un total à la main, sans toucher au dernier geste', () => {
    const avant = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: 1 }] }
    ]);
    const apres = reducteur(avant, { type: 'ajuster', joueur: 0, delta: 2 });
    expect(apres.scores).toEqual([3, 0, 0]);
    // Corriger n'est pas annuler : le geste reste défaisable.
    expect(apres.dernier).not.toBeNull();
    expect(reducteur(apres, { type: 'reinitialiser', joueur: 0 }).scores).toEqual([0, 0, 0]);
  });

  it('rejoue à zéro en gardant la table', () => {
    const etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: 1 }] },
      { type: 'rejouer', melanger: sansMelange }
    ]);
    expect(etat.scores).toEqual([0, 0, 0]);
    expect(etat.joueurs).toEqual(['Ana', 'Bo', 'Cy']);
    expect(etat.manches).toBe(0);
  });

  it('n’accepte plus de points une fois la partie close', () => {
    const clos = reducteur(partie(), { type: 'clore' });
    expect(clos.phase).toBe('fin');
    expect(reducteur(clos, { type: 'marquer', gains: [{ joueur: 0, points: 1 }] })).toBe(clos);
  });

  it('reprend une partie sur l’énoncé, pas sur la réponse', () => {
    // Reprendre une heure plus tard sur la correction affichée donnerait la
    // réponse avant la question.
    const dormante = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 0, points: 1 }] },
      { type: 'reveler' }
    ]);
    const reprise = reprendre(dormante);
    expect(reprise.revele).toBe(false);
    expect(reprise.dernier).toBeNull();
    expect(reprise.scores).toEqual([1, 0, 0]);
  });
});

describe('le classement se lit avec les briques de la feuille de match', () => {
  it('désigne le meneur, et l’égalité', () => {
    // L'état porte `sortis` et `seuil` pour que ces deux fonctions servent telles
    // quelles : deux familles qui comptent pareil n'ont pas à diverger.
    const etat = jouer(partie(), [
      { type: 'reveler' },
      { type: 'marquer', gains: [{ joueur: 1, points: 2 }] }
    ]);
    expect(vainqueurs(etat)).toEqual([1]);
    expect(enJeu(etat)).toEqual([0, 1, 2]);
    expect(vainqueurs(partie())).toEqual([0, 1, 2]);
  });
});

describe('l’avancement d’une partie', () => {
  it('ne compte rien pour un jeu qui n’annonce pas de longueur', () => {
    expect(avancement(partie(), undefined)).toBeNull();
  });

  it('suit les cinq questions du juste chiffre', () => {
    let etat = partie();
    expect(avancement(etat, 5)).toEqual({ rang: 1, total: 5, complet: false });
    for (let i = 0; i < 5; i += 1) {
      etat = jouer(etat, [{ type: 'reveler' }, { type: 'marquer', gains: [] }]);
    }
    expect(avancement(etat, 5)).toEqual({ rang: 5, total: 5, complet: true });
  });
});

describe('les règles écrites jeu par jeu', () => {
  it.each(SLUGS)('« %s » est bien au catalogue, avec son contenu', (slug) => {
    // Une règle écrite pour un slug inexistant ne s'afficherait jamais, et rien
    // ne le signalerait. Même garde que les rappels du défileur.
    const game = gamesList.find((g) => g.slug === slug);
    expect(game, slug).toBeTruthy();
    expect(game.kit).toContain('prompts');
    expect(game.scoring).toBe('compteur');
    expect(contenuDuJeu(slug).length, slug).toBeGreaterThan(0);
  });

  it.each(SLUGS)('« %s » annonce un rappel et une question', (slug) => {
    const regles = reglesDe(slug);
    expect(regles.rappel, slug).toBeTruthy();
    // Un rappel, pas les règles : celles-ci sont sur la fiche, et les répéter
    // ici rétablirait le péage qu'on cherche à éviter.
    expect(regles.rappel.length, slug).toBeLessThan(200);
    expect(regles.question, slug).toBeTruthy();
  });

  it.each(SLUGS)('chaque ligne de « %s » porte une réponse à révéler', (slug) => {
    // Toute la famille tient sur la révélation : une ligne sans `reponse`
    // afficherait un écran vide au moment où la table attend la correction.
    for (const ligne of contenuDuJeu(slug)) {
      expect(ligne.reponse, `${slug} : ${ligne.contenu.slice(0, 40)}`).toBeTruthy();
    }
  });

  it('donne un barème complet, même quand le jeu n’en déclare rien', () => {
    expect(baremeDe(reglesDe('le-souffleur'))).toMatchObject({ min: 0, max: 1, saisie: false });
    expect(baremeDe(reglesDe('sorry-mon-french')).max).toBe(2);
    // Le Fitch saisit un solde, il ne désigne pas : cinq erreurs moins les
    // fausses alertes.
    expect(baremeDe(reglesDe('le-fitch'))).toMatchObject({ min: -5, max: 5, saisie: true });
    expect(baremeDe(null)).toMatchObject({ min: 0, max: 1 });
  });

  it('ne réserve la bascule qu’au jeu dont les deux textes sont longs', () => {
    expect(reglesDe('le-fitch').comparer).toBeTruthy();
    for (const slug of SLUGS.filter((s) => s !== 'le-fitch')) {
      expect(reglesDe(slug).comparer, slug).toBeUndefined();
    }
  });

  it('n’annonce un thème que là où les règles le demandent', () => {
    // Lost in translation fait annoncer « film » ou « série » avant le titre, et
    // le thème se lit dans le `type` de la ligne.
    const themes = reglesDe('lost-in-translation').theme;
    for (const ligne of contenuDuJeu('lost-in-translation')) {
      expect(themes[ligne.type], ligne.type).toBeTruthy();
    }
  });

  it('ne déclare une longueur de partie que pour le juste chiffre', () => {
    expect(reglesDe('le-juste-chiffre').manches).toBe(5);
    for (const slug of SLUGS.filter((s) => s !== 'le-juste-chiffre')) {
      expect(reglesDe(slug).manches, slug).toBeUndefined();
    }
  });

  it('rend null pour un jeu d’une autre famille', () => {
    expect(reglesDe('trois-fois-rien')).toBeNull();
  });
});
