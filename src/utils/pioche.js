/**
 * Tirer au sort, sans appartenir à un jeu.
 *
 * `melangeAleatoire` a été écrite dans `troisFoisRien.js`, faute de second
 * client à l'époque. Mélanger une liste n'est propre à aucun jeu : le défileur
 * s'en sert pour six autres, et chaque kit à venir en aura besoin. Elle
 * remonte donc ici plutôt que de faire dépendre la moitié du dossier `kit/`
 * d'un jeu en particulier.
 */

/** Mélange sans modifier le tableau reçu (Fisher-Yates). */
export function melangeAleatoire(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
