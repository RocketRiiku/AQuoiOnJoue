import { Check } from 'lucide-react';

/**
 * Brique : la ligne d'un joueur, pleine largeur, entièrement cliquable.
 *
 * **Ce n'est pas une case à cocher.** Une pastille de filtre fait 28 px de haut
 * et se vise à l'œil ; ici on désigne quelqu'un autour d'une table, souvent
 * debout, parfois un verre à la main. La ligne occupe donc toute la largeur et
 * une cinquantaine de pixels de haut, comme les zones de réponse d'`EcranTour` —
 * une surface de jeu, pas une commande de panneau (docs/boutons.md).
 *
 * Deux usages, un seul composant : la feuille de match, où taper marque un
 * point, et le vote, où taper désigne. Le second n'est que le premier avec un
 * état sélectionné, et les dessiner séparément aurait fait deux cibles de
 * tailles différentes pour le même geste.
 *
 * @param selectionnable la ligne porte une coche, et `actif` dit son état
 * @param actif          coché : le vote s'en sert, la feuille de match jamais
 * @param sortie         éliminé : barré, inactif, mais gardé à l'écran
 * @param aDroite        ce qui se lit au bout de la ligne (score, avertissements)
 */
function LigneJoueur({
  nom,
  nomAccessible,
  selectionnable = false,
  actif = false,
  sortie = false,
  aDroite,
  onClick
}) {
  return (
    <button
      type="button"
      disabled={sortie}
      onClick={onClick}
      aria-pressed={selectionnable && !sortie ? actif : undefined}
      aria-label={nomAccessible}
      // Les deux anneaux sont **intérieurs** : la liste du vote défile dans sa
      // propre zone, et un anneau dessiné hors de la boîte s'y faisait couper
      // net sur la ligne sélectionnée comme au focus clavier.
      className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange ${
        sortie
          ? 'bg-ardoise/10 cursor-not-allowed'
          : actif
            ? 'bg-paille ring-2 ring-inset ring-orange'
            : 'bg-paille hover:bg-paille/70 active:bg-white/80'
      }`}
    >
      {/* La coche réserve sa place vide : sans elle, la ligne se décalerait de
          vingt pixels au premier choix. */}
      {selectionnable && (
        <span
          aria-hidden="true"
          className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
            actif ? 'bg-orange border-orange text-creme' : 'border-encre/30'
          }`}
        >
          {actif && <Check className="w-4 h-4" strokeWidth={3} />}
        </span>
      )}

      <span
        className={`font-titre text-xl flex-1 min-w-0 truncate ${
          sortie ? 'line-through decoration-2 text-ardoise/50' : 'text-encre'
        }`}
      >
        {nom}
      </span>

      {aDroite}

      {sortie && (
        <span className="font-titre text-xs uppercase tracking-wide text-ardoise/60">
          sorti
        </span>
      )}
    </button>
  );
}

export default LigneJoueur;
