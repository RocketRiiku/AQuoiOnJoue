import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, Plus, RotateCcw, X } from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';

/** En dessous, une manche se vide avant d'avoir commencé. */
const MINIMUM = 4;

/**
 * Édition du pot : les mots qui seront joués, un par pastille.
 *
 * **Des pastilles**, parce que c'est le motif établi pour un ensemble de
 * chaînes courtes qu'on ajoute et retire à l'unité : chacune porte sa propre
 * croix, elles passent à la ligne quand elles sont nombreuses, et la cible de
 * suppression reste au-dessus du seuil confortable au doigt
 * ([Material 3](https://m3.material.io/components/chips/guidelines)).
 *
 * **Dans une modale**, et non déplié sur place : quarante mots à relire et à
 * corriger demandent l'écran entier, et c'est précisément le cas où NN/G
 * recommande de séparer la tâche du reste — une liste de cette taille dépliée
 * sous les réglages enterrerait le bouton « Remplir le pot » à mille pixels.
 *
 * Modale écrite à la main plutôt que `<dialog>` natif : jsdom n'implémente pas
 * `showModal`, et un dialogue que la suite de tests ne peut pas ouvrir n'est
 * pas testable. Le piège à focus tient en quinze lignes — c'est ce qui sépare
 * un vrai dialogue d'un voile décoratif dont la tabulation s'échappe.
 */
function DialoguePot({ mots, onNouveauTirage, onValider, onFermer }) {
  const [liste, setListe] = useState(mots);
  const [saisie, setSaisie] = useState('');
  const [erreur, setErreur] = useState(null);
  const panneauRef = useRef(null);
  const idErreur = useId();

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

  const ajouter = (evenement) => {
    evenement.preventDefault();
    const mot = saisie.trim();
    if (!mot) return;
    if (liste.some((m) => m.toLowerCase() === mot.toLowerCase())) {
      setErreur(`« ${mot} » est déjà dans le pot.`);
      return;
    }
    // En tête : on veut voir ce qu'on vient d'écrire, pas le chercher au bout
    // d'une liste de quarante.
    setListe((actuels) => [mot, ...actuels]);
    setSaisie('');
    setErreur(null);
  };

  const retirer = (index) => setListe((actuels) => actuels.filter((_, i) => i !== index));

  const tropCourt = liste.length < MINIMUM;

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
        aria-labelledby="titre-pot"
        tabIndex={-1}
        className="bg-creme rounded-2xl shadow-xl w-full max-w-2xl max-h-[85svh] flex flex-col focus:outline-none"
      >
      <div className="p-5 sm:p-6 border-b border-encre/10">
        <h2 id="titre-pot" className="font-titre text-2xl text-brique">
          Les mots du pot
        </h2>
        <p className="text-ardoise/80 text-sm mt-0.5" aria-live="polite">
          {liste.length} mot{liste.length > 1 ? 's' : ''}
          {tropCourt && ` — il en faut au moins ${MINIMUM}`}
        </p>

        <form onSubmit={ajouter} className="flex gap-2 mt-3">
          <input
            type="text"
            value={saisie}
            maxLength={40}
            onChange={(e) => {
              setSaisie(e.target.value);
              setErreur(null);
            }}
            aria-label="Ajouter un mot"
            aria-describedby={erreur ? idErreur : undefined}
            placeholder="Ajouter un mot…"
            className="flex-1 min-w-0 rounded-full bg-white/80 px-4 py-2 text-encre placeholder:text-ardoise/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          />
          <Bouton variante="discret" icone={Plus} type="submit" disabled={!saisie.trim()}>
            Ajouter
          </Bouton>
        </form>
        {erreur && (
          <p id={idErreur} role="alert" className="text-brique text-sm mt-2">
            {erreur}
          </p>
        )}
      </div>

      <ul className="flex flex-wrap gap-2 p-5 sm:p-6 overflow-y-auto flex-1 list-none">
        {liste.map((mot, index) => (
          <li key={mot}>
            <span className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-paille border border-encre/15 text-encre text-sm">
              {mot}
              <button
                type="button"
                onClick={() => retirer(index)}
                aria-label={`Retirer ${mot} du pot`}
                className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-ardoise/70 hover:text-brique hover:bg-white/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <div className="p-5 sm:p-6 border-t border-encre/10">
        <BarreActions className="mt-0">
          <Bouton
            variante="principal"
            icone={Check}
            disabled={tropCourt}
            onClick={() => onValider(liste)}
          >
            Garder ces mots
          </Bouton>
          <Bouton variante="secondaire" icone={X} onClick={onFermer}>
            Annuler
          </Bouton>
        </BarreActions>
        <BarreActionsSecondaire>
          <Bouton
            variante="discret"
            icone={RotateCcw}
            // Une fonction, et non une liste figée : le parent ne se rend pas
            // pendant que la modale est ouverte, si bien qu'une liste passée en
            // prop restait identique d'un clic à l'autre — le bouton semblait
            // ne marcher qu'une fois.
            onClick={() => {
              setListe(onNouveauTirage());
              setErreur(null);
            }}
          >
            Retirer un nouveau pot
          </Bouton>
        </BarreActionsSecondaire>
      </div>
      </div>
    </div>
  );
}

export default DialoguePot;
