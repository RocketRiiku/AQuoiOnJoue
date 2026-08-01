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

    // La fourchette idéale est incluse dans la fourchette jouable, sans quoi le
    // filtre « Idéal pour ce groupe » recommanderait un effectif que le jeu
    // refuse par ailleurs.
    expect(Number.isInteger(game.idealPlayersMin)).toBe(true);
    expect(Number.isInteger(game.idealPlayersMax)).toBe(true);
    expect(game.idealPlayersMin).toBeGreaterThanOrEqual(game.minPlayers);
    expect(game.idealPlayersMax).toBeGreaterThanOrEqual(game.idealPlayersMin);
    expect(game.maxPlayers).toBeGreaterThanOrEqual(game.idealPlayersMax);

    expect(Number.isFinite(game.durationBase)).toBe(true);
    expect(Number.isFinite(game.durationPerPlayer)).toBe(true);
    expect(game.durationBase).toBeGreaterThanOrEqual(0);
    expect(game.durationPerPlayer).toBeGreaterThanOrEqual(0);

    expect(typeof game.filRouge).toBe('boolean');
    // Un jeu qui n'est pas un fil rouge a forcément une durée : sans quoi il
    // s'afficherait « 0 min » et passerait tous les filtres de durée.
    if (!game.filRouge) {
      expect(game.durationBase + game.durationPerPlayer).toBeGreaterThan(0);
    }

    expect(Array.isArray(game.material)).toBe(true);
    expect(Array.isArray(game.typeGame)).toBe(true);
    expect(game.typeGame.length).toBeGreaterThan(0);

    expect(['Débutant', 'Intermédiaire', 'Expert']).toContain(game.level);
    expect(typeof game.alcohol).toBe('boolean');

    // `image` est facultative : les cartes sont dessinées à la main, un jeu peut
    // donc entrer au catalogue avant son illustration (GameThumb affiche alors
    // la carte au point d'interrogation). En revanche, si elle est renseignée,
    // le chemin doit être valide.
    if (game.image !== undefined) {
      expect(game.image).toMatch(/^\/.+\.(png|jpg|webp|svg)$/);
    }
  });

  it('ne réutilise pas la même description de règles pour deux jeux', () => {
    // Quatre jeux partageaient jadis un texte de règles copié-collé.
    const rules = gamesList.map((g) => g.rules);
    expect(new Set(rules).size).toBe(rules.length);
  });

  it('conserve les slugs déjà publiés', () => {
    // Ils circulent dans des liens partagés : les régénérer les casserait.
    for (const slug of ['liars-club', 'eau-ou-vodka', 'le-joker', 'undercover', 'cacophonie']) {
      expect(gamesList.some((g) => g.slug === slug), slug).toBe(true);
    }
  });
});
