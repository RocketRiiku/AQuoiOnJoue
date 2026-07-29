import { useCallback, useEffect, useRef, useState } from 'react';
import { Bouton } from './Bouton';
import { asset } from '../utils/asset';

/**
 * « Surprends-moi ! » — le tirage au sort, précédé d'un mélange de cartes.
 *
 * Les deux étoiles du bouton deviennent des cartes qui défilent en ralentissant,
 * comme une roulette qu'on lâche, puis la fiche s'ouvre. Ce sont les vraies
 * illustrations du catalogue : le tirage montre ce parmi quoi il choisit.
 *
 * **Le tirage n'est jamais suspendu à une animation.** La suite du parcours est
 * déclenchée par une minuterie, jamais par la fin d'un effet CSS : c'est
 * exactement ce qui avait mis les fiches en panne du temps de Framer Motion, où
 * une animation de sortie qui ne se terminait pas empêchait la vue suivante de
 * monter (cf. README, « Animations »).
 *
 * Le libellé, lui, ne bouge pas : le faire changer pendant le mélange
 * redimensionnerait le bouton sous le doigt qui vient de le presser.
 */

/**
 * Délai avant chaque carte, en ms. La suite s'allonge : le mélange ralentit
 * avant de s'arrêter, ce qui fait tout l'effet de roulette. Total ≈ 0,6 s —
 * assez pour être vu, trop court pour être attendu.
 */
const CADENCE = [50, 50, 55, 65, 75, 90, 110, 135];

/** Temps d'arrêt sur la dernière carte, avant l'ouverture de la fiche. */
const REPOS_FINAL = 130;

const REPLI = '/CarteInterrogation.png';

// Le réglage système prime : sans animation demandée, le tirage est immédiat.
// La règle CSS globale ne suffirait pas — elle raccourcit les animations, mais
// ne toucherait pas aux minuteries.
const animationsReduites = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function BoutonTirage({ candidats, onTirer, disabled = false }) {
  const [carte, setCarte] = useState(null);
  const minuteries = useRef([]);

  const arreter = useCallback(() => {
    minuteries.current.forEach(clearTimeout);
    minuteries.current = [];
  }, []);

  // Le bouton disparaît dès que la fiche s'ouvre : sans ce nettoyage, les
  // minuteries restantes réveilleraient un composant démonté.
  useEffect(() => arreter, [arreter]);

  const enCours = carte !== null;

  const lancer = () => {
    // Mélanger une carte unique n'aurait aucun sens, et il n'y a rien à
    // suggérer d'un catalogue vide.
    if (candidats.length < 2 || animationsReduites()) {
      onTirer();
      return;
    }

    // La première carte est posée sur-le-champ, et non à la première échéance :
    // le bouton doit se verrouiller dans le même geste que le clic, sinon deux
    // pressions rapprochées lancent deux tirages.
    setCarte(0);

    let cumul = 0;
    CADENCE.forEach((delai, index) => {
      cumul += delai;
      minuteries.current.push(setTimeout(() => setCarte(index + 1), cumul));
    });

    minuteries.current.push(
      setTimeout(() => {
        setCarte(null);
        onTirer();
      }, cumul + REPOS_FINAL)
    );
  };

  /**
   * L'illustration montrée dans un des deux emplacements. Les deux défilent en
   * sens inverse : côte à côte et synchrones, on ne verrait qu'une seule carte
   * en double. Le décalage d'un cran sur celui de droite écarte les rares tours
   * où les deux sens retombent sur la même carte.
   */
  const illustration = (sens, decalage = 0) => {
    const rang = (carte * sens + decalage + candidats.length * 8) % candidats.length;
    return asset(candidats[rang]?.image ?? REPLI);
  };

  return (
    <Bouton
      variante="principal"
      onClick={lancer}
      disabled={disabled || enCours}
      aria-busy={enCours || undefined}
      className={`text-2xl hover:enabled:scale-105 active:enabled:scale-95 transition-transform duration-150 motion-reduce:transition-none motion-reduce:hover:enabled:scale-100 ${
        enCours ? 'anim-melange' : ''
      }`}
    >
      {/* La clé change à chaque carte : React remonte l'image, ce qui rejoue
          l'animation de retournement sans qu'aucun état ne la pilote. */}
      <img
        key={enCours ? `gauche-${carte}` : 'gauche'}
        src={enCours ? illustration(1) : asset('/star.png')}
        alt=""
        aria-hidden="true"
        className={`w-5 h-5 object-contain ${enCours ? 'anim-carte' : ''}`}
      />
      Surprends-moi&nbsp;!
      <img
        key={enCours ? `droite-${carte}` : 'droite'}
        src={enCours ? illustration(-1, 1) : asset('/star.png')}
        alt=""
        aria-hidden="true"
        className={`w-5 h-5 object-contain ${enCours ? 'anim-carte' : ''}`}
      />
    </Bouton>
  );
}

export default BoutonTirage;
