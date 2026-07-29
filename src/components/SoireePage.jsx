import { ArrowLeft, ChevronDown, ChevronUp, Clock, Play, Trash2, X } from 'lucide-react';
import { ActionsObjet, BarreActions, BarreActionsSecondaire, Bouton } from './Bouton';
import GameThumb from './GameThumb';
import ShareButton from './ShareButton';
import {
  formatDuration,
  formatDureeTotale,
  formatPlayers,
  messagePartageSoiree
} from '../utils/formatGame';

function SoireePage({
  soiree,
  onRetour,
  onLancer,
  onVider,
  onRetirer,
  onDeplacer,
  onOuvrirJeu
}) {
  const dureeTotale = soiree.reduce((total, game) => total + game.duration, 0);

  // Le nombre de joueurs praticable est l'intersection des fourchettes.
  const minJoueurs = soiree.length ? Math.max(...soiree.map((g) => g.minPlayers)) : 0;
  const maxJoueurs = soiree.length ? Math.min(...soiree.map((g) => g.maxPlayers)) : 0;
  const fourchetteImpossible = soiree.length > 0 && minJoueurs > maxJoueurs;

  return (
    <section
      aria-labelledby="titre-soiree"
      className="anim-panneau relative bg-creme rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-8"
    >
      {/* Partager porte sur l'objet affiché — le programme — donc icône en haut
          à droite, comme sur la fiche d'un jeu (docs/boutons.md). */}
      {soiree.length > 0 && (
        <ActionsObjet>
          <ShareButton
            titre="Ma soirée — À quoi on joue ?"
            texte={messagePartageSoiree(soiree, dureeTotale)}
            libelle="Partager le programme"
          />
        </ActionsObjet>
      )}

      <h2 id="titre-soiree" className="font-titre text-3xl sm:text-4xl text-brique pr-12">
        Ma soirée
      </h2>

      {soiree.length === 0 ? (
        <>
          <p className="text-ardoise font-texte text-lg mt-2">
            Votre programme est vide. Ajoutez des jeux depuis la liste avec le bouton{' '}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-orange text-orange text-sm align-middle">
              +
            </span>{' '}
            pour composer la soirée.
          </p>
          <BarreActions className="mt-6">
            <Bouton variante="principal" icone={ArrowLeft} onClick={onRetour}>
              Choisir des jeux
            </Bouton>
          </BarreActions>
        </>
      ) : (
        <>
          <p className="text-ardoise font-texte text-lg mt-1">
            {soiree.length} jeu{soiree.length > 1 ? 'x' : ''} ·{' '}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {formatDureeTotale(dureeTotale)} environ
            </span>
          </p>

          <p className="text-sm text-ardoise/80 mt-1">
            {fourchetteImpossible ? (
              <span className="text-brique">
                Attention : aucun nombre de joueurs ne convient à tous ces jeux à la fois.
              </span>
            ) : (
              `Convient à ${minJoueurs === maxJoueurs ? minJoueurs : `${minJoueurs}–${maxJoueurs}`} joueurs.`
            )}
          </p>

          <ol className="mt-6 flex flex-col gap-3">
            {soiree.map((game, index) => (
              <li
                key={game.slug}
                className="flex items-center gap-3 bg-white/70 rounded-xl p-2 pr-3"
              >
                <span
                  aria-hidden="true"
                  className="font-titre text-2xl text-orange w-7 text-center shrink-0"
                >
                  {index + 1}
                </span>

                <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-paille">
                  <GameThumb game={game} tailleIcone="text-base" />
                </div>

                <button
                  type="button"
                  onClick={() => onOuvrirJeu(game)}
                  className="flex-1 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
                >
                  <span className="block font-titre text-lg text-brique leading-tight truncate">
                    {game.title}
                  </span>
                  <span className="block text-xs text-ardoise/80">
                    {formatPlayers(game)} · {formatDuration(game)}
                  </span>
                </button>

                {/* Boutons plutôt que glisser-déposer : utilisable au clavier,
                    au lecteur d'écran, et fiable au doigt sur mobile. */}
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => onDeplacer(game.slug, -1)}
                    disabled={index === 0}
                    aria-label={`Monter ${game.title}`}
                    className="p-1 text-encre disabled:opacity-25 disabled:cursor-not-allowed hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
                  >
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeplacer(game.slug, 1)}
                    disabled={index === soiree.length - 1}
                    aria-label={`Descendre ${game.title}`}
                    className="p-1 text-encre disabled:opacity-25 disabled:cursor-not-allowed hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRetirer(game.slug)}
                  aria-label={`Retirer ${game.title} de la soirée`}
                  className="p-2 text-ardoise/70 hover:text-brique shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>

          <BarreActions>
            <Bouton variante="principal" icone={Play} onClick={onLancer}>
              Lancer la soirée
            </Bouton>
          </BarreActions>

          <BarreActionsSecondaire>
            <Bouton variante="discret" icone={ArrowLeft} onClick={onRetour}>
              Ajouter d&apos;autres jeux
            </Bouton>
            <Bouton variante="discret" destructeur icone={Trash2} onClick={onVider}>
              Vider le programme
            </Bouton>
          </BarreActionsSecondaire>
        </>
      )}
    </section>
  );
}

export default SoireePage;
