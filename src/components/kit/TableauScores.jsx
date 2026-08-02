import { Minus, Plus, RotateCcw } from 'lucide-react';
import { MANCHES, totalEquipe, vainqueurs } from '../../utils/troisFoisRien';

/**
 * Micro-commande d'une ligne de score.
 *
 * Même famille que les contrôles de ligne du programme de soirée : elles se
 * répètent par équipe et ne sont pas des actions de panneau, elles ne passent
 * donc pas par `Bouton` (cf. docs/boutons.md). 40 px de côté : sous le seuil
 * confortable au pouce, on tape la mauvaise équipe.
 */
function Commande({ label, icone: Icone, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-encre hover:text-orange hover:bg-white/70 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-encre transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
    >
      <Icone className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}

/**
 * La grille des scores : une colonne par manche, plus le total.
 *
 * C'est la forme que réclame « scoring: manches » — un score unique par équipe
 * perdrait ce que chaque manche a rapporté, alors que c'est précisément ce que
 * la table commente à la fin.
 *
 * **Corrigeable.** Un pouce qui glisse sur « Trouvé » au milieu d'un tour est
 * l'accident le plus banal du genre, et rien n'est plus agaçant qu'un score
 * faux qu'on ne peut pas rattraper. Les deux commandes portent sur la manche
 * en cours ; la remise à zéro, sur toute la ligne.
 *
 * Un vrai `<table>` : ce sont des données à deux entrées, et les lecteurs
 * d'écran savent les parcourir dès lors que les en-têtes sont déclarés.
 */
function TableauScores({ etat, montrerVainqueur = false, onAjuster, onReinitialiser }) {
  const enTete = montrerVainqueur ? vainqueurs(etat) : [];
  // La manche en cours ressort du reste — sauf à la fin, où il n'y en a plus.
  const mancheEnCours = montrerVainqueur ? null : etat.manche;
  const corrigeable = Boolean(onAjuster);

  return (
    <table className="w-full text-left border-collapse">
      <caption className="sr-only">Scores par équipe et par manche</caption>
      <thead>
        <tr className="text-xs uppercase tracking-wide text-ardoise/70">
          <th scope="col" className="font-normal py-1">
            Équipe
          </th>
          {MANCHES.map((manche, i) => (
            <th key={manche.titre} scope="col" className="font-normal py-1 text-center w-10">
              <span aria-hidden="true">M{i + 1}</span>
              <span className="sr-only">
                Manche {i + 1} : {manche.titre}
              </span>
            </th>
          ))}
          <th scope="col" className="font-normal py-1 text-right w-14">
            Total
          </th>
          {corrigeable && (
            <th scope="col" className="w-32">
              <span className="sr-only">Corriger</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {etat.equipes.map((equipe, i) => (
          <tr key={equipe} className="border-t border-encre/10">
            <th
              scope="row"
              // Le nom ne se coupe pas en deux : avec les trois commandes de
              // correction, la colonne devenait trop étroite sur téléphone et
              // « Équipe 1 » passait à la ligne. Le tableau défile plutôt.
              className={`font-titre text-lg py-2 pr-3 whitespace-nowrap ${
                enTete.includes(i) ? 'text-brique' : 'text-encre'
              }`}
            >
              {equipe}
              {enTete.includes(i) && <span className="sr-only"> — en tête</span>}
            </th>
            {etat.scores[i].map((points, m) => (
              <td
                key={MANCHES[m].titre}
                className={`text-center tabular-nums py-2 ${
                  m === mancheEnCours ? 'text-encre' : 'text-ardoise/60'
                }`}
              >
                {points}
              </td>
            ))}
            <td className="text-right font-titre text-2xl tabular-nums py-2 text-encre">
              {totalEquipe(etat, i)}
            </td>
            {corrigeable && (
              <td className="py-1">
                <div className="flex items-center justify-end">
                  <Commande
                    label={`Retirer un point à ${equipe}`}
                    icone={Minus}
                    disabled={etat.scores[i][etat.manche] === 0}
                    onClick={() => onAjuster(i, -1)}
                  />
                  <Commande
                    label={`Ajouter un point à ${equipe}`}
                    icone={Plus}
                    onClick={() => onAjuster(i, 1)}
                  />
                  <Commande
                    label={`Remettre ${equipe} à zéro`}
                    icone={RotateCcw}
                    disabled={totalEquipe(etat, i) === 0}
                    onClick={() => onReinitialiser(i)}
                  />
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableauScores;
