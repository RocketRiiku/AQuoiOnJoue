import { Users, Clock, Plus, Check, Star } from 'lucide-react';
import GameThumb from './GameThumb';
import {
  describeGame,
  estRecommande,
  formatDuration,
  formatPlayers
} from '../utils/formatGame';

/**
 * Inclinaison dérivée de l'id plutôt que tirée au hasard : l'effet « cartes
 * posées en vrac » est conservé, mais une carte garde la même inclinaison d'un
 * rendu à l'autre (un Math.random en rendu changeait d'angle au remontage).
 */
function tiltFor(id) {
  return ((id * 37) % 11) - 5;
}

/**
 * Le conteneur est une simple div, et non un bouton : la carte porte désormais
 * deux actions distinctes (ouvrir la fiche, ajouter à la soirée), et un bouton
 * ne peut pas en contenir un autre. Les deux zones restent de vrais <button>,
 * donc atteignables au clavier.
 */
function GameCard({ game, onSelect, joueurs = null, dansSoiree = false, onBasculerSoiree }) {
  const tilt = tiltFor(game.id);
  const recommande = estRecommande(game, joueurs);

  return (
    <div className="group relative w-full max-w-[400px] transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">
      <button
        type="button"
        onClick={onSelect}
        aria-label={describeGame(game, joueurs)}
        // La hauteur minimale est celle de la vignette (h-24, soit 96 px) plus
        // sa marge : en dessous, la carte dessinée dépassait du cadre crème.
        className="w-full min-h-[112px] bg-creme rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer pl-20 pr-10 py-3 flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
      >
        <div className="flex flex-col overflow-hidden gap-0.5 min-w-0">
          <h2 className="text-[1.5rem] font-titre text-brique leading-tight line-clamp-2">
            {/* L'étoile signale un jeu à son meilleur pour l'effectif saisi.
                Devant le titre, elle se voit au premier balayage de la liste —
                où ces jeux sont d'ailleurs remontés en tête. */}
            {recommande && (
              <Star
                aria-hidden="true"
                className="inline-block w-4 h-4 mr-1.5 -mt-1 fill-orange text-orange"
              />
            )}
            {game.title}
          </h2>
          <p className="text-[1.05rem] text-[#235766] font-texte leading-[1.15] line-clamp-2">
            {game.description}
          </p>
          {/* Repères de tri : visibles sans avoir à ouvrir la fiche. */}
          <p
            aria-hidden="true"
            className="flex flex-wrap items-center gap-x-3 text-xs text-ardoise/80 mt-0.5"
          >
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatPlayers(game)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {formatDuration(game, joueurs)}
            </span>
          </p>
        </div>
      </button>

      {/* Vignette : décorative, superposée à la zone cliquable. */}
      {/* Inclinaison en style inline : c'est une valeur calculée, Tailwind ne
          peut pas la générer à l'avance. */}
      <div
        aria-hidden="true"
        style={{ transform: `rotate(${tilt}deg)` }}
        className="pointer-events-none absolute -left-1 inset-y-0 my-auto w-16 h-24 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] overflow-hidden bg-paille"
      >
        <GameThumb game={game} />
      </div>

      {onBasculerSoiree && (
        <button
          type="button"
          onClick={() => onBasculerSoiree(game)}
          aria-pressed={dansSoiree}
          aria-label={
            dansSoiree
              ? `Retirer ${game.title} de la soirée`
              : `Ajouter ${game.title} à la soirée`
          }
          title={dansSoiree ? 'Retirer de la soirée' : 'Ajouter à la soirée'}
          className={`absolute right-1.5 top-1.5 w-7 h-7 rounded-full border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
            dansSoiree
              ? 'bg-brique border-brique text-creme'
              : 'border-orange/40 text-orange/60 hover:border-orange hover:bg-orange hover:text-creme'
          }`}
        >
          {dansSoiree ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Plus className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

export default GameCard;
