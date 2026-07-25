import { describe, it, expect } from 'vitest';
import { gamesList } from './games';

/**
 * Le catalogue est saisi à la main : ces tests verrouillent les conventions
 * documentées en tête de games.js, dont dépendent le filtrage et les URLs.
 */
describe('catalogue des jeux', () => {
  it('a des identifiants uniques', () => {
    const ids = gamesList.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a des slugs uniques et compatibles URL', () => {
    const slugs = gamesList.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug, slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(gamesList.map((g) => [g.title, g]))('« %s » respecte le format', (_titre, game) => {
    expect(typeof game.title).toBe('string');
    expect(game.title.length).toBeGreaterThan(0);
    expect(game.description.length).toBeGreaterThan(0);
    expect(game.rules.length).toBeGreaterThan(0);

    expect(Number.isInteger(game.minPlayers)).toBe(true);
    expect(Number.isInteger(game.maxPlayers)).toBe(true);
    expect(game.minPlayers).toBeGreaterThanOrEqual(2);
    expect(game.maxPlayers).toBeGreaterThanOrEqual(game.minPlayers);

    expect(Number.isFinite(game.duration)).toBe(true);
    expect(game.duration).toBeGreaterThan(0);

    expect(Array.isArray(game.material)).toBe(true);
    expect(Array.isArray(game.typeGame)).toBe(true);
    expect(game.typeGame.length).toBeGreaterThan(0);

    expect(['Débutant', 'Intermédiaire', 'Expert']).toContain(game.level);
    expect(typeof game.alcohol).toBe('boolean');

    // `image` est facultative : les cartes sont dessinées à la main, un jeu peut
    // donc entrer au catalogue avant son illustration (GameThumb affiche alors
    // un repli). En revanche, si elle est renseignée, le chemin doit être valide.
    if (game.image !== undefined) {
      expect(game.image).toMatch(/^\/.+\.(png|jpg|webp|svg)$/);
    }
  });

  it('ne réutilise pas la même description de règles pour deux jeux', () => {
    // Quatre jeux partageaient jadis un texte de règles copié-collé.
    const rules = gamesList.map((g) => g.rules);
    expect(new Set(rules).size).toBe(rules.length);
  });
});
