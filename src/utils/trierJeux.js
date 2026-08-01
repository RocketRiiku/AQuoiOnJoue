import { estRecommande, plageDuree } from './formatGame';

/**
 * Ordres de tri de la liste.
 *
 * `sort` est stable en JavaScript : à critère égal, l'ordre du catalogue tient.
 * C'est ce qui permet à chaque tri de n'exprimer qu'un seul départage, sans
 * avoir à rejouer les autres derrière.
 *
 * Le premier de la liste est celui par défaut. Il n'a d'effet visible qu'une
 * fois l'effectif saisi — sans quoi rien ne distingue un jeu conseillé — et
 * laisse alors le catalogue dans son ordre.
 */
export const TRIS = [
  { cle: 'conseilles', libelle: 'Conseillés d’abord' },
  { cle: 'alpha', libelle: 'A → Z' },
  { cle: 'duree', libelle: 'Les plus courts' },
  { cle: 'filRouge', libelle: 'Jeux de fond d’abord' }
];

export const TRI_PAR_DEFAUT = TRIS[0].cle;

/** Borne basse de la durée. Un fil rouge n'en a pas : il passe en dernier. */
const dureeMini = (game, joueurs) => plageDuree(game, joueurs)?.[0] ?? Infinity;

const COMPARATEURS = {
  conseilles: (joueurs) => (a, b) => estRecommande(b, joueurs) - estRecommande(a, joueurs),

  // `numeric` pour que « 30 secondes chrono » se range sur son nombre et non
  // caractère par caractère, `base` pour ignorer accents et casse.
  alpha: () => (a, b) =>
    a.title.localeCompare(b.title, 'fr', { numeric: true, sensitivity: 'base' }),

  duree: (joueurs) => (a, b) => dureeMini(a, joueurs) - dureeMini(b, joueurs),

  filRouge: () => (a, b) => Number(b.filRouge) - Number(a.filRouge)
};

/**
 * Trie une liste de jeux sans la modifier.
 *
 * Une clé inconnue — un état corrompu, un tri retiré depuis — rend la liste
 * telle quelle plutôt que de lever : l'ordre du catalogue est toujours une
 * réponse acceptable.
 */
export function trierJeux(jeux, tri, joueurs = null) {
  const comparateur = COMPARATEURS[tri];
  if (!comparateur) return jeux;
  return [...jeux].sort(comparateur(joueurs));
}
