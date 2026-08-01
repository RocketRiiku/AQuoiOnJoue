import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import GameThumb from './GameThumb';
import { asset } from '../utils/asset';

const base = {
  title: 'Undercover',
  typeGame: ['À traîtres'],
  material: [],
  image: '/CarteUndercover.png'
};

describe('GameThumb', () => {
  it('affiche l’illustration quand elle existe', () => {
    render(<GameThumb game={base} />);
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    // Résolue via le chemin de base, pour survivre à un hébergement
    // en sous-dossier.
    expect(img.getAttribute('src')).toBe(asset('/CarteUndercover.png'));
    // Vignette décorative : le titre est déjà annoncé par la carte.
    expect(img.getAttribute('alt')).toBe('');
  });

  it('retombe sur la carte au point d’interrogation quand l’illustration manque', () => {
    const { image, ...sansImage } = base;
    expect(image).toBeDefined();
    render(<GameThumb game={sansImage} />);
    expect(document.querySelector('img').getAttribute('src')).toBe(
      asset('/CarteInterrogation.png')
    );
  });
});
