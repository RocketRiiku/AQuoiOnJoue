import { describe, it, expect } from 'vitest';
import { asset } from './asset';

/**
 * Les attentes sont construites à partir de BASE_URL plutôt que codées en dur :
 * les tests restent justes que le site soit servi à la racine (Cloudflare,
 * Netlify) ou dans un sous-dossier (GitHub Pages, /AQuoiOnJoue/).
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

describe('asset', () => {
  it('préfixe un chemin de public/ avec le chemin de base', () => {
    expect(asset('/star.png')).toBe(`${BASE}/star.png`);
  });

  it('accepte un chemin sans slash initial', () => {
    expect(asset('star.png')).toBe(`${BASE}/star.png`);
  });

  it('ne double jamais les slashs', () => {
    expect(asset('/star.png').replace(/^https?:\/\//, '')).not.toContain('//');
    expect(asset('/fonts/titre.woff2').replace(/^https?:\/\//, '')).not.toContain('//');
  });

  it('produit un chemin absolu depuis la racine du domaine', () => {
    expect(asset('/star.png').startsWith('/')).toBe(true);
  });

  it('laisse les URL absolues intactes', () => {
    expect(asset('https://exemple.fr/image.png')).toBe('https://exemple.fr/image.png');
    expect(asset('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('tolère une valeur vide', () => {
    expect(asset(undefined)).toBeUndefined();
    expect(asset('')).toBe('');
  });

  it('résout toutes les illustrations du catalogue', async () => {
    const { gamesList } = await import('../data/games');
    for (const game of gamesList) {
      if (!game.image) continue;
      expect(asset(game.image), game.title).toBe(`${BASE}${game.image}`);
    }
  });
});
