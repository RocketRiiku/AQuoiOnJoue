import { describe, it, expect } from 'vitest';
import {
  compterFiltresActifs,
  compterFiltresSecondaires,
  DEFAULT_FILTERS,
  LEVEL_OPTIONS,
  MATERIAL_OPTIONS,
  TYPE_OPTIONS
} from './filterOptions';
import { gamesList } from './games';

const avec = (surcharges) => ({ ...DEFAULT_FILTERS, ...surcharges });

describe('options dérivées du catalogue', () => {
  it('ne propose que des libellés présents dans les jeux', () => {
    for (const mat of MATERIAL_OPTIONS) {
      expect(gamesList.some((g) => g.material.includes(mat)), mat).toBe(true);
    }
    for (const type of TYPE_OPTIONS) {
      expect(gamesList.some((g) => g.typeGame.includes(type)), type).toBe(true);
    }
    for (const level of LEVEL_OPTIONS) {
      expect(gamesList.some((g) => g.level === level), level).toBe(true);
    }
  });

  it('classe les niveaux par difficulté et non par ordre alphabétique', () => {
    const attendu = ['Débutant', 'Intermédiaire', 'Expert'].filter((n) =>
      LEVEL_OPTIONS.includes(n)
    );
    expect(LEVEL_OPTIONS).toEqual(attendu);
  });
});

describe('compterFiltresSecondaires', () => {
  it('vaut zéro sans filtre', () => {
    expect(compterFiltresSecondaires(DEFAULT_FILTERS)).toBe(0);
  });

  it('ignore joueurs et durée, qui restent visibles', () => {
    expect(compterFiltresSecondaires(avec({ players: '4' }))).toBe(0);
    expect(compterFiltresSecondaires(avec({ minDuration: 15 }))).toBe(0);
  });

  it('compte un critère par dimension repliée', () => {
    expect(compterFiltresSecondaires(avec({ typeGame: 'compétitif' }))).toBe(1);
    expect(
      compterFiltresSecondaires(
        avec({ typeGame: 'compétitif', level: 'Débutant', alcohol: 'non' })
      )
    ).toBe(3);
  });

  it('ne compte le matériel qu’une fois, quel que soit le nombre de cases', () => {
    expect(compterFiltresSecondaires(avec({ material: ['Verres'] }))).toBe(1);
    expect(
      compterFiltresSecondaires(avec({ material: ['Verres', 'Téléphone'] }))
    ).toBe(1);
  });
});

describe('compterFiltresActifs', () => {
  it('vaut zéro sans filtre', () => {
    expect(compterFiltresActifs(DEFAULT_FILTERS)).toBe(0);
  });

  it('inclut joueurs et durée', () => {
    expect(compterFiltresActifs(avec({ players: '4' }))).toBe(1);
    expect(compterFiltresActifs(avec({ players: '4', maxDuration: 20 }))).toBe(2);
  });

  it('compte la durée une seule fois même avec les deux bornes', () => {
    expect(compterFiltresActifs(avec({ minDuration: 10, maxDuration: 20 }))).toBe(1);
  });

  it('additionne critères visibles et repliés', () => {
    expect(
      compterFiltresActifs(avec({ players: '6', material: ['Verres'], level: 'Débutant' }))
    ).toBe(3);
  });
});
