import { describe, it, expect } from 'vitest';
import { filterGames } from './filterGames';
import { gamesList } from '../data/games';

const baseFilters = {
  players: '',
  alcohol: '',
  minDuration: null,
  maxDuration: null,
  material: [],
  typeGame: '',
  level: ''
};

describe('filterGames', () => {
  it('filters by number of players', () => {
    const filters = { ...baseFilters, players: '2' };
    const result = filterGames(gamesList, filters, '');
    expect(result.map(g => g.id)).toEqual([1,2,5,6]);
  });

  it('filters by duration range', () => {
    const filters = { ...baseFilters, minDuration: 5, maxDuration: 10 };
    const result = filterGames(gamesList, filters, '');
    expect(result.map(g => g.id)).toEqual([2,3,6]);
  });

  it('filters by game type', () => {
    const filters = { ...baseFilters, typeGame: 'à traîtres' };
    const result = filterGames(gamesList, filters, '');
    expect(result.map(g => g.id)).toEqual([1,4]);
  });

  it('filters by level', () => {
    const filters = { ...baseFilters, level: 'Débutant' };
    const result = filterGames(gamesList, filters, '');
    expect(result.map(g => g.id)).toEqual([2,3,6]);
  });
});
