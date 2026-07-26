/**
 * Action secondaire.
 *
 * Reprend le vocabulaire des pastilles de filtre — pastille claire à bord fin —
 * là où ces actions étaient de simples liens texte soulignés au survol, qui
 * juraient avec les boutons arrondis du reste du site.
 *
 * Reste volontairement en retrait : sur le programme d'une soirée, « Lancer la
 * soirée » doit rester la seule action qui saute aux yeux.
 */
function BoutonDiscret({ icon: Icone, onClick, children, ton = 'neutre', className = '' }) {
  const tons = {
    neutre: 'text-encre hover:border-orange hover:text-orange',
    attention: 'text-ardoise hover:border-brique hover:text-brique'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-encre/20 bg-white/70 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 ${tons[ton]} ${className}`}
    >
      {Icone && <Icone className="w-4 h-4" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default BoutonDiscret;
