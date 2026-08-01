/** Libellés partagés entre la carte, la fiche et le déroulé de la soirée. */

/**
 * Nombre de joueurs retenu pour les calculs de durée, ou `null` quand il n'est
 * pas renseigné.
 *
 * C'est la valeur du filtre « Joueurs », et elle vaut pour tout le site : une
 * durée de partie ne veut rien dire sans effectif, et l'effectif est le même
 * d'un jeu à l'autre — c'est le nombre de personnes assises autour de la table.
 */
export function nombreJoueurs(valeur) {
  const nombre = parseInt(valeur, 10);
  return Number.isFinite(nombre) && nombre > 0 ? nombre : null;
}

export function formatPlayers(game) {
  return game.minPlayers === game.maxPlayers
    ? `${game.minPlayers} joueurs`
    : `${game.minPlayers} à ${game.maxPlayers} joueurs`;
}

/** Fourchette d'effectifs où le jeu est vraiment au mieux. */
export function formatIdealPlayers(game) {
  return game.idealPlayersMin === game.idealPlayersMax
    ? `${game.idealPlayersMin} joueurs`
    : `${game.idealPlayersMin} à ${game.idealPlayersMax} joueurs`;
}

/** Vrai si l'effectif tombe dans la fourchette idéale du jeu. */
export function estRecommande(game, joueurs) {
  return (
    joueurs != null &&
    joueurs >= game.idealPlayersMin &&
    joueurs <= game.idealPlayersMax
  );
}

/**
 * Durée d'une partie, en minutes, pour un effectif donné.
 *
 * Une durée unique par jeu annonçait la même chose à 3 et à 8 joueurs. Le
 * catalogue porte donc une part fixe (règles, mise en place, manches jouées en
 * simultané) et une part par joueur.
 */
export function dureeJeu(game, joueurs) {
  return Math.round(game.durationBase + game.durationPerPlayer * joueurs);
}

/**
 * Fourchette de durée d'un jeu, en minutes — ou `null` pour un fil rouge, qui
 * se joue en fond et n'a pas de durée propre.
 *
 * Effectif connu : les deux bornes sont égales, on sait exactement quoi
 * annoncer. Sinon on encadre par la fourchette d'effectifs idéale : c'est ce
 * qu'on peut dire de plus juste, et c'est aussi ce que le filtre durée compare
 * — l'un ne doit pas promettre ce que l'autre exclut.
 */
export function plageDuree(game, joueurs) {
  if (game.filRouge) return null;
  if (joueurs != null) {
    const duree = dureeJeu(game, joueurs);
    return [duree, duree];
  }
  return [dureeJeu(game, game.idealPlayersMin), dureeJeu(game, game.idealPlayersMax)];
}

export function formatDuration(game, joueurs = null) {
  const plage = plageDuree(game, joueurs);
  if (!plage) return 'toute la soirée';
  const [bas, haut] = plage;
  return bas === haut ? `${bas} min` : `${bas}–${haut} min`;
}

/** Durée cumulée d'une soirée : les fils rouges n'y entrent pas. */
export function plageDureeSoiree(soiree, joueurs) {
  return soiree.reduce(
    (total, game) => {
      const plage = plageDuree(game, joueurs);
      return plage ? [total[0] + plage[0], total[1] + plage[1]] : total;
    },
    [0, 0]
  );
}

/** « 1 h 20 » se lit mieux que « 80 min ». */
export function formatDureeTotale(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${heures} h` : `${heures} h ${String(reste).padStart(2, '0')}`;
}

export function formatPlageTotale([bas, haut]) {
  return bas === haut
    ? formatDureeTotale(bas)
    : `${formatDureeTotale(bas)} à ${formatDureeTotale(haut)}`;
}

export function formatMaterial(game) {
  return game.material?.length ? game.material.join(', ') : 'Aucun matériel';
}

export function formatTypes(game) {
  const types = Array.isArray(game.typeGame) ? game.typeGame : [game.typeGame];
  return types.filter(Boolean).join(', ');
}

/**
 * Message pré-rempli du partage d'un jeu — le même sur toutes les fiches.
 *
 * Il doit se suffire à lui-même une fois collé dans une conversation : la
 * feuille de partage native ne laisse pas la place d'expliquer, et le
 * destinataire ne voit souvent que ce texte avant de décider s'il ouvre le lien.
 */
export function messagePartage(game, joueurs = null) {
  return `On joue à ${game.title} ? ${game.description} — ${formatPlayers(game)}, ${formatDuration(
    game,
    joueurs
  )}.`;
}

/** Même message, pour un programme de soirée entier. */
export function messagePartageSoiree(soiree, plageTotale) {
  const titres = soiree.map((game) => game.title).join(' · ');
  return `Le programme de la soirée : ${titres} — ${soiree.length} jeu${
    soiree.length > 1 ? 'x' : ''
  }, ${formatPlageTotale(plageTotale)} environ.`;
}

/**
 * Résumé lu par les lecteurs d'écran à la place de la carte entière.
 *
 * L'étoile de recommandation est décorative à l'écran : c'est ici qu'elle se
 * dit, sans quoi l'information serait réservée à ceux qui la voient.
 */
export function describeGame(game, joueurs = null) {
  const ideal = estRecommande(game, joueurs) ? ` Idéal à ${joueurs} joueurs.` : '';
  return `${game.title}.${ideal} ${formatPlayers(game)}, ${formatDuration(game, joueurs)}. ${
    game.description
  }`;
}
