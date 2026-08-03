import { describe, it, expect } from 'vitest';
import {
  effetDe,
  etatInitial,
  FACES,
  lancer,
  MEMOIRE,
  reducteur
} from './blessureCritique';

const EFFETS = Array.from({ length: FACES }, (_, i) => `effet ${i + 1}`);

const jets = (...faces) =>
  faces.reduce((etat, face) => reducteur(etat, { type: 'lancer', face }), etatInitial());

describe('la blessure critique', () => {
  it('ne montre rien avant le premier jet', () => {
    const etat = etatInitial();
    expect(etat.face).toBeNull();
    expect(effetDe(EFFETS, etat.face)).toBeNull();
  });

  it('associe chaque face à son effet, la position portant le numéro', () => {
    expect(effetDe(EFFETS, 1)).toBe('effet 1');
    expect(effetDe(EFFETS, 20)).toBe('effet 20');
  });

  it('tire toujours une face du dé, jamais 0 ni 21', () => {
    // Les deux bornes du générateur, celles où un décalage se verrait.
    expect(lancer(() => 0)).toBe(1);
    expect(lancer(() => 0.999999)).toBe(FACES);
  });

  it('rend la même face plusieurs fois — le tirage est avec remise', () => {
    // C'est ce qui interdit de faire passer ce jeu par le défileur, qui lui
    // parcourt sa pile sans répétition.
    const etat = jets(7, 7, 7);
    expect(etat.face).toBe(7);
    expect(etat.historique).toEqual([7, 7, 7]);
  });

  it('empile les jets, le plus récent en tête', () => {
    expect(jets(3, 11, 2).historique).toEqual([2, 11, 3]);
  });

  it('ne garde que les douze derniers jets', () => {
    const etat = jets(...Array.from({ length: MEMOIRE + 5 }, (_, i) => (i % FACES) + 1));
    expect(etat.historique).toHaveLength(MEMOIRE);
    expect(etat.historique[0]).toBe(MEMOIRE + 5);
  });

  it('efface tout sur « oublier »', () => {
    const etat = reducteur(jets(4, 9), { type: 'oublier' });
    expect(etat).toEqual(etatInitial());
  });

  it('ignore une action inconnue plutôt que de lever', () => {
    const etat = jets(5);
    expect(reducteur(etat, { type: 'tricher' })).toBe(etat);
  });
});
