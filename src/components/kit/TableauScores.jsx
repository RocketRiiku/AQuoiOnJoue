import { Minus, Plus, RotateCcw } from 'lucide-react';

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
 * **Elle ne connaît plus le jeu qu'elle affiche.** Elle importait `MANCHES` de
 * `troisFoisRien.js`, si bien qu'une brique annoncée comme commune était
 * clouée à un jeu : les colonnes sont devenues une donnée, et les totaux comme
 * la mise en tête sont calculés par l'appelant, qui seul sait ce que « gagner »
 * veut dire chez lui. Le découplage s'est fait contre un second client réel —
 * le classement des jeux qui ne comptent qu'un score par joueur, sans manche,
 * qui passe simplement `colonnes: []`.
 *
 * C'est la forme que réclame « scoring: manches » — un score unique par équipe
 * perdrait ce que chaque manche a rapporté, alors que c'est précisément ce que
 * la table commente à la fin. Sans colonnes, il ne reste que le nom et le
 * total : un classement.
 *
 * **Corrigeable.** Un pouce qui glisse sur « Trouvé » au milieu d'un tour est
 * l'accident le plus banal du genre, et rien n'est plus agaçant qu'un score
 * faux qu'on ne peut pas rattraper. Passer `onAjuster` fait apparaître les
 * commandes ; sans lui, la grille se lit sans se toucher.
 *
 * Un vrai `<table>` : ce sont des données à deux entrées, et les lecteurs
 * d'écran savent les parcourir dès lors que les en-têtes sont déclarés.
 *
 * @param lignes        `[{ nom, cases, total, enTete, sortie }]` — `cases` suit
 *                      l'ordre de `colonnes`, `enTete` désigne qui mène,
 *                      `sortie` un joueur éliminé (barré, mais gardé à l'écran)
 * @param colonnes      `[{ cle, libelle, libelleLong }]` — vide pour un simple
 *                      classement. `libelle` est l'abrégé affiché (« M1 »),
 *                      `libelleLong` ce qu'annonce le lecteur d'écran
 * @param colonneActive index de la colonne en cours, ou `null` s'il n'y en a
 *                      plus — en fin de partie, aucune manche ne ressort
 * @param legende       le `<caption>`, lu par les lecteurs d'écran seuls
 */
function TableauScores({
  lignes,
  colonnes = [],
  colonneActive = null,
  legende = 'Scores',
  onAjuster,
  onReinitialiser
}) {
  const corrigeable = Boolean(onAjuster);

  return (
    <table className="w-full text-left border-collapse">
      <caption className="sr-only">{legende}</caption>
      <thead>
        <tr className="text-xs uppercase tracking-wide text-ardoise/70">
          <th scope="col" className="font-normal py-1">
            {colonnes.length > 0 ? 'Équipe' : 'Joueur'}
          </th>
          {colonnes.map((colonne) => (
            <th key={colonne.cle} scope="col" className="font-normal py-1 text-center w-10">
              <span aria-hidden="true">{colonne.libelle}</span>
              <span className="sr-only">{colonne.libelleLong ?? colonne.libelle}</span>
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
        {lignes.map((ligne, i) => (
          <tr key={ligne.nom} className="border-t border-encre/10">
            <th
              scope="row"
              /**
               * L'état s'ajoute au nom accessible, et non dans un `<span>`
               * masqué : l'algorithme de nom accessible insère une espace entre
               * deux nœuds, ce qui donnait « Équipe 1 , en tête ». Un éliminé
               * reste par ailleurs affiché — chez Qui rit sort, il rejoint le
               * public et continue à saboter les survivants.
               */
              aria-label={
                ligne.sortie
                  ? `${ligne.nom}, éliminé`
                  : ligne.enTete
                    ? `${ligne.nom}, en tête`
                    : undefined
              }
              // Le nom ne se coupe pas en deux : avec les trois commandes de
              // correction, la colonne devenait trop étroite sur téléphone et
              // « Équipe 1 » passait à la ligne. Le tableau défile plutôt.
              className={`font-titre text-lg py-2 pr-3 whitespace-nowrap ${
                ligne.enTete ? 'text-brique' : 'text-encre'
              } ${ligne.sortie ? 'line-through decoration-2 text-ardoise/50' : ''}`}
            >
              {ligne.nom}
            </th>
            {(ligne.cases ?? []).map((points, m) => (
              <td
                key={colonnes[m]?.cle ?? m}
                className={`text-center tabular-nums py-2 ${
                  m === colonneActive ? 'text-encre' : 'text-ardoise/60'
                }`}
              >
                {points}
              </td>
            ))}
            <td className="text-right font-titre text-2xl tabular-nums py-2 text-encre">
              {ligne.total}
            </td>
            {corrigeable && (
              <td className="py-1">
                <div className="flex items-center justify-end">
                  <Commande
                    label={`Retirer un point à ${ligne.nom}`}
                    icone={Minus}
                    disabled={ligne.retraitPossible === false}
                    onClick={() => onAjuster(i, -1)}
                  />
                  <Commande
                    label={`Ajouter un point à ${ligne.nom}`}
                    icone={Plus}
                    onClick={() => onAjuster(i, 1)}
                  />
                  <Commande
                    label={`Remettre ${ligne.nom} à zéro`}
                    icone={RotateCcw}
                    disabled={ligne.total === 0}
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
