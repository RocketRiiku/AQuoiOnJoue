import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameThumb from './GameThumb';
import { iconeDeRepli } from '../utils/formatGame';

const base = {
  title: 'Undercover',
  typeGame: ['à traîtres'],
  material: [],
  image: '/CarteUndercover.png'
};

describe('GameThumb', () => {
  it('affiche l’illustration quand elle existe', () => {
    render(<GameThumb game={base} />);
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/CarteUndercover.png');
    // Vignette décorative : le titre est déjà annoncé par la carte.
    expect(img.getAttribute('alt')).toBe('');
  });

  it('affiche un repli quand l’illustration manque', () => {
    const { image, ...sansImage } = base;
    expect(image).toBeDefined();
    render(<GameThumb game={sansImage} />);
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('UN')).toBeInTheDocument();
  });
});

describe('iconeDeRepli', () => {
  it('choisit l’icône selon le type de jeu', () => {
    expect(iconeDeRepli({ typeGame: ['à traîtres'], material: [] })).toBe('🕵️');
    expect(iconeDeRepli({ typeGame: ['coopératif'], material: [] })).toBe('🤝');
  });

  it('retombe sur le matériel si le type ne donne rien', () => {
    expect(iconeDeRepli({ typeGame: [], material: ['Cartes à jouer'] })).toBe('🃏');
  });

  it('a toujours une valeur par défaut', () => {
    expect(iconeDeRepli({ typeGame: [], material: [] })).toBe('🎲');
  });

  it('tolère un typeGame en chaîne plutôt qu’en tableau', () => {
    expect(iconeDeRepli({ typeGame: 'compétitif', material: [] })).toBe('⚔️');
  });
});
