export function filterGames(games, filters, searchTerm) {
  return games.filter((game) => {
    const search = searchTerm?.toLowerCase() || '';
    const matchesSearch =
      game.title.toLowerCase().includes(search) ||
      game.description.toLowerCase().includes(search);

    const matchesPlayers =
      !filters.players || game.players.includes(filters.players.toString());

    const matchesAlcohol =
      !filters.alcohol || game.alcohol === filters.alcohol;

    const gameDuration = game.duration === '30+' ? 30 : parseInt(game.duration);
    const matchesDuration =
      (!filters.minDuration && !filters.maxDuration) ||
      (gameDuration >= (filters.minDuration || 0) &&
        gameDuration <= (filters.maxDuration || Infinity));

    const matchesMaterial =
      !filters.material ||
      filters.material.length === 0 ||
      (game.material && filters.material.every((mat) => game.material.includes(mat)));

    const matchesTypeGame =
      !filters.typeGame ||
      (Array.isArray(game.typeGame)
        ? game.typeGame.includes(filters.typeGame)
        : game.typeGame === filters.typeGame);

    const matchesLevel = !filters.level || game.level === filters.level;

    return (
      matchesSearch &&
      matchesPlayers &&
      matchesAlcohol &&
      matchesDuration &&
      matchesMaterial &&
      matchesTypeGame &&
      matchesLevel
    );
  });
}
