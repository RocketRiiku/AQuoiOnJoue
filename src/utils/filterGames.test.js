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

const filsRouges = gamesList.filter((g) => g.filRouge).map((g) => g.title);

describe('filterGames', () => {
  it('ne filtre rien par défaut', () => {
    expect(run()).toHaveLength(gamesList.length);
  });

  describe('joueurs', () => {
    it('retient les jeux dont la fourchette couvre le nombre demandé', () => {
      const a2 = run({ players: '2' });
      expect(a2).toContain('Duo, carré ou cash ?'); // minPlayers = 2
      expect(a2).not.toContain('Le Liars Club'); // minPlayers = 3
    });

    it('ne garde que les jeux taillés pour un très grand groupe', () => {
      expect(run({ players: '20' })).toEqual(['Ban word']);
    });

    it('exclut un jeu quand le groupe est trop petit pour lui', () => {
      expect(run({ players: '3' })).not.toContain('Undercover');
    });
  });

  describe('durée', () => {
    it('filtre sur une fourchette', () => {
      const court = run({ maxDuration: 10 });
      expect(court).toContain('La pieuvre'); // 8–12 min à son effectif idéal
      expect(court).not.toContain('Le Liars Club'); // 35–47 min
    });

    it('traite une borne haute nulle comme « et plus » (régression : « 30+ » était ramené à 30)', () => {
      const longs = run({ minDuration: 45 }).filter((titre) => !filsRouges.includes(titre));
      expect(longs).toEqual(['Le Liars Club']);
    });

    it('compare la fourchette affichée, et non un chiffre unique', () => {
      // Le Liars Club dure 35 min à 5 joueurs et 47 à 7 : il doit ressortir
      // d'une recherche « moins de 40 min » comme d'une recherche « plus de 45 ».
      expect(run({ maxDuration: 40 })).toContain('Le Liars Club');
      expect(run({ minDuration: 45 })).toContain('Le Liars Club');
    });

    it('resserre la fourchette dès que l’effectif est connu', () => {
      // À 8 joueurs, Le Liars Club dure 53 min : il sort d'un « moins de 40 ».
      expect(run({ maxDuration: 40, players: '8' })).not.toContain('Le Liars Club');
      expect(run({ maxDuration: 40, players: '5' })).toContain('Le Liars Club');
    });

    it('laisse toujours passer les fils rouges, qui n’ont pas de durée propre', () => {
      expect(filsRouges.length).toBeGreaterThan(0);
      for (const titre of filsRouges) {
        expect(run({ maxDuration: 10 }), titre).toContain(titre);
        expect(run({ minDuration: 45 }), titre).toContain(titre);
      }
    });
  });

  describe('matériel', () => {
    it('interprète les cases comme le matériel disponible, pas comme une exigence', () => {
      const avecCartes = run({ material: ['Cartes à jouer'] });
      expect(avecCartes).toContain('Sur parole'); // réclame des cartes
      expect(avecCartes).toContain('Le Liars Club'); // ne réclame rien
      expect(avecCartes).not.toContain('Cacophonie'); // réclame un téléphone
    });

    it('cumule le matériel coché', () => {
      const seulement = run({ material: ['Cartes à jouer'] });
      const cumul = run({ material: ['Cartes à jouer', 'Téléphone'] });
      expect(cumul).toContain('Cacophonie');
      expect(cumul.length).toBeGreaterThan(seulement.length);
    });

    it('aucune option de matériel ne renvoie une liste vide (régression : material était vide partout)', () => {
      for (const material of MATERIAL_OPTIONS) {
        expect(run({ material: [material] }), material).not.toHaveLength(0);
      }
    });
  });

  describe('type de jeu', () => {
    it('gère les jeux à plusieurs types', () => {
      expect(run({ typeGame: 'À traîtres' })).toEqual([
        'Undercover',
        'La Murder party',
        'Cow-boy',
        'Chef d’orchestre',
        'Insider'
      ]);
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
      expect(run({ alcohol: 'oui' })).toEqual([
        'Eau ou vodka ?',
        'Le Joker',
        'La blessure critique',
        'La pieuvre',
        'Je n’ai jamais',
        'Le 21'
      ]);
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
      expect(run({}, 'traitre')).toContain('Insider');
    });

    it('cherche aussi dans les règles', () => {
      expect(run({}, 'anecdotes')).toEqual(['Le Liars Club']);
    });

    it('renvoie une liste vide sur un terme absent', () => {
      expect(run({}, 'zzzz')).toEqual([]);
    });
  });

  it('combine plusieurs filtres', () => {
    expect(run({ players: '5', level: 'Expert', alcohol: 'non' })).toEqual([
      'Pitch de ouf',
      'Soyez logique',
      'La Murder party',
      'Psycho'
    ]);
    // Un critère de plus restreint encore.
    expect(
      run({ players: '5', level: 'Expert', alcohol: 'non', typeGame: 'Règle cachée' })
    ).toEqual(['Psycho']);
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
