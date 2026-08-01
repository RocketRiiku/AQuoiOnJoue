import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Infinity as InfinityIcon,
  Play,
  Trash2,
  X
} from 'lucide-react';
import { ActionsObjet, BarreActions, BarreActionsSecondaire, Bouton } from './Bouton';
import GameThumb from './GameThumb';
import ShareButton from './ShareButton';
import {
  formatDuration,
  formatPlageTotale,
  formatPlayers,
  messagePartageSoiree,
  plageDureeSoiree
} from '../utils/formatGame';
import { partitionnerSoiree } from '../utils/soiree';

/**
 * Une ligne du programme.
 *
 * `rang` vaut `null` pour un fil rouge : il n'a pas de numéro d'ordre, et pas
 * non plus de boutons monter / descendre. C'est précisément ce que la ligne
 * doit donner à voir — il n'est pas à sa place dans une file d'attente.
 */
function LigneJeu({
  game,
  rang,
  premier,
  dernier,
  joueurs,
  onOuvrirJeu,
  onDeplacer,
  onRetirer
}) {
  return (
    <li className="flex items-center gap-3 bg-white/70 rounded-xl p-2 pr-3">
      <span
        aria-hidden="true"
        className="font-titre text-2xl text-orange w-7 shrink-0 flex items-center justify-center"
      >
        {rang ?? <InfinityIcon className="w-5 h-5" />}
      </span>

      <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-paille">
        <GameThumb game={game} />
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
          {formatPlayers(game)} · {formatDuration(game, joueurs)}
        </span>
      </button>

      {/* Boutons plutôt que glisser-déposer : utilisable au clavier,
          au lecteur d'écran, et fiable au doigt sur mobile. */}
      {onDeplacer && (
        <div className="flex flex-col shrink-0">
          <button
            type="button"
            onClick={() => onDeplacer(game.slug, -1)}
            disabled={premier}
            aria-label={`Monter ${game.title}`}
            className="p-1 text-encre disabled:opacity-25 disabled:cursor-not-allowed hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
          >
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDeplacer(game.slug, 1)}
            disabled={dernier}
            aria-label={`Descendre ${game.title}`}
            className="p-1 text-encre disabled:opacity-25 disabled:cursor-not-allowed hover:text-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRetirer(game.slug)}
        aria-label={`Retirer ${game.title} de la soirée`}
        className="p-2 text-ardoise/70 hover:text-brique shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </li>
  );
}

function SoireePage({
  soiree,
  onRetour,
  onLancer,
  onVider,
  onRetirer,
  onDeplacer,
  onOuvrirJeu,
  joueurs = null
}) {
  // Les fils rouges courent en parallèle du programme : ils ont leur bloc à
  // part, hors numérotation, et les additionner au total gonflerait la soirée
  // d'heures qui ne s'écoulent jamais.
  const { programme, filsRouges } = partitionnerSoiree(soiree);
  const plageTotale = plageDureeSoiree(soiree, joueurs);

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
            texte={messagePartageSoiree(soiree, plageTotale)}
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
            {programme.length === 0 ? (
              'Aucun jeu au programme'
            ) : (
              <>
                {programme.length} jeu{programme.length > 1 ? 'x' : ''} au programme ·{' '}
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {formatPlageTotale(plageTotale)} environ
                </span>
              </>
            )}
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

          {programme.length > 0 && (
            <ol aria-label="Programme, dans l’ordre" className="mt-6 flex flex-col gap-3">
              {programme.map((game, index) => (
                <LigneJeu
                  key={game.slug}
                  game={game}
                  rang={index + 1}
                  premier={index === 0}
                  dernier={index === programme.length - 1}
                  joueurs={joueurs}
                  onOuvrirJeu={onOuvrirJeu}
                  onDeplacer={onDeplacer}
                  onRetirer={onRetirer}
                />
              ))}
            </ol>
          )}

          {filsRouges.length > 0 && (
            <div className="mt-8 border-t border-encre/10 pt-5">
              <h3 id="titre-fils-rouges" className="font-titre text-xl text-encre">
                En fond toute la soirée
              </h3>
              <p className="text-sm text-ardoise/80 mt-0.5">
                On {filsRouges.length > 1 ? 'les lance' : 'le lance'} en premier, puis{' '}
                {filsRouges.length > 1 ? 'ils tournent' : 'il tourne'} en parallèle du reste :
                ni place dans l’ordre, ni durée à compter.
              </p>
              <ul aria-labelledby="titre-fils-rouges" className="mt-3 flex flex-col gap-3">
                {filsRouges.map((game) => (
                  <LigneJeu
                    key={game.slug}
                    game={game}
                    rang={null}
                    joueurs={joueurs}
                    onOuvrirJeu={onOuvrirJeu}
                    onRetirer={onRetirer}
                  />
                ))}
              </ul>
            </div>
          )}

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
