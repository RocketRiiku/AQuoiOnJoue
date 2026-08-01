import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, PartyPopper, Users, X } from 'lucide-react';
import { Bouton } from './Bouton';
import GameThumb from './GameThumb';
import { formatDuration, formatMaterial, formatPlayers } from '../utils/formatGame';
import { ordreDeroule } from '../utils/soiree';

/**
 * Déroulé de la soirée, un jeu à la fois.
 *
 * Pensé pour être lu à voix haute, téléphone posé sur la table : gros titre,
 * règles en grand, et une seule action évidente pour passer au jeu suivant.
 * L'étape vit dans l'URL, donc les flèches du navigateur fonctionnent aussi et
 * un rafraîchissement ne perd pas la place.
 */
function SoireeLancement({ soiree, etape, onEtape, onQuitter, joueurs = null }) {
  // Les fils rouges ouvrent la soirée : c'est là qu'on bannit les mots ou qu'on
  // distribue les missions, avant que le programme s'enchaîne par-dessus.
  const deroule = ordreDeroule(soiree);
  const game = deroule[etape - 1];
  const titreRef = useRef(null);
  const dernier = etape === deroule.length;

  // Le focus suit le jeu affiché, sinon un utilisateur au clavier reste bloqué
  // sur le bouton précédent après chaque changement d'étape.
  useEffect(() => {
    titreRef.current?.focus();
  }, [etape]);

  // Flèches gauche/droite : naturel pour un déroulé pas à pas.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onQuitter();
      if (event.key === 'ArrowRight' && etape < deroule.length) onEtape(etape + 1);
      if (event.key === 'ArrowLeft' && etape > 1) onEtape(etape - 1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [etape, deroule.length, onEtape, onQuitter]);

  if (!game) return null;

  return (
    <section
      aria-labelledby="titre-lancement"
      className="anim-panneau bg-creme rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-10"
    >
      {/* Progression */}
      <div className="flex items-center justify-between gap-4">
        <p className="font-titre text-lg text-ardoise" role="status" aria-live="polite">
          Jeu {etape} sur {deroule.length}
        </p>
        <Bouton variante="discret" destructeur icone={X} onClick={onQuitter}>
          Arrêter la soirée
        </Bouton>
      </div>

      <ol className="flex gap-1.5 mt-3" aria-hidden="true">
        {deroule.map((etapeJeu, index) => (
          <li
            key={etapeJeu.slug}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < etape ? 'bg-brique' : 'bg-ardoise/20'
            }`}
          />
        ))}
      </ol>

      <div className="flex flex-col sm:flex-row gap-6 mt-8">
        <div className="w-28 sm:w-36 h-40 sm:h-52 self-center sm:self-start rounded-xl shadow-lg -rotate-2 shrink-0 overflow-hidden">
          <GameThumb game={game} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="titre-lancement"
            ref={titreRef}
            tabIndex={-1}
            className="font-titre text-4xl sm:text-5xl text-brique leading-tight focus:outline-none"
          >
            {game.title}
          </h2>
          <p className="text-ardoise font-texte text-xl mt-2 leading-snug">
            {game.description}
          </p>

          <p className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-ardoise">
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange" aria-hidden="true" />
              {formatPlayers(game)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange" aria-hidden="true" />
              {formatDuration(game, joueurs)}
            </span>
            <span className="text-sm text-ardoise/80">{formatMaterial(game)}</span>
          </p>
        </div>
      </div>

      {/* Règles en grand : le téléphone est posé au milieu de la table. */}
      <div className="mt-8">
        <h3 className="font-titre text-2xl text-encre mb-2">Comment on joue</h3>
        <p className="text-ardoise font-texte text-xl sm:text-2xl leading-relaxed whitespace-pre-line">
          {game.rules}
        </p>
      </div>

      {/* Le principal d'abord, à gauche : « avancer » est l'action attendue,
          « précédent » n'est qu'un repli (docs/boutons.md). */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        {dernier ? (
          <Bouton variante="principal" icone={PartyPopper} onClick={onQuitter}>
            Terminer la soirée
          </Bouton>
        ) : (
          <Bouton
            variante="principal"
            iconeApres={ChevronRight}
            onClick={() => onEtape(etape + 1)}
          >
            Jeu suivant
          </Bouton>
        )}

        <Bouton
          variante="secondaire"
          icone={ChevronLeft}
          onClick={() => onEtape(etape - 1)}
          disabled={etape === 1}
        >
          Précédent
        </Bouton>
      </div>
    </section>
  );
}

export default SoireeLancement;
