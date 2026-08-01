import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDownUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Bouton } from './Bouton';
import Pastille from './Pastille';
import { TRIS } from '../utils/trierJeux';

/**
 * Choix de l'ordre de la liste.
 *
 * Quatre pastilles étaient dépliées en permanence au-dessus des cartes : un
 * bandeau que presque personne ne touche, posé entre les filtres et les jeux.
 * Le tri est un réglage d'appoint, changé rarement et bien servi par un bon
 * défaut (NN/g, « Does Your Form Really Need a Dropdown List? ») : il n'a pas
 * besoin d'occuper cette place.
 *
 * Il est donc replié derrière un bouton discret, sur le modèle de « Plus de
 * filtres ». Le repli ne coûte la découverte que si le bouton ne dit rien :
 * **son libellé porte l'ordre en cours** (« Trier : A → Z ») plutôt qu'un
 * « Trier par » muet. Baymard le mesure sur les listes marchandes — un
 * déclencheur sans valeur visible laisse le visiteur incapable de dire comment
 * la liste est rangée. La valeur reste donc lisible sans un clic, et c'est ce
 * qui rend le repli acceptable.
 *
 * Motif « disclosure » du WAI-ARIA APG, et non un menu : le bouton ne fait que
 * montrer un contenu déjà présent. `aria-expanded` et `aria-controls` disent
 * l'état, la même animation de grille que les filtres dit le reste.
 *
 * Un seul ordre à la fois, et jamais aucun : cliquer sur celui déjà retenu ne
 * le désélectionne pas, contrairement à une pastille de filtre. Une liste doit
 * bien être rangée d'une façon ou d'une autre.
 */
function TriJeux({ tri, onTri }) {
  const idPanneau = useId();
  const [deplie, setDeplie] = useState(false);
  const declencheurRef = useRef(null);

  // Une clé inconnue retombe sur le premier ordre, comme `trierJeux`.
  const libelleActif = (TRIS.find(({ cle }) => cle === tri) ?? TRIS[0]).libelle;

  // Le focus revient au bouton : sans lui, une fermeture au clavier le laisse
  // sur un panneau devenu `inert` et la tabulation repart du haut de la page.
  const refermer = () => {
    setDeplie(false);
    declencheurRef.current?.focus();
  };

  useEffect(() => {
    if (!deplie) return;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setDeplie(false);
      declencheurRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [deplie]);

  // Le choix s'applique aussitôt et referme : garder le panneau ouvert
  // repousserait vers le bas la liste qu'on vient de demander à réordonner.
  const choisir = (cle) => {
    onTri(cle);
    refermer();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      {/* Le chevron change de sens au lieu de pivoter : `Bouton` pose lui-même
          les classes de ses icônes, et une exception pour une rotation aurait
          rouvert la porte aux boutons habillés au cas par cas. */}
      <Bouton
        ref={declencheurRef}
        variante="discret"
        icone={ArrowDownUp}
        iconeApres={deplie ? ChevronUp : ChevronDown}
        onClick={() => setDeplie((v) => !v)}
        aria-expanded={deplie}
        aria-controls={idPanneau}
      >
        Trier&nbsp;: {libelleActif}
      </Bouton>

      {/* Même dépliage que les filtres : une grille dont l'unique rangée passe
          de 0fr à 1fr, ce qui interpole la hauteur sans avoir à la mesurer.
          `inert` retire les pastilles du parcours clavier tant que c'est replié,
          sans les sortir du DOM — la transition en a besoin. */}
      <div
        id={idPanneau}
        inert={!deplie}
        className={`grid w-full transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          deplie ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div
            role="group"
            aria-label="Trier par"
            className="flex flex-wrap items-center justify-center gap-2 pt-3"
          >
            {TRIS.map(({ cle, libelle }) => (
              <Pastille key={cle} actif={tri === cle} onClick={() => choisir(cle)}>
                {libelle}
              </Pastille>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TriJeux;
