import { describe, it, expect } from 'vitest';
import { libelles, melangeAleatoire } from './pioche';
import { contenuLancerJeu } from '../data/lancerJeu';

describe('mélange', () => {
  it('ne touche pas au tableau reçu', () => {
    // La pile d'un kit est mélangée à chaque partie : muter la source
    // appauvrirait le catalogue au fil de la soirée.
    const source = ['un', 'deux', 'trois'];
    melangeAleatoire(source);
    expect(source).toEqual(['un', 'deux', 'trois']);
  });

  it('garde les mêmes éléments', () => {
    const source = Array.from({ length: 40 }, (_, i) => i);
    expect([...melangeAleatoire(source)].sort((a, b) => a - b)).toEqual(source);
  });
});

describe('libellés du bouton de tirage', () => {
  it.each([
    ['question', 'Question suivante', 'Question précédente'],
    ['proposition', 'Proposition suivante', 'Proposition précédente'],
    ['dilemme', 'Dilemme suivant', 'Dilemme précédent'],
    ['phrase de départ', 'Phrase suivante', 'Phrase précédente'],
    ['sujet de débat', 'Sujet suivant', 'Sujet précédent'],
    ['morceau à traduire', 'Morceau suivant', 'Morceau précédent'],
    ['titre québécois', 'Titre suivant', 'Titre précédent'],
    ['série québécoise', 'Titre suivant', 'Titre précédent'],
    ['pitch falsifié', 'Résumé suivant', 'Résumé précédent'],
    ['réplique', 'Réplique suivante', 'Réplique précédente'],
    ['énigme', 'Énigme suivante', 'Énigme précédente']
  ])('accorde « %s »', (type, suivante, precedente) => {
    expect(libelles(type).suivante).toBe(suivante);
    expect(libelles(type).precedente).toBe(precedente);
  });

  it('retombe sur un nom neutre pour un type inconnu', () => {
    // Un type ajouté au tableur ne doit pas rendre le kit muet.
    expect(libelles('haïku').suivante).toBe('Carte suivante');
    expect(libelles(undefined).nom).toBe('Carte');
  });

  it('nomme tous les types qui passent par un bouton de tirage', () => {
    // Le repli neutre est un filet, pas une destination : un « Carte suivante »
    // sur un jeu livré voudrait dire qu'on a oublié de le nommer ici.
    //
    // Deux kits n'ont pas de bouton « suivante » et n'ont donc rien à nommer :
    // Trois fois rien puise dans un pot composé avant la partie, La blessure
    // critique lance un dé et affiche la face. Tous les autres tirent une carte.
    const sansBoutonDeTirage = ['trois-fois-rien', 'la-blessure-critique'];
    const types = new Set(
      Object.entries(contenuLancerJeu)
        .filter(([slug]) => !sansBoutonDeTirage.includes(slug))
        .flatMap(([, lignes]) => lignes.map((l) => l.type))
    );
    expect(types.size).toBeGreaterThan(5);
    for (const type of types) {
      expect(libelles(type).nom, type).not.toBe('Carte');
    }
  });
});
