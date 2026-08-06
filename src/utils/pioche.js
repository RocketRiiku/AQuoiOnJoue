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

/**
 * Comment s'appelle ce qu'on tire, d'après le `type` de la ligne LancerJeu.
 *
 * « Question suivante » plutôt que « Suivant » : le bouton dit ce qu'il va
 * tirer, comme le déclencheur de tri dit l'ordre en cours (docs/boutons.md). Le
 * genre est porté ici parce qu'aucun libellé ne le laisse deviner.
 *
 * Écrit pour le défileur, remonté ici quand le quiz d'animateur en a eu besoin
 * à son tour — même chemin que `melangeAleatoire`. Ce n'est pas la mécanique
 * d'une famille, c'est le vocabulaire de l'onglet LancerJeu, et tout kit qui
 * pioche le partage.
 */
const NOMS = {
  question: ['Question', 'f'],
  proposition: ['Proposition', 'f'],
  dilemme: ['Dilemme', 'm'],
  'phrase de départ': ['Phrase', 'f'],
  'sujet de débat': ['Sujet', 'm'],
  'morceau à traduire': ['Morceau', 'm'],
  'titre québécois': ['Titre', 'm'],
  'série québécoise': ['Titre', 'm'],
  'pitch falsifié': ['Résumé', 'm'],
  réplique: ['Réplique', 'f'],
  énigme: ['Énigme', 'f']
};

/** Un type inconnu ne casse rien : il retombe sur un nom neutre. */
const NEUTRE = ['Carte', 'f'];

export function libelles(type) {
  const [nom, genre] = NOMS[type] ?? NEUTRE;
  const e = genre === 'f' ? 'e' : '';
  return {
    nom,
    suivante: `${nom} suivant${e}`,
    precedente: `${nom} précédent${e}`,
    // Pour les décomptes : « 3 questions restantes ».
    pluriel: `${nom.toLowerCase()}s`
  };
}
