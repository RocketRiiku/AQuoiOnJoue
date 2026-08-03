import { useId, useState } from 'react';
import { Check, Plus, RotateCcw, X } from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
import Dialogue from '../Dialogue';

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
 * sous les réglages enterrerait le bouton « Remplir le pot ». La coquille du
 * dialogue vit dans `Dialogue.jsx`, partagée avec les règles du jeu.
 */
function DialoguePot({ mots, onNouveauTirage, onValider, onFermer }) {
  const [liste, setListe] = useState(mots);
  const [saisie, setSaisie] = useState('');
  const [erreur, setErreur] = useState(null);
  const idErreur = useId();

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
    <Dialogue
      titre="Les mots du pot"
      onFermer={onFermer}
      entete={
        <>
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
        </>
      }
      pied={
        <>
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
        </>
      }
    >
      <ul className="flex flex-wrap gap-2 list-none">
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
    </Dialogue>
  );
}

export default DialoguePot;
