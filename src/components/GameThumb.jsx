import { asset } from '../utils/asset';

/**
 * Carte affichée pour un jeu qui n'a pas encore la sienne.
 *
 * Les illustrations sont dessinées à la main : un jeu entre au catalogue bien
 * avant elle. Le point d'interrogation est déjà l'emblème du site — il figure à
 * côté du titre — et dire « on ne sait pas encore » est exactement son propos.
 */
const CARTE_PAR_DEFAUT = '/CarteInterrogation.png';

function GameThumb({ game, className = '' }) {
  return (
    <img
      src={asset(game.image ?? CARTE_PAR_DEFAUT)}
      alt=""
      loading="lazy"
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

export default GameThumb;
