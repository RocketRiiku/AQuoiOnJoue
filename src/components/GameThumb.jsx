import { asset } from '../utils/asset';
import { iconeDeRepli } from '../utils/formatGame';

/**
 * Vignette d'un jeu : son illustration, ou un repli si elle n'existe pas encore.
 *
 * Les cartes sont dessinées à la main : un jeu peut donc entrer au catalogue
 * avant son illustration. Le repli reprend l'emoji du type de jeu sur le fond
 * paille de la charte, afin qu'une fiche sans visuel reste présentable.
 */
function GameThumb({ game, className = '', tailleIcone = 'text-2xl' }) {
  if (game.image) {
    return (
      <img
        src={asset(game.image)}
        alt=""
        loading="lazy"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full bg-gradient-to-br from-paille to-[#f2d599] flex flex-col items-center justify-center gap-1 ${className}`}
    >
      <span className={tailleIcone} aria-hidden="true">
        {iconeDeRepli(game)}
      </span>
      <span className="font-titre text-encre/70 text-[0.6rem] leading-none px-1 text-center">
        {game.title.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

export default GameThumb;
