import { kitJouable } from '../../utils/kit';
import KitTroisFoisRien from './KitTroisFoisRien';

/**
 * Les kits installés, par slug.
 *
 * Un kit n'est pas un formulaire générique : « Trois fois rien » rejoue les
 * mêmes mots trois fois de suite, Undercover distribue des rôles, Petit Bac
 * tire deux pioches à la fois. Les briques sont communes — chrono, tableau de
 * scores, pastilles — mais l'enchaînement appartient au jeu. D'où ce registre,
 * plutôt qu'un moteur unique qu'on plierait à cinquante cas particuliers.
 *
 * Il grandira par familles : la plupart des jeux se ramènent à « tirer, montrer,
 * compter » et pourront partager un même orchestrateur. Celui-ci est l'exception
 * qui justifie de garder la porte ouverte.
 */
const KITS = {
  'trois-fois-rien': KitTroisFoisRien
};

export const kitDe = (game) => KITS[game.slug] ?? null;

/**
 * Deux conditions, et deux sources distinctes : le catalogue déclare un kit
 * **et** l'écran correspondant existe. La seconde n'est que transitoire — le
 * temps que les cinquante jeux soient écrits — mais sans elle le bouton
 * apparaîtrait dès l'import des données, avant l'interface qui va avec.
 */
export const kitDisponible = (game) => kitJouable(game) && Boolean(kitDe(game));
