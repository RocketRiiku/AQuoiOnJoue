import { useEffect, useRef, useState } from 'react';
import { Check, SkipForward, Undo2 } from 'lucide-react';
import CarteTiree from './CarteTiree';
import Chrono from './Chrono';

const DEPART = 3;
/** Distance à parcourir pour qu'un glissement compte comme une réponse. */
const SEUIL_GLISSEMENT = 70;
/** Durée pendant laquelle « Annuler » reste offert après un geste. */
const FENETRE_ANNULATION = 2500;

/**
 * Décompte d'entrée, avant que le chrono ne parte.
 *
 * Repris de tout le genre (Heads Up!, Charades) : sans lui, les secondes
 * s'écoulent pendant qu'on lève encore le téléphone et qu'on cherche des yeux
 * le premier mot. Trois secondes suffisent à prendre la carte en main.
 */
function Decompte({ onFini }) {
  const [reste, setReste] = useState(DEPART);
  // Par référence : passée en ligne, la fonction changerait à chaque rendu du
  // parent et relancerait la seconde en cours indéfiniment.
  const onFiniRef = useRef(onFini);
  onFiniRef.current = onFini;

  // `setInterval` et non `setTimeout`, bien qu'on n'attende qu'un battement :
  // simuler les minuteries d'un test fige aussi l'ordonnanceur de React s'il
  // faut lui prendre `setTimeout`, dont il se sert. L'intervalle est reposé à
  // chaque chiffre, ce qui revient au même.
  useEffect(() => {
    if (reste === 0) {
      onFiniRef.current();
      return undefined;
    }
    const battement = setInterval(() => setReste((n) => n - 1), 1000);
    return () => clearInterval(battement);
  }, [reste]);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-creme rounded-2xl"
      role="status"
    >
      <p className="text-ardoise font-texte text-lg">Prêts&nbsp;?</p>
      {/* La clé rejoue l'animation à chaque chiffre : React remonte l'élément,
          et le CSS repart du début sans qu'on ait à le piloter. */}
      <p
        key={reste}
        className="anim-decompte font-titre text-brique text-8xl leading-none tabular-nums"
      >
        {reste}
      </p>
    </div>
  );
}

/**
 * Zone de réponse : la surface qu'on frappe pendant la partie.
 *
 * Ce ne sont pas des boutons de panneau mais **la table de jeu elle-même**, au
 * même titre que la carte entière de la liste (docs/boutons.md, « ce que ce
 * système ne couvre pas »). D'où leur taille : elles occupent le bas de
 * l'écran, la zone que le pouce atteint sans effort — la précision y tombe de
 * 96 % à 61 % dès qu'il faut s'étirer (NN/g), et on tape ici sous la pression
 * du chrono, parfois debout, un verre à la main.
 */
function ZoneReponse({ ton, icone: Icone, onClick, disabled, children }) {
  const tons = {
    // Le vert de l'herbe du décor, assombri : le crème n'y passe le seuil AA
    // qu'à cette teinte (cf. tailwind.config.js).
    reussite: 'bg-herbe-sombre text-creme shadow-md hover:bg-herbe active:scale-[0.98]',
    neutre:
      'bg-white/70 text-ardoise border-2 border-ardoise/25 hover:border-orange hover:text-orange active:scale-[0.98]'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl font-titre flex items-center justify-center gap-3 transition-[background-color,transform,border-color,color] duration-100 motion-reduce:transition-none disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${tons[ton]}`}
    >
      <Icone className="w-6 h-6 shrink-0" aria-hidden="true" />
      {children}
    </button>
  );
}

/**
 * L'écran d'un tour : le chrono, le score qui monte, la carte, les réponses.
 *
 * Les deux chiffres se font face — le temps qui descend à gauche, les mots
 * trouvés qui montent à droite. C'est cette tension-là qu'on vient chercher
 * dans un Time's Up, et elle ne se lit pas dans une phrase.
 */
function EcranTour({
  mot,
  secondes,
  restants,
  trouves,
  cleTour,
  peutAnnuler,
  onTrouve,
  onPasse,
  onAnnuler,
  onTempsEcoule,
  enPause,
  son
}) {
  const [pret, setPret] = useState(false);
  const [glissement, setGlissement] = useState(0);
  const departRef = useRef(null);
  const [annulationOfferte, setAnnulationOfferte] = useState(false);

  // « Annuler » ne reste pas à demeure : il n'a de sens que dans les secondes
  // qui suivent le geste, et une commande permanente de plus encombrerait
  // l'écran pour rien.
  useEffect(() => {
    if (!peutAnnuler) {
      setAnnulationOfferte(false);
      return undefined;
    }
    setAnnulationOfferte(true);
    const minuterie = setInterval(() => setAnnulationOfferte(false), FENETRE_ANNULATION);
    return () => clearInterval(minuterie);
  }, [peutAnnuler, mot]);

  /**
   * Glisser à droite vaut « trouvé », à gauche « passer ».
   *
   * Plus rapide que viser un bouton quand ça s'emballe, et la carte suit le
   * doigt pour que le geste se comprenne avant d'être relâché. Les deux zones
   * restent en place : le glissement est un raccourci, jamais le seul chemin.
   */
  const debutGeste = (evenement) => {
    departRef.current = evenement.touches[0].clientX;
  };

  const gesteEnCours = (evenement) => {
    if (departRef.current == null) return;
    setGlissement(evenement.touches[0].clientX - departRef.current);
  };

  const finGeste = () => {
    if (glissement > SEUIL_GLISSEMENT) onTrouve();
    else if (glissement < -SEUIL_GLISSEMENT && restants > 1) onPasse();
    departRef.current = null;
    setGlissement(0);
  };

  const engage = Math.abs(glissement) > SEUIL_GLISSEMENT;

  return (
    // `flex-1` : la racine ne remplissait pas le panneau, si bien que le
    // `flex-1` de la carte n'avait rien où grandir et que le mot restait petit au
    // milieu d'un écran à moitié vide. Même structure en trois zones que les
    // autres écrans de kit — l'en-tête chiffré, la scène, les surfaces de réponse.
    <div className="relative flex flex-col flex-1">
      <div className="flex items-end gap-5">
        <div className="flex-1 min-w-0">
          <Chrono
            secondes={secondes}
            enMarche={pret && !enPause}
            // La clé identifie le *tour*, pas le mot : trouver ou passer une
            // carte ne doit pas remettre le décompte à trente.
            cle={cleTour}
            son={son}
            onFini={onTempsEcoule}
          />
        </div>

        <p className="text-center shrink-0 pb-1">
          <span
            // `aria-live` sans `role="status"` : le compteur se dit bien à voix
            // haute quand il change, mais le rôle est laissé au mot — c'est lui
            // que le porteur du téléphone doit entendre en premier.
            aria-live="polite"
            className="block font-titre text-5xl sm:text-6xl leading-none tabular-nums text-herbe-sombre"
          >
            {trouves}
          </span>
          <span className="block text-xs uppercase tracking-wide text-ardoise/70 mt-1">
            trouvé{trouves > 1 ? 's' : ''}
          </span>
        </p>
      </div>

      {/* La carte est une brique commune (CarteTiree) ; ce qui lui est propre
          ici, c'est le glissement — la transformation qui suit le doigt et
          l'anneau qui confirme le geste avant qu'on relâche. */}
      {/* `items-center` : passé son plafond, la carte cesse de grandir et le
          reste de la place se répartit autour d'elle. */}
      <div className="flex-1 flex items-center justify-center py-5 touch-pan-y select-none">
        <CarteTiree
          texte={mot}
          cle={mot}
          plein
          onTouchStart={debutGeste}
          onTouchMove={gesteEnCours}
          onTouchEnd={finGeste}
          onTouchCancel={finGeste}
          style={{
            transform: glissement
              ? `translateX(${glissement}px) rotate(${glissement / 22}deg)`
              : undefined
          }}
          className={`${glissement ? 'transition-none' : ''} ${
            engage ? 'ring-4 ring-offset-2' : ''
          } ${engage && glissement > 0 ? 'ring-herbe-sombre' : ''} ${
            engage && glissement < 0 ? 'ring-ardoise/40' : ''
          }`}
        />
      </div>

      <div className="flex items-center justify-center gap-3 mb-4 min-h-[1.75rem]">
        <p className="text-ardoise/70 text-sm">
          Encore {restants} mot{restants > 1 ? 's' : ''} dans le pot
        </p>
        {annulationOfferte && (
          <button
            type="button"
            onClick={onAnnuler}
            className="inline-flex items-center gap-1.5 text-sm text-orange hover:text-brique underline underline-offset-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          >
            <Undo2 className="w-4 h-4" aria-hidden="true" />
            Annuler
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <ZoneReponse ton="reussite" icone={Check} onClick={onTrouve}>
          <span className="text-2xl sm:text-3xl py-5">Trouvé&nbsp;!</span>
        </ZoneReponse>
        <ZoneReponse
          ton="neutre"
          icone={SkipForward}
          onClick={onPasse}
          disabled={restants < 2}
        >
          <span className="text-lg py-3">Passer</span>
        </ZoneReponse>
      </div>

      {!pret && <Decompte onFini={() => setPret(true)} />}
    </div>
  );
}

export default EcranTour;
