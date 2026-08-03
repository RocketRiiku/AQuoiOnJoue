import { describe, it, expect } from 'vitest';
import {
  carteCourante,
  epuise,
  etatInitial,
  libelles,
  rappelDe,
  reducteur,
  restantes
} from './defileur';
import { gamesList } from '../data/games';

/** Mélange neutre : les tests portent sur le parcours, pas sur le hasard. */
const sansMelange = (tableau) => [...tableau];

const CARTES = [
  { type: 'question', contenu: 'une' },
  { type: 'question', contenu: 'deux' },
  { type: 'question', contenu: 'trois' }
];

const pile = (cartes = CARTES) => etatInitial({ cartes, melanger: sansMelange });

const avancer = (etat, n) =>
  Array.from({ length: n }).reduce((e) => reducteur(e, { type: 'suivante' }), etat);

describe('défileur', () => {
  it('démarre sur la première carte', () => {
    const etat = pile();
    expect(carteCourante(etat).contenu).toBe('une');
    expect(restantes(etat)).toBe(2);
    expect(epuise(etat)).toBe(false);
  });

  it('avance carte par carte, sans jamais repasser sur la même', () => {
    let etat = pile();
    const vues = [];
    while (!epuise(etat)) {
      vues.push(carteCourante(etat).contenu);
      etat = reducteur(etat, { type: 'suivante' });
    }
    expect(vues).toEqual(['une', 'deux', 'trois']);
  });

  it('signale la pile épuisée un cran après la dernière carte', () => {
    const etat = avancer(pile(), 3);
    expect(epuise(etat)).toBe(true);
    expect(carteCourante(etat)).toBeNull();
  });

  it('ne va pas au-delà de la pile épuisée', () => {
    const etat = avancer(pile(), 3);
    expect(reducteur(etat, { type: 'suivante' })).toBe(etat);
  });

  it('revient en arrière — une carte tournée par erreur se rattrape', () => {
    const etat = reducteur(avancer(pile(), 2), { type: 'precedente' });
    expect(carteCourante(etat).contenu).toBe('deux');
  });

  it('ne revient pas avant la première carte', () => {
    const etat = pile();
    expect(reducteur(etat, { type: 'precedente' })).toBe(etat);
  });

  it('sort de l’état épuisé par un retour en arrière', () => {
    const etat = reducteur(avancer(pile(), 3), { type: 'precedente' });
    expect(epuise(etat)).toBe(false);
    expect(carteCourante(etat).contenu).toBe('trois');
  });

  it('remélange la même pile, et repart du début', () => {
    const inverse = (tableau) => [...tableau].reverse();
    const etat = reducteur(avancer(pile(), 3), {
      type: 'recommencer',
      melanger: inverse
    });
    expect(etat.index).toBe(0);
    expect(etat.pile).toHaveLength(3);
    expect(carteCourante(etat).contenu).toBe('trois');
  });

  it('ignore une action inconnue plutôt que de lever', () => {
    const etat = pile();
    expect(reducteur(etat, { type: 'valser' })).toBe(etat);
  });

  it('mélange par défaut sans modifier la liste reçue', () => {
    const cartes = [...CARTES];
    etatInitial({ cartes });
    expect(cartes).toEqual(CARTES);
  });
});

describe('libellés du bouton de tirage', () => {
  it.each([
    ['question', 'Question suivante', 'Question précédente'],
    ['proposition', 'Proposition suivante', 'Proposition précédente'],
    ['dilemme', 'Dilemme suivant', 'Dilemme précédent'],
    ['phrase de départ', 'Phrase suivante', 'Phrase précédente'],
    ['sujet de débat', 'Sujet suivant', 'Sujet précédent']
  ])('accorde « %s »', (type, suivante, precedente) => {
    expect(libelles(type).suivante).toBe(suivante);
    expect(libelles(type).precedente).toBe(precedente);
  });

  it('retombe sur un nom neutre pour un type inconnu', () => {
    // Un type ajouté au tableur ne doit pas rendre le kit muet.
    expect(libelles('haïku').suivante).toBe('Carte suivante');
    expect(libelles(undefined).nom).toBe('Carte');
  });
});

describe('rappel d’avant-partie', () => {
  it('ne vise que des jeux du catalogue', () => {
    // Un rappel écrit pour un slug qui n'existe pas ne s'afficherait jamais, et
    // rien ne le signalerait.
    for (const slug of ['le-joker', 'oui-ou-non', 'tu-preferes', 'sang-bleu']) {
      expect(gamesList.some((g) => g.slug === slug), slug).toBe(true);
      expect(rappelDe(slug)).toBeTruthy();
    }
  });

  it('tient en une phrase — c’est un rappel, pas les règles', () => {
    // Les règles complètes sont sur la fiche ; répéter un paragraphe ici
    // rétablirait le péage qu'on cherche justement à éviter.
    for (const slug of ['le-joker', 'oui-ou-non', 'du-coq-a-l-ane', 'sang-bleu']) {
      expect(rappelDe(slug).length, slug).toBeLessThan(200);
    }
  });

  it('rend null pour un jeu sans rappel, qui ouvre alors sur sa carte', () => {
    expect(rappelDe('trois-fois-rien')).toBeNull();
  });
});
