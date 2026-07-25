import { useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import { ArrowLeft, Users, Clock, Package, Sparkles, GraduationCap, Plus, Check } from 'lucide-react';
import GameThumb from './GameThumb';
import Infobulle from './Infobulle';
import ShareButton from './ShareButton';
import { formatDuration, formatMaterial, formatPlayers, formatTypes } from '../utils/formatGame';

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 mt-1 shrink-0 text-orange" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-ardoise/70">{label}</dt>
        <dd className="text-encre text-[0.95rem] leading-snug first-letter:uppercase">
          {value}
        </dd>
      </div>
    </div>
  );
}

function GameDetail({ game, goBack, dansSoiree = false, onBasculerSoiree }) {
  const headingRef = useRef(null);

  // Le focus suit la navigation : sans cela, un utilisateur au clavier ou au
  // lecteur d'écran resterait au début de la page après avoir ouvert la fiche.
  useEffect(() => {
    headingRef.current?.focus();
  }, [game.id]);

  // Échap referme la fiche, comme sur une boîte de dialogue.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') goBack();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [goBack]);

  return (
    <m.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      aria-labelledby="titre-jeu"
      className="bg-creme rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
    >
      {/* Actions secondaires en haut à droite : présentes sans concurrencer le
          bouton de retour, qui reste l'action principale en bas de fiche. */}
      <div className="relative">
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 flex items-center gap-2">
          {onBasculerSoiree && (
            <Infobulle
              texte={dansSoiree ? 'Retirer de la soirée' : 'Ajouter à la soirée'}
            >
              <button
                type="button"
                onClick={() => onBasculerSoiree(game)}
                aria-pressed={dansSoiree}
                aria-label={
                  dansSoiree
                    ? `Retirer ${game.title} de la soirée`
                    : `Ajouter ${game.title} à la soirée`
                }
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${
                  dansSoiree
                    ? 'bg-brique border-brique text-creme'
                    : 'border-orange/50 text-orange hover:bg-orange hover:text-creme hover:border-orange'
                }`}
              >
                {dansSoiree ? (
                  <Check className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Plus className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </Infobulle>
          )}

          <Infobulle texte="Partager ce jeu">
            <ShareButton
              titre={`${game.title} — À quoi on joue ?`}
              texte={`On joue à ${game.title} ? ${game.description}`}
              libelle="Partager ce jeu"
              iconeSeule
              className="w-9 h-9 rounded-full border border-brique/50 text-brique justify-center hover:bg-brique hover:text-creme hover:border-brique transition-colors"
            />
          </Infobulle>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
        <div className="w-32 sm:w-40 h-48 sm:h-60 self-center sm:self-start rounded-xl shadow-lg -rotate-2 shrink-0 overflow-hidden">
          <GameThumb game={game} tailleIcone="text-5xl" />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="titre-jeu"
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl sm:text-4xl font-titre text-brique leading-tight focus:outline-none"
          >
            {game.title}
          </h2>
          <p className="text-ardoise font-texte text-lg mt-1 leading-snug">
            {game.description}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5">
            <Meta icon={Users} label="Joueurs" value={formatPlayers(game)} />
            <Meta icon={Clock} label="Durée" value={formatDuration(game)} />
            <Meta icon={Package} label="Matériel" value={formatMaterial(game)} />
            <Meta icon={Sparkles} label="Type" value={formatTypes(game)} />
            <Meta icon={GraduationCap} label="Niveau" value={game.level} />
            {game.alcohol && (
              <Meta icon={Sparkles} label="Ambiance" value="Jeu alcoolisé" />
            )}
          </dl>
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <h3 className="font-titre text-2xl text-encre mb-2">Comment on joue</h3>
        <p className="text-ardoise font-texte text-[1.05rem] leading-relaxed whitespace-pre-line">
          {game.rules}
        </p>

        {/* Partage et ajout à la soirée sont remontés en haut de fiche : il ne
            reste ici que l'action principale. */}
        <button
          type="button"
          onClick={goBack}
          className="mt-8 inline-flex items-center gap-2 px-6 py-2 bg-brique text-creme font-titre text-xl rounded-full shadow-md hover:bg-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Retour aux jeux
        </button>
      </div>
    </m.article>
  );
}

export default GameDetail;
