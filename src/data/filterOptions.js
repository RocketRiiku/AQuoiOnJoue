import { gamesList } from './games';
import { plageDuree } from '../utils/formatGame';

/**
 * Les options de filtre sont déduites du catalogue plutôt que codées en dur.
 * Conséquence : une option ne peut jamais être proposée si aucun jeu n'y
 * répond (les listes figées affichaient par ex. « coopératif » ou trois types
 * de matériel qui renvoyaient systématiquement zéro résultat).
 */
const collect = (key) =>
  [...new Set(gamesList.flatMap((game) => game[key] ?? []))].sort((a, b) =>
    a.localeCompare(b, 'fr')
  );

export const MATERIAL_OPTIONS = collect('material');
export const TYPE_OPTIONS = collect('typeGame');

// Ordre pédagogique voulu, et non alphabétique.
const LEVEL_ORDER = ['Débutant', 'Intermédiaire', 'Expert'];
export const LEVEL_OPTIONS = LEVEL_ORDER.filter((level) =>
  gamesList.some((game) => game.level === level)
);

export const MIN_PLAYERS = Math.min(...gamesList.map((g) => g.minPlayers));
export const MAX_PLAYERS = Math.max(...gamesList.map((g) => g.maxPlayers));

// Les fils rouges se jouent en fond, sans durée propre : ils n'entrent pas dans
// les bornes du curseur, sans quoi celui-ci démarrerait à zéro.
const PLAGES = gamesList
  .map((game) => plageDuree(game, null))
  .filter((plage) => plage != null);

export const MIN_DURATION = Math.min(...PLAGES.map(([bas]) => bas));
export const MAX_DURATION = Math.max(...PLAGES.map(([, haut]) => haut));

// Bornes arrondies au pas de 5 pour un curseur lisible.
export const DURATION_STEP = 5;
export const DURATION_FLOOR =
  Math.floor(MIN_DURATION / DURATION_STEP) * DURATION_STEP;
export const DURATION_CEIL =
  Math.ceil(MAX_DURATION / DURATION_STEP) * DURATION_STEP;

export const HAS_ALCOHOL_GAMES = gamesList.some((g) => g.alcohol);

/**
 * État neutre des filtres. Partagé par App et Header : l'objet était auparavant
 * dupliqué dans les deux, avec le risque d'oublier un champ d'un côté.
 */
export const DEFAULT_FILTERS = Object.freeze({
  players: '',
  alcohol: '',
  minDuration: null,
  maxDuration: null,
  material: [],
  typeGame: '',
  level: ''
});

/**
 * Filtres « secondaires » : ceux repliés derrière « Plus de filtres ».
 * Joueurs et durée restent visibles en permanence, ce sont les deux critères
 * qui répondent à la question posée au moment de choisir un jeu.
 */
const acti = {
  players: (f) => Boolean(f.players),
  duration: (f) => f.minDuration != null || f.maxDuration != null,
  material: (f) => (f.material?.length ?? 0) > 0,
  typeGame: (f) => Boolean(f.typeGame),
  level: (f) => Boolean(f.level),
  alcohol: (f) => Boolean(f.alcohol)
};

const CLES_SECONDAIRES = ['material', 'typeGame', 'level', 'alcohol'];

/** Nombre de critères renseignés parmi les filtres repliés. */
export function compterFiltresSecondaires(filters) {
  return CLES_SECONDAIRES.filter((cle) => acti[cle](filters)).length;
}

/** Nombre total de critères renseignés — sert à n'afficher « Réinitialiser »
 *  que lorsqu'il a quelque chose à faire. */
export function compterFiltresActifs(filters) {
  return Object.values(acti).filter((estActif) => estActif(filters)).length;
}
