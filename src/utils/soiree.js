/**
 * Un programme de soirée se lit en deux blocs.
 *
 * Les fils rouges ne s'ordonnancent pas : ils courent en fond du début à la fin
 * et n'ont pas de place dans la file d'attente. Les mêler au programme laissait
 * croire l'inverse — on pouvait les monter, les descendre, et leur durée
 * manquait au total sans qu'on comprenne pourquoi.
 *
 * `useNavigation` maintient la sélection dans cet ordre (fils rouges en
 * dernier), si bien que l'index d'un jeu du programme y est aussi sa place
 * affichée : c'est ce dont dépendent les boutons monter / descendre.
 */
export function partitionnerSoiree(soiree) {
  return {
    programme: soiree.filter((game) => !game.filRouge),
    filsRouges: soiree.filter((game) => game.filRouge)
  };
}

/**
 * Ordre du déroulé : **les fils rouges d'abord**.
 *
 * On les lance en début de soirée — c'est le moment où l'on bannit les mots ou
 * distribue les missions — et ils tournent ensuite pendant tout le reste.
 */
export function ordreDeroule(soiree) {
  const { programme, filsRouges } = partitionnerSoiree(soiree);
  return [...filsRouges, ...programme];
}
