import { useCallback, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Coquille de dialogue modale : le voile, le panneau, le piège à focus.
 *
 * Écrite à la main plutôt qu'avec `<dialog>` natif : jsdom n'implémente pas
 * `showModal`, et un dialogue que la suite de tests ne peut pas ouvrir n'est pas
 * testable. Le piège tient en quinze lignes — c'est ce qui sépare un vrai
 * dialogue d'un voile décoratif dont la tabulation s'échappe.
 *
 * Sortie de `DialoguePot` à l'arrivée d'un second client, les règles du jeu
 * qu'on rouvre en cours de partie. Les quinze lignes de piège à focus n'ont pas
 * à exister deux fois : elles s'oublient à moitié la seconde.
 *
 * La croix en coin ne prend aucun niveau d'emphase : fermer un panneau est une
 * convention universelle (cf. docs/boutons.md).
 *
 * @param titre   l'en-tête, qui nomme aussi le dialogue aux lecteurs d'écran
 * @param entete  contenu supplémentaire sous le titre, dans la zone fixe
 * @param pied    la barre d'actions, en bas, hors de la zone défilante
 */
function Dialogue({ titre, entete, pied, children, onFermer }) {
  const panneauRef = useRef(null);
  const idTitre = useId();

  const focusables = useCallback(
    () =>
      [
        ...(panneauRef.current?.querySelectorAll(
          'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])'
        ) ?? [])
      ].filter((element) => element.offsetParent !== null || element.tagName === 'INPUT'),
    []
  );

  // Le focus entre à l'ouverture et revient d'où il venait à la fermeture :
  // sans cela, refermer laisse le clavier au début de la page.
  useEffect(() => {
    const precedent = document.activeElement;
    panneauRef.current?.focus();
    return () => precedent?.focus?.();
  }, []);

  useEffect(() => {
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') {
        onFermer();
        return;
      }
      if (evenement.key !== 'Tab') return;
      const cibles = focusables();
      if (cibles.length === 0) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      // La tabulation boucle à l'intérieur : c'est ce qui fait la modalité.
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer, focusables]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-encre/50 p-3"
      onClick={(evenement) => {
        if (evenement.target === evenement.currentTarget) onFermer();
      }}
    >
      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitre}
        tabIndex={-1}
        className="bg-creme rounded-2xl shadow-xl w-full max-w-2xl max-h-[85svh] flex flex-col focus:outline-none"
      >
        <div className="p-5 sm:p-6 border-b border-encre/10">
          <div className="flex items-start gap-3">
            <h2 id={idTitre} className="font-titre text-2xl text-brique flex-1 min-w-0">
              {titre}
            </h2>
            <button
              type="button"
              onClick={onFermer}
              aria-label="Fermer"
              className="w-9 h-9 shrink-0 -mt-1 -mr-1 rounded-full flex items-center justify-center text-ardoise/70 hover:text-brique hover:bg-white/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          {entete}
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>

        {pied && <div className="p-5 sm:p-6 border-t border-encre/10">{pied}</div>}
      </div>
    </div>
  );
}

export default Dialogue;
