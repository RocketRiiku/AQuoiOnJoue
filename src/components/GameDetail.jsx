import { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Users,
  UserCheck,
  Clock,
  Infinity as InfinityIcon,
  Package,
  Sparkles,
  GraduationCap,
  Plus,
  Check,
  Dices,
  Play,
  TriangleAlert
} from 'lucide-react';
import { ActionsObjet, BarreActions, Bouton, BoutonIcone } from './Bouton';
import GameThumb from './GameThumb';
import ShareButton from './ShareButton';
import { lienSignalement } from '../utils/contact';
import { kitDisponible } from './kit/registre';
import {
  formatDuration,
  formatIdealPlayers,
  formatMaterial,
  formatPlayers,
  formatTypes,
  messagePartage
} from '../utils/formatGame';

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

function GameDetail({
  game,
  goBack,
  onAutreJeu,
  onLancerKit,
  joueurs = null,
  dansSoiree = false,
  onBasculerSoiree
}) {
  const headingRef = useRef(null);
  const kitOuvrable = Boolean(onLancerKit) && kitDisponible(game);

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
    <article
      aria-labelledby="titre-jeu"
      className="anim-panneau bg-creme rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
    >
      {/* Actions portant sur le jeu affiché : icônes groupées en haut à
          droite, cf. docs/boutons.md. */}
      <div className="relative">
        <ActionsObjet>
          {onBasculerSoiree && (
            <BoutonIcone
              icone={dansSoiree ? Check : Plus}
              infobulle={dansSoiree ? 'Retirer de la soirée' : 'Ajouter à la soirée'}
              nomAccessible={
                dansSoiree
                  ? `Retirer ${game.title} de la soirée`
                  : `Ajouter ${game.title} à la soirée`
              }
              actif={dansSoiree}
              aria-pressed={dansSoiree}
              onClick={() => onBasculerSoiree(game)}
            />
          )}

          <ShareButton
            titre={`${game.title} — À quoi on joue ?`}
            texte={messagePartage(game, joueurs)}
            libelle="Partager ce jeu"
          />

          {/* En dernier : c'est l'action la moins fréquente du groupe, et la
              lecture va de la plus probable à la moins probable. */}
          <BoutonIcone
            icone={TriangleAlert}
            infobulle="Notifier une erreur"
            nomAccessible={`Notifier une erreur sur ${game.title}`}
            href={lienSignalement(game)}
          />
        </ActionsObjet>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
        <div className="w-32 sm:w-40 h-48 sm:h-60 self-center sm:self-start rounded-xl shadow-lg -rotate-2 shrink-0 overflow-hidden">
          <GameThumb game={game} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Le titre réserve la place des icônes du coin, qui le survolent :
              elles sont posées en absolu sur le panneau et ne poussent donc
              rien. Trois icônes de 36 px, deux écarts de 8 px et le retrait du
              coin font 140 px depuis le bord du panneau, dont 32 px déjà pris
              par le rembourrage — d'où 112 px à dégager.
              Seulement à partir de `sm` : en dessous, la mise en page passe en
              colonne et le titre descend sous la vignette, hors de leur portée.
              Sans ce retrait, « Avez-vous confiance ? » passait sous elles. */}
          <h2
            id="titre-jeu"
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl sm:text-4xl font-titre text-brique leading-tight sm:pr-28 focus:outline-none"
          >
            {game.title}
          </h2>
          <p className="text-ardoise font-texte text-lg mt-1 leading-snug">
            {game.description}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5">
            <Meta icon={Users} label="Joueurs" value={formatPlayers(game)} />
            {/* La fourchette idéale mérite sa ligne : elle répond à « on est
                six, est-ce que ça vaut le coup ? », là où « 3 à 12 » ne dit
                que ce qui est possible. */}
            <Meta icon={UserCheck} label="Idéal à" value={formatIdealPlayers(game)} />
            <Meta icon={Clock} label="Durée" value={formatDuration(game, joueurs)} />
            <Meta icon={Package} label="Matériel" value={formatMaterial(game)} />
            <Meta icon={Sparkles} label="Type" value={formatTypes(game)} />
            <Meta icon={GraduationCap} label="Niveau" value={game.level} />
            {/* Un fil rouge ne s'insère pas dans le programme comme les autres :
                il court en parallèle. On le dit ici, sans quoi « toute la
                soirée » en face de « Durée » reste énigmatique. */}
            {game.filRouge && (
              <Meta
                icon={InfinityIcon}
                label="Format"
                value="Fil rouge : se joue en fond, en parallèle des autres jeux"
              />
            )}
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

        <BarreActions>
          {/* Le principal unique de la vue, quand le jeu a son kit : c'est
              l'action que l'on vient chercher après avoir lu les règles. « Un
              autre jeu ? » lui cède donc la place (docs/boutons.md). */}
          {kitOuvrable && (
            <Bouton variante="principal" icone={Play} onClick={onLancerKit}>
              Lancer le jeu
            </Bouton>
          )}

          {onAutreJeu && (
            <Bouton
              variante={kitOuvrable ? 'secondaire' : 'principal'}
              icone={Dices}
              onClick={onAutreJeu}
            >
              Un autre jeu ?
            </Bouton>
          )}

          <Bouton
            variante={kitOuvrable || onAutreJeu ? 'secondaire' : 'principal'}
            icone={ArrowLeft}
            onClick={goBack}
          >
            Retour aux jeux
          </Bouton>
        </BarreActions>
      </div>
    </article>
  );
}

export default GameDetail;
