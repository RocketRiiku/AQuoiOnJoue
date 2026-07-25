/** Libellés partagés entre la carte et la fiche détaillée. */

export function formatPlayers(game) {
  return game.minPlayers === game.maxPlayers
    ? `${game.minPlayers} joueurs`
    : `${game.minPlayers} à ${game.maxPlayers} joueurs`;
}

export function formatDuration(game) {
  return `${game.duration} min`;
}

/** Durée cumulée d'une soirée : « 1 h 20 » se lit mieux que « 80 min ». */
export function formatDureeTotale(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${heures} h` : `${heures} h ${String(reste).padStart(2, '0')}`;
}

export function formatMaterial(game) {
  return game.material?.length ? game.material.join(', ') : 'Aucun matériel';
}

export function formatTypes(game) {
  const types = Array.isArray(game.typeGame) ? game.typeGame : [game.typeGame];
  return types.filter(Boolean).join(', ');
}

/** Résumé lu par les lecteurs d'écran à la place de la carte entière. */
export function describeGame(game) {
  return `${game.title}. ${formatPlayers(game)}, ${formatDuration(game)}. ${game.description}`;
}

/**
 * Emoji affiché à la place de l'illustration quand celle-ci n'existe pas encore
 * (les cartes sont dessinées à la main, un jeu peut la précéder au catalogue).
 */
const ICONES_TYPE = [
  ['à traîtres', '🕵️'],
  ['coopératif', '🤝'],
  ['par équipe', '🏳️'],
  ['compétitif', '⚔️']
];

const ICONES_MATERIEL = [
  ['Cartes à jouer', '🃏'],
  ['Dé classique', '🎲'],
  ['Papier & stylo', '📝'],
  ['Téléphone', '📱'],
  ['Verres', '🥤']
];

export function iconeDeRepli(game) {
  const types = Array.isArray(game.typeGame) ? game.typeGame : [game.typeGame];

  const parType = ICONES_TYPE.find(([type]) => types.includes(type));
  if (parType) return parType[1];

  const parMateriel = ICONES_MATERIEL.find(([mat]) => game.material?.includes(mat));
  if (parMateriel) return parMateriel[1];

  return '🎲';
}
