import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useNavigation } from './useNavigation';
import { gamesList } from '../data/games';

const CLE = 'aquoionjoue:soiree';
const aller = (recherche) => window.history.replaceState({}, '', `/${recherche}`);
const monter = () => renderHook(() => useNavigation(gamesList));
const titres = (soiree) => soiree.map((g) => g.title);

describe('useNavigation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    aller('');
  });

  describe('vue affichée', () => {
    it('affiche la liste par défaut', () => {
      expect(monter().result.current.vue).toBe('liste');
    });

    it('affiche une fiche avec ?jeu', () => {
      aller('?jeu=undercover');
      const { result } = monter();
      expect(result.current.vue).toBe('jeu');
      expect(result.current.jeuAffiche.title).toBe('Undercover');
    });

    it('affiche le programme avec ?soiree', () => {
      aller('?soiree=undercover');
      expect(monter().result.current.vue).toBe('soiree');
    });

    it('passe en lancement avec ?soiree et ?etape', () => {
      aller('?soiree=undercover,cacophonie&etape=2');
      const { result } = monter();
      expect(result.current.vue).toBe('lancement');
      expect(result.current.etape).toBe(2);
    });

    it('borne une étape hors limites plutôt que de casser', () => {
      aller('?soiree=undercover,cacophonie&etape=99');
      expect(monter().result.current.etape).toBe(2);
    });

    it('retombe sur la liste si le jeu est inconnu', () => {
      aller('?jeu=nexiste-pas');
      expect(monter().result.current.vue).toBe('liste');
    });
  });

  describe('source de la sélection', () => {
    it('lit le stockage local en l’absence d’URL', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['le-joker']));
      expect(titres(monter().result.current.soiree)).toEqual(['Le Joker']);
    });

    it('donne la priorité à l’URL sur le stockage (lien reçu d’un ami)', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['le-joker']));
      aller('?soiree=cacophonie');
      expect(titres(monter().result.current.soiree)).toEqual(['Cacophonie']);
    });

    it('mémorise le programme reçu par lien', () => {
      aller('?soiree=cacophonie,le-joker');
      monter();
      expect(JSON.parse(window.localStorage.getItem(CLE))).toEqual(['cacophonie', 'le-joker']);
    });

    it('ignore les slugs inconnus d’un lien obsolète', () => {
      aller('?soiree=cacophonie,jeu-supprime');
      expect(titres(monter().result.current.soiree)).toEqual(['Cacophonie']);
    });

    it('survit à un stockage corrompu', () => {
      window.localStorage.setItem(CLE, 'ceci-nest-pas-du-json');
      expect(monter().result.current.soiree).toEqual([]);
    });
  });

  describe('modification de la sélection', () => {
    const jeu = (slug) => gamesList.find((g) => g.slug === slug);

    it('ajoute puis retire un jeu', () => {
      const { result } = monter();

      act(() => result.current.basculerSoiree(jeu('undercover')));
      expect(titres(result.current.soiree)).toEqual(['Undercover']);
      expect(result.current.estDansSoiree('undercover')).toBe(true);

      act(() => result.current.basculerSoiree(jeu('undercover')));
      expect(result.current.soiree).toEqual([]);
      expect(result.current.estDansSoiree('undercover')).toBe(false);
    });

    it('conserve l’ordre d’ajout', () => {
      const { result } = monter();
      act(() => result.current.basculerSoiree(jeu('pyramide')));
      act(() => result.current.basculerSoiree(jeu('undercover')));
      expect(titres(result.current.soiree)).toEqual(['Pyramide', 'Undercover']);
    });

    it('réordonne', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['pyramide', 'undercover', 'le-joker']));
      const { result } = monter();

      act(() => result.current.deplacerDansSoiree('undercover', -1));
      expect(titres(result.current.soiree)).toEqual(['Undercover', 'Pyramide', 'Le Joker']);
    });

    it('ne déplace rien au-delà des bornes', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['pyramide', 'undercover']));
      const { result } = monter();

      act(() => result.current.deplacerDansSoiree('pyramide', -1));
      expect(titres(result.current.soiree)).toEqual(['Pyramide', 'Undercover']);

      act(() => result.current.deplacerDansSoiree('undercover', 1));
      expect(titres(result.current.soiree)).toEqual(['Pyramide', 'Undercover']);
    });

    it('vide le programme', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['pyramide', 'undercover']));
      const { result } = monter();

      act(() => result.current.viderSoiree());
      expect(result.current.soiree).toEqual([]);
      expect(JSON.parse(window.localStorage.getItem(CLE))).toEqual([]);
    });
  });

  describe('navigation', () => {
    it('ouvre un jeu et écrit l’URL', () => {
      const { result } = monter();
      act(() => result.current.ouvrirJeu(gamesList[0]));
      expect(window.location.search).toContain(`jeu=${gamesList[0].slug}`);
      expect(result.current.vue).toBe('jeu');
    });

    it('ouvre le programme avec la sélection courante dans l’URL', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['undercover', 'le-joker']));
      const { result } = monter();

      act(() => result.current.ouvrirSoiree());
      expect(decodeURIComponent(window.location.search)).toContain('soiree=undercover,le-joker');
      expect(result.current.vue).toBe('soiree');
    });

    it('lance la soirée à la première étape', () => {
      window.localStorage.setItem(CLE, JSON.stringify(['undercover', 'le-joker']));
      const { result } = monter();

      act(() => result.current.lancerSoiree());
      expect(result.current.vue).toBe('lancement');
      expect(result.current.etape).toBe(1);
    });

    it('quitte le lancement en conservant le programme', () => {
      aller('?soiree=undercover,le-joker&etape=2');
      const { result } = monter();

      act(() => result.current.quitterLancement());
      expect(result.current.vue).toBe('soiree');
      expect(titres(result.current.soiree)).toEqual(['Undercover', 'Le Joker']);
    });
  });
});
