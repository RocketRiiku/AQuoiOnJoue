import { useEffect, useId, useMemo, useReducer, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Dices,
  History,
  Trash2
} from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
import CarteTiree from './CarteTiree';
import { contenuDuJeu } from '../../data/lancerJeu';
import { animationsReduites } from '../../utils/mouvement';
import {
  effetDe,
  etatInitial,
  FACES,
  lancer,
  reducteur
} from '../../utils/blessureCritique';

/**
 * Le roulement : douze faces qui défilent à soixante-dix millisecondes.
 *
 * Compté en battements plutôt qu'arrêté par un `setTimeout` : simuler les
 * minuteries d'un test fige aussi l'ordonnanceur de React s'il faut lui prendre
 * `setTimeout`, dont il se sert — le même piège que le décompte d'entrée
 * d'`EcranTour`. Un seul intervalle, et rien d'autre à simuler.
 */
const BATTEMENTS = 12;
const PAS = 70;

/**
 * Le d20 lui-même : l'icosaèdre vu de face, la valeur dans sa face centrale.
 *
 * Un carré arrondi aurait fait un dé à six faces, et le jeu en annonce vingt.
 * La silhouette compte parce que c'est elle qu'on regarde pendant tout le
 * roulement : le chiffre change douze fois, le dé, lui, ne bouge pas de place —
 * un dé qui grandirait en s'arrêtant ferait sauter le gage qu'on lit dessous.
 *
 * Le tracé est le raccourci d'usage : hexagone de silhouette, triangle central
 * pour la face du dessus, trois arêtes qui partent de ses sommets. Le triangle
 * est **rempli**, ce qui dégage le chiffre des arêtes qui le traverseraient.
 */
function De({ face, roule }) {
  return (
    <div
      className={`relative w-32 h-32 sm:w-36 sm:h-36 ${roule ? 'anim-pulsation' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
      >
        <polygon
          points="50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27"
          className="fill-paille stroke-encre/25"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <g className="stroke-encre/25" strokeWidth="2.5" strokeLinecap="round">
          <line x1="50" y1="16" x2="50" y2="4" />
          <line x1="81" y1="70" x2="89.8" y2="73" />
          <line x1="19" y1="70" x2="10.2" y2="73" />
        </g>
        {/* Généreux à dessein : la face doit porter deux chiffres sans que le
            « 20 » ne déborde sur les arêtes. */}
        <polygon
          points="50,16 81,70 19,70"
          className="fill-white/70 stroke-encre/25"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Aucune région live ici : les douze faces du roulement seraient
          annoncées une à une, et la seule qui compte se perdrait dedans. C'est
          le résumé sr-only du résultat, plus bas, qui parle.

          Le chiffre est posé au centre de gravité de la face du dessus, pas au
          centre de la boîte — le triangle pointe vers le haut, son milieu
          visuel est plus bas. */}
      <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-titre text-brique text-4xl leading-none tabular-nums">
        {face ?? '?'}
      </p>
    </div>
  );
}

/**
 * Kit de « La blessure critique ».
 *
 * Septième jeu de la famille « tirer et montrer », et le seul à ne pas passer
 * par le défileur : son tirage est un **jet de dé**, donc avec remise. La même
 * face peut retomber, les vingt effets restent disponibles à chaque tour, et
 * c'est exactement ce que le jeu demande.
 *
 * Le roulement n'est pas décoratif. Le jeu se joue avec un vrai d20 posé sur la
 * table ; sans le temps du lancer, le téléphone donnerait le verdict avant que
 * la table ait fini de regarder. Comme pour « Surprends-moi ! », la face
 * définitive est **tirée au premier geste** et l'animation ne fait que la
 * retarder — jamais l'inverse, sans quoi une minuterie perdue emporterait le
 * résultat avec elle.
 */
function KitBlessureCritique({ game, onQuitter, libelleRetour }) {
  const effets = useMemo(
    () => contenuDuJeu(game.slug).map((ligne) => ligne.contenu),
    [game.slug]
  );

  const [etat, envoyer] = useReducer(reducteur, undefined, etatInitial);
  const [roulement, setRoulement] = useState(null);
  const [historiqueDeplie, setHistoriqueDeplie] = useState(false);
  const minuteries = useRef([]);
  const idHistorique = useId();

  const arreter = () => {
    minuteries.current.forEach((annuler) => annuler());
    minuteries.current = [];
  };

  // Le composant disparaît dès qu'on quitte le kit : sans ce nettoyage, les
  // minuteries restantes réveilleraient un composant démonté.
  useEffect(() => arreter, []);

  const jeter = () => {
    // Verrouillage dans le geste même du clic, et non à la première échéance :
    // deux pressions rapprochées lanceraient sinon deux jets.
    if (minuteries.current.length > 0) return;

    const face = lancer();
    if (animationsReduites()) {
      envoyer({ type: 'lancer', face });
      return;
    }

    // La première face part dans le geste même du clic : le dé doit bouger
    // sous le doigt, pas au bout de soixante-dix millisecondes.
    setRoulement(lancer());
    let restants = BATTEMENTS;
    const battement = setInterval(() => {
      restants -= 1;
      if (restants > 0) {
        setRoulement(lancer());
        return;
      }
      arreter();
      setRoulement(null);
      envoyer({ type: 'lancer', face });
    }, PAS);
    minuteries.current = [() => clearInterval(battement)];
  };

  const roule = roulement !== null;
  const effet = roule ? null : effetDe(effets, etat.face);

  return (
    <div className="flex flex-col items-center">
      <div className="py-2">
        <De face={roule ? roulement : etat.face} roule={roule} />
      </div>

      {effet ? (
        <div className="flex justify-center w-full py-6">
          <CarteTiree
            texte={effet}
            cle={etat.historique.length}
            taille="phrase"
            annonce={false}
          />
        </div>
      ) : (
        <p className="text-ardoise font-texte text-lg text-center max-w-md mt-6">
          {roule
            ? 'Le dé roule…'
            : `Vingt faces, vingt sorts. Le 20 sauve, le 1 fait finir son verre.`}
        </p>
      )}

      <BarreActions className="justify-center">
        <Bouton variante="principal" icone={Dices} onClick={jeter} disabled={roule}>
          {etat.face ? 'Relancer le dé' : 'Lancer le dé'}
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>

      {etat.historique.length > 1 && (
        <div className="mt-6 w-full max-w-md">
          {/* Motif *disclosure* : le libellé porte le compte, comme le badge de
              « Plus de filtres » (docs/boutons.md). Les contraintes s'empilent
              toute la soirée, et « c'était quoi, ton 5 ? » revient toujours. */}
          <Bouton
            variante="discret"
            icone={History}
            iconeApres={historiqueDeplie ? ChevronUp : ChevronDown}
            onClick={() => setHistoriqueDeplie((v) => !v)}
            aria-expanded={historiqueDeplie}
            aria-controls={idHistorique}
          >
            Jets précédents ({etat.historique.length - 1})
          </Bouton>

          <div
            id={idHistorique}
            inert={!historiqueDeplie}
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
              historiqueDeplie ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <ol className="mt-3 bg-paille/60 rounded-2xl px-4 py-3 flex flex-col gap-2">
                {etat.historique.slice(1).map((face, i) => (
                  <li
                    key={`${face}-${i}`}
                    className="flex gap-3 text-sm text-ardoise font-texte"
                  >
                    <span className="font-titre text-encre tabular-nums w-6 shrink-0">
                      {face}
                    </span>
                    <span className="min-w-0">{effetDe(effets, face)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {etat.face && (
        <BarreActionsSecondaire className="justify-center">
          <Bouton
            variante="discret"
            destructeur
            icone={Trash2}
            onClick={() => {
              setHistoriqueDeplie(false);
              envoyer({ type: 'oublier' });
            }}
          >
            Effacer les jets
          </Bouton>
        </BarreActionsSecondaire>
      )}

      {/* L'unique région live de l'écran, et elle ne s'ouvre qu'une fois le dé
          posé. Elle porte la face *et* son effet : les deux sont sur des
          éléments trop éloignés pour être lus d'un trait autrement. */}
      <p className="sr-only" role="status">
        {effet ? `${etat.face} sur ${FACES} — ${effet}` : ''}
      </p>
    </div>
  );
}

export default KitBlessureCritique;
