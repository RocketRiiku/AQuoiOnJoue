/**
 * Normalise une chaîne pour la recherche : minuscules et accents retirés,
 * afin que « traitre » trouve « traître » et « Liars » trouve « liars ».
 */
export function normalize(value) {
  return (value ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

const toArray = (value) =>
  value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];

export function filterGames(games, filters, searchTerm) {
  const search = normalize(searchTerm);

  return games.filter((game) => {
    const matchesSearch =
      !search ||
      normalize(game.title).includes(search) ||
      normalize(game.description).includes(search) ||
      normalize(game.rules).includes(search);

    // Le jeu doit pouvoir accueillir exactement ce nombre de joueurs.
    const wanted = parseInt(filters.players, 10);
    const matchesPlayers =
      !Number.isFinite(wanted) ||
      (wanted >= game.minPlayers && wanted <= game.maxPlayers);

    const matchesAlcohol =
      !filters.alcohol ||
      (filters.alcohol === 'oui' ? game.alcohol === true : game.alcohol !== true);

    // Bornes nulles = « pas de limite » (curseur à fond, donc « et plus »).
    const matchesDuration =
      (filters.minDuration == null || game.duration >= filters.minDuration) &&
      (filters.maxDuration == null || game.duration <= filters.maxDuration);

    // Sémantique « matériel dont je dispose » : on garde les jeux jouables avec
    // ce qui est coché. Un jeu sans matériel requis passe donc toujours.
    const available = toArray(filters.material);
    const required = toArray(game.material);
    const matchesMaterial =
      available.length === 0 || required.every((mat) => available.includes(mat));

    const matchesTypeGame =
      !filters.typeGame || toArray(game.typeGame).includes(filters.typeGame);

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
