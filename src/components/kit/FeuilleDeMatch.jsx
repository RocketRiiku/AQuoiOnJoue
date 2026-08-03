import { useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';

/**
 * Durée pendant laquelle « Annuler » reste offert après un geste.
 *
 * La même que celle d'`EcranTour`, et elles doivent le rester : c'est une règle
 * d'interaction du site, pas un réglage de cet écran (docs/boutons.md).
 *
 * Comptée en `setInterval` comme là-bas, et non en `setTimeout` : les tests ne
 * simulent que les minuteries dont le kit a besoin, et simuler `setTimeout`
 * interbloque les utilitaires asynchrones de Testing Library. Le battement qui
 * se répète ne coûte rien — il repose un état déjà faux.
 */
const FENETRE_ANNULATION = 2500;

/**
 * La feuille de match vive : une ligne par joueur, et **la ligne est la cible**.
 *
 * C'est le geste du jeu, répété cent fois dans la soirée — pas une correction
 * d'après-coup. Il ne relève donc pas du système de boutons mais de la même
 * famille que la carte du catalogue et que les zones de réponse d'`EcranTour` :
 * une **surface de jeu**, large, atteignable au pouce sans viser
 * (cf. docs/boutons.md). Le trio `− + ↺` de `TableauScores` reste ce qu'il est,
 * une correction, et vit sur les écrans de bilan.
 *
 * Les jeux qui résolvent un tour d'un coup — un conteur, un son imité, un duel
 * — n'utilisent pas cet écran : chez eux, la table ne désigne pas un coupable
 * au vol, elle valide une manche. Ils affichent `TableauScores` et leur panneau
 * de résolution.
 *
 * @param seuil        nombre d'avertissements avant la sortie, ou `null`
 * @param libelleGeste ce que la tape veut dire (« a souri »), pour l'annonce
 * @param unite        « point » ou « avertissement », déduit de `scoring`
 */
function FeuilleDeMatch({
  etat,
  seuil = null,
  libelleGeste,
  unite = 'point',
  onMarquer,
  onAnnuler
}) {
  const [annulationOfferte, setAnnulationOfferte] = useState(false);

  // « Annuler » ne reste pas à demeure : il n'a de sens que dans les secondes
  // qui suivent le geste. `dernier` change d'identité à chaque tape, y compris
  // deux fois de suite sur la même ligne, ce qui réarme la fenêtre.
  useEffect(() => {
    if (!etat.dernier) {
      setAnnulationOfferte(false);
      return undefined;
    }
    setAnnulationOfferte(true);
    const battement = setInterval(() => setAnnulationOfferte(false), FENETRE_ANNULATION);
    return () => clearInterval(battement);
  }, [etat.dernier]);

  return (
    <div>
      <ul className="flex flex-col gap-2 list-none">
        {etat.joueurs.map((nom, i) => {
          const score = etat.scores[i];
          const sorti = etat.sortis[i];
          return (
            <li key={`${nom}-${i}`}>
              <button
                type="button"
                disabled={sorti}
                onClick={() => onMarquer(i)}
                // L'annonce dit le geste *et* l'état : au doigt on voit la
                // ligne, au lecteur d'écran il faut les deux.
                //
                // Ponctué à la virgule et non au tiret cadratin : la virgule se
                // prononce en pause, le tiret est lu littéralement par certains
                // lecteurs d'écran et ignoré par d'autres.
                aria-label={
                  sorti
                    ? `${nom}, éliminé`
                    : `${nom} ${libelleGeste}, ${score} ${unite}${score > 1 ? 's' : ''}${
                        seuil !== null ? ` sur ${seuil}` : ''
                      }`
                }
                className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                  sorti
                    ? 'bg-ardoise/10 cursor-not-allowed'
                    : 'bg-paille hover:bg-paille/70 active:bg-white/80'
                }`}
              >
                <span
                  className={`font-titre text-xl flex-1 min-w-0 truncate ${
                    sorti ? 'line-through decoration-2 text-ardoise/50' : 'text-encre'
                  }`}
                >
                  {nom}
                </span>

                {/* Les avertissements se comptent d'un coup d'œil quand ils sont
                    deux ou trois : des pastilles disent « il lui en reste un »
                    mieux qu'un chiffre à comparer au seuil de tête. */}
                {seuil !== null ? (
                  <span className="flex items-center gap-1.5" aria-hidden="true">
                    {Array.from({ length: seuil }, (_, cran) => (
                      <span
                        key={cran}
                        className={`w-3.5 h-3.5 rounded-full border-2 ${
                          cran < score ? 'bg-brique border-brique' : 'border-encre/30'
                        }`}
                      />
                    ))}
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="font-titre text-3xl tabular-nums text-encre"
                  >
                    {score}
                  </span>
                )}

                {sorti && (
                  <span className="font-titre text-xs uppercase tracking-wide text-ardoise/60">
                    sorti
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Les lignes sont larges, collées et se ressemblent : viser la mauvaise
          est l'accident prévisible du genre, et un point volé sans retour en
          arrière fausse toute la partie. La hauteur est réservée en dur, sans
          quoi la liste sauterait à chaque apparition du lien. */}
      <div className="h-10 mt-3 flex justify-center items-start">
        {annulationOfferte && (
          <button
            type="button"
            onClick={onAnnuler}
            className="anim-entree font-texte text-sm text-ardoise underline decoration-dotted underline-offset-4 hover:text-brique inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
          >
            <Undo2 className="w-4 h-4" aria-hidden="true" />
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

export default FeuilleDeMatch;
