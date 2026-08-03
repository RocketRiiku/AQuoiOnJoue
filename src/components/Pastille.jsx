/**
 * Pastille à cocher, avec sa case.
 *
 * Ce n'est pas une action mais un **contrôle de formulaire** : elle porte un
 * état sélectionné, pas une commande. Elle ne relève donc pas du système de
 * boutons (cf. docs/boutons.md), et vit ici parce que trois vues s'en servent —
 * les filtres du bandeau, le choix du tri, et la désignation des joueurs qui
 * marquent dans la feuille de match.
 *
 * Les filtres secondaires étaient présentés comme quatre cartes de cases à
 * cocher, soit près de 400 px occupés en permanence. Les pastilles disent la
 * même chose en quatre lignes et absorbent les nouvelles options du catalogue
 * en passant simplement à la ligne.
 *
 * La petite case conserve le geste d'origine — cocher d'une croix sur une
 * feuille — en réutilisant la croix dessinée à la main (/Croix.png). Une fois
 * cochée, la pastille passe sur le fond paille des cartes en papier plutôt que
 * sur un aplat plein, pour rester dans la même métaphore.
 *
 * `aria-pressed` plutôt qu'un vrai <input> : un bouton bascule se décoche
 * naturellement d'un second clic, sans le contournement qu'imposaient les
 * boutons radio.
 */
function Pastille({ actif, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 ${
        actif
          ? 'bg-paille border-orange text-encre'
          : 'bg-white/70 border-encre/20 text-encre hover:border-orange hover:text-orange'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-4 h-4 shrink-0 rounded-[3px] border-2 border-encre bg-white/80 ${
          actif ? "bg-[url('/Croix.png')] bg-contain bg-center bg-no-repeat" : ''
        }`}
      />
      {children}
    </button>
  );
}

export default Pastille;
