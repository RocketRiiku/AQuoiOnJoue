import { describe, it, expect } from 'vitest';
import { filterGames, normalize } from './filterGames';
import { gamesList } from '../data/games';
import {
  DEFAULT_FILTERS,
  MATERIAL_OPTIONS,
  TYPE_OPTIONS,
  LEVEL_OPTIONS
} from '../data/filterOptions';

const run = (overrides = {}, search = '') =>
  filterGames(gamesList, { ...DEFAULT_FILTERS, ...overrides }, search).map((g) => g.title);

describe('filterGames', () => {
  it('ne filtre rien par défaut', () => {
    expect(run()).toHaveLength(gamesList.length);
  });

  describe('joueurs', () => {
    it('retient les jeux dont la fourchette couvre le nombre demandé', () => {
      expect(run({ players: '2' })).toEqual(['mix.GPT']);
    });

    it('retient tous les jeux pour un grand groupe', () => {
      expect(run({ players: '10' })).toHaveLength(gamesList.length);
    });

    it('exclut un jeu quand le groupe est trop petit pour lui', () => {
      expect(run({ players: '3' })).not.toContain('Undercover');
    });
  });

  describe('durée', () => {
    it('filtre sur une fourchette', () => {
      expect(run({ minDuration: 5, maxDuration: 15 })).toEqual([
        'Eau ou vodka ?',
        'mix.GPT'
      ]);
    });

    it('traite une borne haute nulle comme « et plus » (régression : « 30+ » était ramené à 30)', () => {
      expect(run({ minDuration: 30, maxDuration: null })).toEqual(['Le Liars Club']);
    });
  });

  describe('matériel', () => {
    it('interprète les cases comme le matériel disponible, pas comme une exigence', () => {
      // Le Liars Club ne réclame aucun matériel : il reste jouable.
      expect(run({ material: ['Cartes à jouer'] })).toEqual([
        'Le Liars Club',
        'Le Joker'
      ]);
    });

    it('cumule le matériel coché', () => {
      expect(run({ material: ['Cartes à jouer', 'Téléphone'] })).toEqual([
        'Le Liars Club',
        'Le Joker',
        'Cacophonie',
        'mix.GPT'
      ]);
    });

    it('aucune option de matériel ne renvoie une liste vide (régression : material était vide partout)', () => {
      for (const material of MATERIAL_OPTIONS) {
        expect(run({ material: [material] }), material).not.toHaveLength(0);
      }
    });
  });

  describe('type de jeu', () => {
    it('gère les jeux à plusieurs types', () => {
      expect(run({ typeGame: 'à traîtres' })).toEqual(['Le Liars Club', 'Undercover']);
    });

    it('aucune option de type ne renvoie une liste vide (régression : « coopératif » ne correspondait à aucun jeu)', () => {
      for (const type of TYPE_OPTIONS) {
        expect(run({ typeGame: type }), type).not.toHaveLength(0);
      }
    });
  });

  describe('niveau', () => {
    it('aucune option de niveau ne renvoie une liste vide', () => {
      for (const level of LEVEL_OPTIONS) {
        expect(run({ level }), level).not.toHaveLength(0);
      }
    });
  });

  describe('alcool', () => {
    it('isole les jeux alcoolisés', () => {
      expect(run({ alcohol: 'oui' })).toEqual(['Eau ou vodka ?']);
    });

    it('exclut les jeux alcoolisés', () => {
      expect(run({ alcohol: 'non' })).not.toContain('Eau ou vodka ?');
    });
  });

  describe('recherche', () => {
    it('ignore la casse', () => {
      expect(run({}, 'LIARS')).toEqual(['Le Liars Club']);
    });

    it('ignore les accents (régression : « traitre » ne trouvait pas « traître »)', () => {
      expect(run({}, 'traitre')).toEqual(['Undercover']);
    });

    it('cherche aussi dans les règles', () => {
      expect(run({}, 'cul sec')).toEqual(['Eau ou vodka ?']);
    });

    it('renvoie une liste vide sur un terme absent', () => {
      expect(run({}, 'zzzz')).toEqual([]);
    });
  });

  it('combine plusieurs filtres', () => {
    expect(run({ players: '5', level: 'Débutant', alcohol: 'non' })).toEqual([
      'Le Joker',
      'mix.GPT'
    ]);
    // Le matériel restreint encore : sans téléphone, mix.GPT tombe.
    expect(
      run({ players: '5', level: 'Débutant', alcohol: 'non', material: ['Cartes à jouer'] })
    ).toEqual(['Le Joker']);
  });
});

describe('normalize', () => {
  it('retire accents et casse', () => {
    expect(normalize('À Traîtres')).toBe('a traitres');
  });

  it('tolère null et undefined', () => {
    expect(normalize(null)).toBe('');
    expect(normalize(undefined)).toBe('');
  });
});
