import { kitJouable } from '../../utils/kit';
import KitBlessureCritique from './KitBlessureCritique';
import KitDefileur from './KitDefileur';
import KitFeuilleDeMatch from './KitFeuilleDeMatch';
import KitQuizAnimateur from './KitQuizAnimateur';
import KitTroisFoisRien from './KitTroisFoisRien';

/**
 * Les kits installés, par slug.
 *
 * Un kit n'est pas un formulaire générique : « Trois fois rien » rejoue les
 * mêmes mots trois fois de suite, Undercover distribue des rôles, Petit Bac
 * tire deux pioches à la fois. Les briques sont communes — carte, chrono,
 * tableau de scores, pastilles — mais l'enchaînement appartient au jeu. D'où ce
 * registre, plutôt qu'un moteur unique qu'on plierait à cinquante cas
 * particuliers.
 *
 * **Il grandit par familles, pas par jeux.** Six entrées pointent ici vers le
 * même `KitDefileur` : ces jeux ne demandent au téléphone qu'une carte à lire à
 * voix haute, et tout ce qui les distingue — le mot du bouton de tirage, la
 * présence d'un chrono — se déduit du catalogue. Ajouter un septième jeu de
 * cette forme ne coûterait qu'une ligne. Cinq autres pointent vers
 * `KitFeuilleDeMatch` : celles-là ne tirent rien du tout, elles comptent. Six
 * enfin vers `KitQuizAnimateur`, qui fait les deux — tirer, révéler, compter.
 *
 * La blessure critique est de la même famille que le défileur et garde pourtant
 * son écran : son tirage est un jet de dé, donc **avec remise**. Le défileur,
 * lui, parcourt sa pile sans répétition. Une option de plus sur un composant
 * partagé pour une mécanique aussi différente aurait coûté plus cher que vingt
 * lignes à part.
 *
 * Rangé dans l'ordre du catalogue, celui de `games.js`.
 */
const KITS = {
  'liars-club': KitFeuilleDeMatch,
  'le-joker': KitDefileur,
  'sorry-mon-french': KitQuizAnimateur,
  'lost-in-translation': KitQuizAnimateur,
  'le-fitch': KitQuizAnimateur,
  'le-souffleur': KitQuizAnimateur,
  'soyez-logique': KitQuizAnimateur,
  'le-juste-chiffre': KitQuizAnimateur,
  'avez-vous-confiance': KitFeuilleDeMatch,
  'la-blessure-critique': KitBlessureCritique,
  'oui-ou-non': KitDefileur,
  'trois-fois-rien': KitTroisFoisRien,
  'tu-preferes': KitDefileur,
  'du-coq-a-l-ane': KitDefileur,
  'qui-de-nous': KitDefileur,
  'qui-rit-sort': KitFeuilleDeMatch,
  tudum: KitFeuilleDeMatch,
  'sang-bleu': KitDefileur,
  'sur-parole': KitFeuilleDeMatch
};

export const kitDe = (game) => KITS[game.slug] ?? null;

/**
 * Deux conditions, et deux sources distinctes : le catalogue déclare un kit
 * **et** l'écran correspondant existe. La seconde n'est que transitoire — le
 * temps que les cinquante jeux soient écrits — mais sans elle le bouton
 * apparaîtrait dès l'import des données, avant l'interface qui va avec.
 */
export const kitDisponible = (game) => kitJouable(game) && Boolean(kitDe(game));
