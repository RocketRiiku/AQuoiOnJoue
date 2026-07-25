/**
 * Infobulle au survol et au focus clavier, pour les boutons réduits à une icône.
 *
 * En CSS pur : l'infobulle native (`title`) met une seconde à apparaître, ne
 * suit pas la charte et ne se déclenche pas au clavier. Ici elle apparaît aussi
 * sur `focus-visible`, donc à la tabulation.
 *
 * Elle est `aria-hidden` : le nom accessible du bouton porte déjà la même
 * information, inutile de la faire annoncer deux fois.
 */
function Infobulle({ texte, children, className = '' }) {
  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-full right-0 mt-1.5 z-40 whitespace-nowrap rounded-md bg-encre px-2 py-1 text-xs text-creme opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {texte}
      </span>
    </span>
  );
}

export default Infobulle;
