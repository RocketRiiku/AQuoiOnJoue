import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CarteTiree from './CarteTiree';

/**
 * La brique du papier tiré, et son repère de défilement.
 *
 * **jsdom ne calcule aucune mise en page** : `scrollHeight` et `clientHeight` y
 * valent zéro, donc rien ne déborde jamais. On pose donc la géométrie à la main,
 * ce qui est exactement ce que le repère lit — c'est la logique du repère qu'on
 * vérifie ici, pas le rendu, qui demande un vrai navigateur.
 */
const zone = () => document.querySelector('.anim-carte-tiree > div');

/** Fait mentir jsdom sur la taille de la zone, puis relance la mesure. */
const poserGeometrie = ({ visible, total, position = 0 }) => {
  const el = zone();
  Object.defineProperty(el, 'clientHeight', { value: visible, configurable: true });
  Object.defineProperty(el, 'scrollHeight', { value: total, configurable: true });
  el.scrollTop = position;
  fireEvent.scroll(el);
};

const reperes = () =>
  [...document.querySelectorAll('span[aria-hidden="true"]')]
    .filter((s) => s.className.includes('h-12'))
    .map((s) => (s.className.includes('top-0') ? 'haut' : 'bas'));

describe('carte tirée', () => {
  it('affiche le texte qu’on lui donne, et l’annonce', () => {
    render(<CarteTiree texte="Bohemian Rhapsody" />);
    expect(screen.getByRole('status')).toHaveTextContent('Bohemian Rhapsody');
  });

  it('se tait quand l’écran n’a pas à lire la carte', () => {
    render(<CarteTiree texte="Bohemian Rhapsody" annonce={false} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('respecte les sauts de ligne des paroles', () => {
    // Sorry mon french : on lit une chanson vers par vers, et d'un bloc elle ne
    // veut plus rien dire.
    render(<CarteTiree texte={'premier vers\nsecond vers'} taille="phrase" />);
    expect(screen.getByRole('status').className).toContain('whitespace-pre-line');
  });

  it('met le texte dans une zone qui défile, et non dans la carte elle-même', () => {
    // Le repère se pose sur l'enveloppe, qui ne bouge pas : un calque absolu placé
    // dans le conteneur défilant suivrait le contenu et sortirait du cadre.
    render(<CarteTiree texte="un texte" plein />);
    expect(zone().className).toContain('overflow-y-auto');
    expect(zone().contains(screen.getByRole('status'))).toBe(true);
  });

  describe('le repère de défilement', () => {
    it('ne montre rien quand tout tient', () => {
      render(<CarteTiree texte="court" plein />);
      poserGeometrie({ visible: 300, total: 300 });
      expect(reperes()).toEqual([]);
    });

    it('annonce la suite quand on est en haut', () => {
      render(<CarteTiree texte="un long résumé" taille="passage" plein />);
      poserGeometrie({ visible: 300, total: 700, position: 0 });
      expect(reperes()).toEqual(['bas']);
    });

    it('annonce les deux sens au milieu', () => {
      render(<CarteTiree texte="un long résumé" taille="passage" plein />);
      poserGeometrie({ visible: 300, total: 700, position: 200 });
      expect(reperes()).toEqual(['haut', 'bas']);
    });

    it('ne montre plus que le retour en bout de course', () => {
      // Une flèche qui reste allumée en bas de course ne dit rien.
      render(<CarteTiree texte="un long résumé" taille="passage" plein />);
      poserGeometrie({ visible: 300, total: 700, position: 400 });
      expect(reperes()).toEqual(['haut']);
    });

    it('tolère une hauteur fractionnaire en bout de course', () => {
      // Les hauteurs sous-pixel font mentir l'égalité stricte, et le défilement
      // s'arrête à un demi-pixel du bas.
      render(<CarteTiree texte="un long résumé" taille="passage" plein />);
      poserGeometrie({ visible: 300, total: 700, position: 399.5 });
      expect(reperes()).toEqual(['haut']);
    });

    it('reste décoratif : rien n’entre dans le texte annoncé', () => {
      // Le texte entier est déjà lu d'un bloc — un lecteur d'écran n'a rien à
      // faire défiler.
      render(<CarteTiree texte="un long résumé" taille="passage" plein />);
      poserGeometrie({ visible: 300, total: 700, position: 200 });
      expect(screen.getByRole('status')).toHaveTextContent('un long résumé');
      expect(screen.getByRole('status').textContent).toBe('un long résumé');
    });
  });
});
