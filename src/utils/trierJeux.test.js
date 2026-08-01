import { describe, it, expect } from 'vitest';
import { TRIS, TRI_PAR_DEFAUT, trierJeux } from './trierJeux';
import { gamesList } from '../data/games';
import { estRecommande, plageDuree } from './formatGame';

const titres = (jeux) => jeux.map((g) => g.title);

describe('trierJeux', () => {
  it('ne modifie pas la liste reçue', () => {
    const copie = [...gamesList];
    trierJeux(gamesList, 'alpha');
    expect(gamesList).toEqual(copie);
  });

  it('garde l’ordre du catalogue sur une clé inconnue', () => {
    // Un état corrompu ou un tri retiré depuis ne doit pas casser la liste.
    expect(titres(trierJeux(gamesList, 'nexiste-pas'))).toEqual(titres(gamesList));
  });

  it('conserve tous les jeux, quel que soit le tri', () => {
    for (const { cle } of TRIS) {
      expect(trierJeux(gamesList, cle, 6), cle).toHaveLength(gamesList.length);
    }
  });

  describe('conseillés d’abord', () => {
    it('remonte les jeux idéaux pour l’effectif', () => {
      const tries = trierJeux(gamesList, TRI_PAR_DEFAUT, 12);
      const premierSansEtoile = tries.findIndex((g) => !estRecommande(g, 12));
      expect(premierSansEtoile).toBeGreaterThan(0);
      // Plus aucun jeu conseillé après le premier qui ne l'est pas.
      expect(tries.slice(premierSansEtoile).some((g) => estRecommande(g, 12))).toBe(false);
    });

    it('laisse le catalogue en l’état sans effectif', () => {
      // Rien ne distingue un jeu conseillé tant qu'on ignore l'effectif.
      expect(titres(trierJeux(gamesList, TRI_PAR_DEFAUT, null))).toEqual(titres(gamesList));
    });
  });

  describe('alphabétique', () => {
    it('range de A à Z, accents et casse ignorés', () => {
      const tries = titres(trierJeux(gamesList, 'alpha'));
      expect(tries[0]).toBe('30 secondes chrono'); // les chiffres avant les lettres
      expect(tries).toEqual([...tries].sort((a, b) => a.localeCompare(b, 'fr')));
    });

    it('range les nombres sur leur valeur et non caractère par caractère', () => {
      const tries = titres(trierJeux(gamesList, 'alpha'));
      expect(tries.indexOf('Le 21')).toBeLessThan(tries.indexOf('Le blindlo-fi'));
    });
  });

  describe('les plus courts', () => {
    it('range par durée croissante', () => {
      const tries = trierJeux(gamesList, 'duree', 6);
      const bornes = tries.map((g) => plageDuree(g, 6)?.[0] ?? Infinity);
      expect(bornes).toEqual([...bornes].sort((a, b) => a - b));
    });

    it('renvoie les fils rouges en fin de liste, faute de durée propre', () => {
      const tries = trierJeux(gamesList, 'duree', 6);
      const filsRouges = gamesList.filter((g) => g.filRouge);
      expect(filsRouges.length).toBeGreaterThan(0);
      expect(tries.slice(-filsRouges.length).every((g) => g.filRouge)).toBe(true);
    });

    it('suit l’effectif : un jeu long à huit peut être court à trois', () => {
      const rang = (joueurs, slug) =>
        trierJeux(gamesList, 'duree', joueurs).findIndex((g) => g.slug === slug);
      // Le Liars Club coûte 6 min par joueur : il dévale le classement.
      expect(rang(3, 'liars-club')).toBeLessThan(rang(8, 'liars-club'));
    });
  });

  describe('jeux de fond d’abord', () => {
    it('met les fils rouges en tête', () => {
      const tries = trierJeux(gamesList, 'filRouge');
      const nb = gamesList.filter((g) => g.filRouge).length;
      expect(tries.slice(0, nb).every((g) => g.filRouge)).toBe(true);
      expect(tries.slice(nb).some((g) => g.filRouge)).toBe(false);
    });
  });
});
