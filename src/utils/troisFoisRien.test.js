import { describe, it, expect } from 'vitest';
import {
  composerPot,
  etatInitial,
  MANCHES,
  MOTS_PAR_JOUEUR,
  motCourant,
  nomsEquipes,
  reducteur,
  totalEquipe,
  vainqueurs
} from './troisFoisRien';
import { melangeAleatoire } from './pioche';

/** Mélange neutre : les tests portent sur le déroulé, pas sur le hasard. */
const sansMelange = (tableau) => [...tableau];

const MOTS = ['un', 'deux', 'trois', 'quatre'];

const partie = (mots = MOTS, equipes = 2) =>
  etatInitial({ pot: mots, equipes: nomsEquipes(equipes), melanger: sansMelange });

const jouer = (etat, ...actions) =>
  actions.reduce((e, a) => reducteur(e, typeof a === 'string' ? { type: a } : a), etat);

describe('composerPot', () => {
  it('prélève cinq mots par joueur', () => {
    const mots = Array.from({ length: 120 }, (_, i) => `mot ${i}`);
    expect(composerPot(mots, 8, { melanger: sansMelange })).toHaveLength(8 * MOTS_PAR_JOUEUR);
  });

  it('ne réclame jamais plus que le catalogue ne contient', () => {
    // Seize joueurs demanderaient 80 mots ; à trente disponibles, on prend tout
    // plutôt que de laisser des trous au milieu d'une manche.
    const mots = Array.from({ length: 30 }, (_, i) => `mot ${i}`);
    expect(composerPot(mots, 16, { melanger: sansMelange })).toHaveLength(30);
  });

  it('ne modifie pas la liste reçue', () => {
    const mots = [...MOTS];
    melangeAleatoire(mots);
    composerPot(mots, 2);
    expect(mots).toEqual(MOTS);
  });
});

describe('déroulé d’un tour', () => {
  it('commence sur la première équipe, premier mot', () => {
    const etat = partie();
    expect(etat.phase).toBe('pret');
    expect(etat.equipeActive).toBe(0);
    expect(motCourant(etat)).toBe('un');
  });

  it('compte un point et passe au mot suivant', () => {
    const etat = jouer(partie(), 'commencer', 'trouve');
    expect(etat.scores[0][0]).toBe(1);
    expect(motCourant(etat)).toBe('deux');
  });

  it('renvoie un mot passé au fond du pot', () => {
    const etat = jouer(partie(), 'commencer', 'passe');
    expect(motCourant(etat)).toBe('deux');
    expect(etat.restants).toEqual(['deux', 'trois', 'quatre', 'un']);
    expect(etat.scores[0][0]).toBe(0);
  });

  it('ne fait rien en passant le dernier mot', () => {
    // Sans garde, le tableau tournerait sur lui-même sans que rien ne bouge —
    // autant le dire explicitement.
    const etat = jouer(partie(['seul']), 'commencer', 'passe');
    expect(motCourant(etat)).toBe('seul');
  });

  it('rend la main à l’équipe suivante quand le temps tombe', () => {
    const etat = jouer(partie(), 'commencer', 'trouve', 'tempsEcoule');
    expect(etat.phase).toBe('bilanTour');

    const suivant = jouer(etat, 'tourSuivant');
    expect(suivant.equipeActive).toBe(1);
    expect(suivant.phase).toBe('pret');
    // Le pot ne se recharge pas entre deux tours : la manche continue.
    expect(motCourant(suivant)).toBe('deux');
  });

  it('ignore les actions de jeu hors du tour', () => {
    const attente = partie();
    expect(jouer(attente, 'trouve')).toBe(attente);
    expect(jouer(attente, 'passe')).toBe(attente);
    expect(jouer(attente, 'tempsEcoule')).toBe(attente);
  });
});

describe('passage d’une manche à l’autre', () => {
  const viderLePot = (etat) =>
    jouer(etat, 'commencer', 'trouve', 'trouve', 'trouve', 'trouve');

  it('termine la manche dès que le pot est vide, chrono en cours', () => {
    const etat = viderLePot(partie());
    expect(etat.phase).toBe('bilanManche');
    expect(etat.scores[0][0]).toBe(4);
  });

  it('rejoue les mêmes mots à la manche suivante', () => {
    const etat = jouer(viderLePot(partie()), { type: 'mancheSuivante', melanger: sansMelange });
    expect(etat.manche).toBe(1);
    expect(etat.restants).toEqual(MOTS);
    // L'équipe qui n'a pas fini la manche ouvre la suivante.
    expect(etat.equipeActive).toBe(1);
    expect(etat.phase).toBe('pret');
  });

  it('garde les scores manche par manche', () => {
    let etat = viderLePot(partie());
    etat = jouer(etat, { type: 'mancheSuivante', melanger: sansMelange });
    etat = viderLePot(etat);
    expect(etat.scores[0]).toEqual([4, 0, 0]);
    expect(etat.scores[1]).toEqual([0, 4, 0]);
    expect(totalEquipe(etat, 0)).toBe(4);
  });

  it('termine la partie après la dernière manche', () => {
    let etat = partie();
    for (let m = 0; m < MANCHES.length; m += 1) {
      etat = viderLePot(etat);
      etat = jouer(etat, { type: 'mancheSuivante', melanger: sansMelange });
    }
    expect(etat.phase).toBe('fin');
    expect(etat.manche).toBe(MANCHES.length - 1);
  });
});

describe('vainqueurs', () => {
  it('désigne l’équipe en tête', () => {
    const etat = jouer(partie(), 'commencer', 'trouve');
    expect(vainqueurs(etat)).toEqual([0]);
  });

  it('rend les deux équipes à égalité', () => {
    expect(vainqueurs(partie())).toEqual([0, 1]);
  });
});

describe('annuler le dernier geste', () => {
  it('rend le mot et reprend le point', () => {
    const etat = jouer(partie(), 'commencer', 'trouve', 'annuler');
    expect(etat.scores[0][0]).toBe(0);
    expect(motCourant(etat)).toBe('un');
    expect(etat.restants).toEqual(MOTS);
  });

  it('remonte un mot passé de la fin du pot', () => {
    const etat = jouer(partie(), 'commencer', 'passe', 'annuler');
    expect(etat.restants).toEqual(MOTS);
    expect(etat.scores[0][0]).toBe(0);
  });

  it('ne s’annule qu’une fois', () => {
    const etat = jouer(partie(), 'commencer', 'trouve', 'trouve', 'annuler', 'annuler');
    // Le second appel ne fait rien : un seul geste est mémorisé.
    expect(etat.scores[0][0]).toBe(1);
    expect(motCourant(etat)).toBe('deux');
  });

  it('ne franchit pas la fin du tour', () => {
    const etat = jouer(partie(), 'commencer', 'trouve', 'tempsEcoule', 'annuler');
    expect(etat.phase).toBe('bilanTour');
    expect(etat.scores[0][0]).toBe(1);
  });

  it('ne fait rien avant le premier geste', () => {
    const debut = jouer(partie(), 'commencer');
    expect(jouer(debut, 'annuler')).toBe(debut);
  });
});

describe('correction des scores', () => {
  it('ajuste la manche en cours, sans descendre sous zéro', () => {
    let etat = jouer(partie(), 'commencer', 'trouve', 'trouve');
    etat = jouer(etat, { type: 'ajusterScore', equipe: 0, delta: -1 });
    expect(etat.scores[0][0]).toBe(1);

    etat = jouer(etat, { type: 'ajusterScore', equipe: 0, delta: -5 });
    expect(etat.scores[0][0]).toBe(0);

    etat = jouer(etat, { type: 'ajusterScore', equipe: 0, delta: 1 });
    expect(etat.scores[0][0]).toBe(1);
  });

  it('ne touche pas aux manches déjà jouées', () => {
    let etat = jouer(partie(), 'commencer', 'trouve', 'trouve', 'trouve', 'trouve');
    etat = jouer(etat, { type: 'mancheSuivante', melanger: sansMelange });
    etat = jouer(etat, 'commencer', 'trouve');
    etat = jouer(etat, { type: 'ajusterScore', equipe: 1, delta: -1 });

    expect(etat.scores[0]).toEqual([4, 0, 0]);
    expect(etat.scores[1]).toEqual([0, 0, 0]);
  });

  it('remet une équipe à zéro sur toutes les manches', () => {
    let etat = jouer(partie(), 'commencer', 'trouve', 'trouve');
    etat = jouer(etat, { type: 'reinitialiserEquipe', equipe: 0 });
    expect(etat.scores[0]).toEqual([0, 0, 0]);
    // Sans toucher au pot ni à la phase : on corrige un score, on ne rejoue pas.
    expect(etat.phase).toBe('tour');
    expect(etat.restants).toHaveLength(2);
  });
});

describe('rejouer', () => {
  it('remet les scores à zéro en gardant les équipes', () => {
    const fini = jouer(partie(), 'commencer', 'trouve');
    const neuf = jouer(fini, { type: 'rejouer', melanger: sansMelange });
    expect(neuf.scores).toEqual([
      [0, 0, 0],
      [0, 0, 0]
    ]);
    expect(neuf.equipes).toEqual(fini.equipes);
    expect(neuf.phase).toBe('pret');
  });
});
