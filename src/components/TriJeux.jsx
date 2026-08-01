import { useId } from 'react';
import Pastille from './Pastille';
import { TRIS } from '../utils/trierJeux';

/**
 * Choix de l'ordre de la liste.
 *
 * Des pastilles plutôt qu'un menu déroulant : le vocabulaire existe déjà pour
 * les filtres, et les quatre ordres se lisent d'un coup d'œil au lieu d'être
 * cachés derrière un clic. Elles sont visibles en permanence, et non repliées
 * avec les filtres secondaires — un tri qu'il faut déplier n'est jamais trouvé.
 *
 * Un seul ordre à la fois, et jamais aucun : cliquer sur celui déjà retenu ne
 * le désélectionne pas, contrairement à une pastille de filtre. Une liste doit
 * bien être rangée d'une façon ou d'une autre.
 */
function TriJeux({ tri, onTri }) {
  const id = useId();

  return (
    <div
      role="group"
      aria-labelledby={id}
      className="flex flex-wrap items-center justify-center gap-2 mb-6"
    >
      <span id={id} className="font-titre text-encre text-sm">
        Trier par
      </span>
      {TRIS.map(({ cle, libelle }) => (
        <Pastille key={cle} actif={tri === cle} onClick={() => onTri(cle)}>
          {libelle}
        </Pastille>
      ))}
    </div>
  );
}

export default TriJeux;
