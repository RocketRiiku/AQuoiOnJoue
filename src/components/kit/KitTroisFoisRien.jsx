import { useEffect, useId, useMemo, useReducer, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pause as IconePause,
  Play,
  RotateCw,
  ListPlus,
  Settings2,
  Trash2,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
import Compteur from './Compteur';
import EcranTour from './EcranTour';
import TableauScores from './TableauScores';
import DialoguePot from './DialoguePot';
import MenuPartie from './MenuPartie';
import { contenuDuJeu } from '../../data/lancerJeu';
import { ecrirePartie, effacerPartie, partieDuJeu } from '../../utils/partieEnCours';
import {
  composerPot,
  etatInitial,
  MANCHES,
  MOTS_PAR_JOUEUR,
  motCourant,
  nomsEquipes,
  reducteur,
  reprendre,
  scoreDuTour,
  totalEquipe,
  vainqueurs
} from '../../utils/troisFoisRien';
import { melangeAleatoire } from '../../utils/pioche';

/** Bornes des réglages. Larges, mais pas absurdes. */
const BORNES = { equipes: [2, 4], duree: [10, 180], motsParJoueur: [2, 12] };

/**
 * Au-delà, les équipes tombent à un joueur : personne à qui faire deviner.
 * Le maximum suit donc l'effectif au lieu d'être fixe.
 */
const maxEquipes = (joueurs) =>
  Math.max(BORNES.equipes[0], Math.min(BORNES.equipes[1], Math.floor(joueurs / 2)));

/**
 * Les colonnes du tableau des scores, dérivées des manches du jeu.
 *
 * `TableauScores` ne connaît plus `MANCHES` : c'est ici que les trois manches
 * deviennent trois colonnes, et le second client de la brique — un classement
 * sans manche — n'en passe aucune.
 */
const COLONNES = MANCHES.map((manche, i) => ({
  cle: manche.titre,
  libelle: `M${i + 1}`,
  libelleLong: `Manche ${i + 1} : ${manche.titre}`
}));

/**
 * L'état du jeu traduit en lignes de tableau.
 *
 * Le total et la mise en tête sont calculés ici, parce que c'est le jeu qui
 * sait ce que « mener » veut dire chez lui — le plus grand total, et non le
 * dernier debout comme chez les jeux à élimination.
 */
const lignesDeScore = (etat, montrerVainqueur) => {
  const enTete = montrerVainqueur ? vainqueurs(etat) : [];
  return etat.equipes.map((nom, i) => ({
    nom,
    cases: etat.scores[i],
    total: totalEquipe(etat, i),
    enTete: enTete.includes(i),
    // On ne retire un point que là où il y en a un : la correction porte sur la
    // manche en cours, pas sur celles déjà closes.
    retraitPossible: etat.scores[i][etat.manche] > 0
  }));
};

/**
 * Réglage d'avant-partie.
 *
 * L'essentiel tient en deux questions — combien de joueurs, combien d'équipes.
 * Le reste se déplie : durée d'un tour, papiers par joueur, noms des équipes.
 * Replié par défaut parce que les valeurs par défaut conviennent presque
 * toujours, et qu'une page de formulaire entre l'envie de jouer et la première
 * carte est le meilleur moyen de faire reposer le téléphone.
 *
 * Même motif que « Plus de filtres » et « Trier » : un bouton discret, une
 * grille qui passe de 0fr à 1fr, `inert` tant que c'est fermé.
 */
function Reglage({ game, mots, joueursConnus, onDemarrer, onQuitter, libelleRetour }) {
  const [joueurs, setJoueurs] = useState(joueursConnus ?? game.idealPlayersMin);
  const [nbEquipes, setNbEquipes] = useState(2);
  const [duree, setDuree] = useState(game.chronoTour);
  const [motsParJoueur, setMotsParJoueur] = useState(MOTS_PAR_JOUEUR);
  const [noms, setNoms] = useState(() => nomsEquipes(4));
  const [deplie, setDeplie] = useState(false);
  const [potChoisi, setPotChoisi] = useState(null);
  // `null` = fermée ; sinon, la liste avec laquelle la modale s'est ouverte.
  // Le tirage se fait au moment du clic et pas à chaque rendu, sans quoi les
  // mots changeraient sous les yeux à la moindre frappe ailleurs.
  const [editionPot, setEditionPot] = useState(null);
  const idPanneau = useId();

  const tailleTiree = Math.min(joueurs * motsParJoueur, mots.length);
  const taillePot = potChoisi ? potChoisi.length : tailleTiree;
  const potPlafonne = !potChoisi && tailleTiree < joueurs * motsParJoueur;

  // Changer l'effectif ou le nombre de papiers rebat les cartes : garder une
  // liste taillée pour six joueurs alors qu'on vient d'en annoncer douze
  // tromperait sur ce qui va être joué.
  const rejouerLeTirage = (maj) => {
    setPotChoisi(null);
    maj();
  };

  // Réduire l'effectif peut rendre le nombre d'équipes intenable : on l'affiche
  // ramené dans les clous, sans écraser le choix — remonter les joueurs le
  // restitue. Valeur dérivée plutôt qu'état corrigé après coup.
  const equipesTenables = Math.min(nbEquipes, maxEquipes(joueurs));

  const parEquipe = [
    Math.floor(joueurs / equipesTenables),
    Math.ceil(joueurs / equipesTenables)
  ];
  const repartition =
    parEquipe[0] === parEquipe[1]
      ? `${parEquipe[0]} joueurs`
      : `${parEquipe[0]} à ${parEquipe[1]} joueurs`;

  // Un nom laissé vide retombe sur « Équipe n » : mieux vaut un nom générique
  // qu'une colonne sans en-tête dans le tableau des scores.
  const nomsRetenus = nomsEquipes(equipesTenables).map(
    (defaut, i) => noms[i]?.trim() || defaut
  );

  const renommer = (index, valeur) =>
    setNoms((actuels) => actuels.map((n, i) => (i === index ? valeur : n)));

  return (
    <>
      {/* Le chapô du catalogue, et rien de plus. Annoncer que le site tient le
          chrono et compte les points décrivait l'évidence à qui vient de lire
          les règles — et la durée se règle deux lignes plus bas. */}
      <p className="text-ardoise font-texte text-lg">{game.description}</p>

      <div className="mt-6 flex flex-col gap-5">
        <div>
          <p className="font-titre text-encre">Combien êtes-vous&nbsp;?</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <Compteur
              label="nombre de joueurs"
              valeur={joueurs}
              min={game.minPlayers}
              max={game.maxPlayers}
              onChange={(n) => rejouerLeTirage(() => setJoueurs(n))}
            />
            <span className="text-ardoise/80 text-sm">
              soit {taillePot} mots dans le pot
              {potPlafonne && ' (tout ce que j’ai en réserve)'}
            </span>
          </div>
        </div>

        <div>
          <p className="font-titre text-encre">Combien d’équipes&nbsp;?</p>
          {/* Même contrôle que l'effectif juste au-dessus : deux réglages de
              même nature se règlent du même geste. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <Compteur
              label="nombre d’équipes"
              valeur={equipesTenables}
              min={BORNES.equipes[0]}
              max={maxEquipes(joueurs)}
              onChange={setNbEquipes}
            />
            <span className="text-ardoise/80 text-sm">soit {repartition} par équipe</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Bouton
          variante="discret"
          icone={Settings2}
          iconeApres={deplie ? ChevronUp : ChevronDown}
          onClick={() => setDeplie((v) => !v)}
          aria-expanded={deplie}
          aria-controls={idPanneau}
        >
          Paramètres avancés
        </Bouton>

        <div
          id={idPanneau}
          inert={!deplie}
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
            deplie ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-4 bg-paille/60 rounded-2xl px-4 py-4 flex flex-col gap-5">
              <div>
                <p className="font-titre text-encre">Durée d’un tour</p>
                <Compteur
                  label="durée d’un tour"
                  valeur={duree}
                  unite="s"
                  pas={5}
                  min={BORNES.duree[0]}
                  max={BORNES.duree[1]}
                  onChange={setDuree}
                />
              </div>

              <div>
                <p className="font-titre text-encre">Papiers par joueur</p>
                <Compteur
                  label="papiers par joueur"
                  valeur={motsParJoueur}
                  min={BORNES.motsParJoueur[0]}
                  max={BORNES.motsParJoueur[1]}
                  onChange={(n) => rejouerLeTirage(() => setMotsParJoueur(n))}
                />
                {/* `discret` : c'est une action auxiliaire d'un panneau déjà
                    replié, et la taille d'un `secondaire` y écrasait tout le
                    reste des réglages. */}
                <Bouton
                  variante="discret"
                  icone={ListPlus}
                  className="mt-3"
                  onClick={() =>
                    setEditionPot(potChoisi ?? composerPot(mots, joueurs, { motsParJoueur }))
                  }
                >
                  Voir et modifier les mots
                </Bouton>
              </div>

              <div>
                <p className="font-titre text-encre">Noms des équipes</p>
                <div className="flex flex-col gap-2 mt-2">
                  {nomsEquipes(equipesTenables).map((defaut, i) => (
                    <label key={defaut} className="flex items-center gap-3 text-sm">
                      <span className="text-ardoise/80 w-20 shrink-0">Équipe {i + 1}</span>
                      <input
                        type="text"
                        value={noms[i] ?? ''}
                        placeholder={defaut}
                        maxLength={24}
                        onChange={(e) => renommer(i, e.target.value)}
                        className="flex-1 min-w-0 rounded-full bg-white/80 px-3 py-1.5 text-encre placeholder:text-ardoise/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BarreActions>
        <Bouton
          variante="principal"
          icone={Play}
          onClick={() =>
            onDemarrer({
              etat: etatInitial({
                pot: potChoisi ?? composerPot(mots, joueurs, { motsParJoueur }),
                equipes: nomsRetenus
              }),
              reglages: { duree, motsParJoueur }
            })
          }
        >
          Remplir le pot
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>

      {editionPot && (
        <DialoguePot
          mots={editionPot}
          onNouveauTirage={() => composerPot(mots, joueurs, { motsParJoueur })}
          onFermer={() => setEditionPot(null)}
          onValider={(liste) => {
            setPotChoisi(liste);
            setEditionPot(null);
          }}
        />
      )}
    </>
  );
}

/**
 * Bandeau de progression, et la pause.
 *
 * Les trois manches sont de courts segments gris, et non une barre pleine
 * largeur : à cent pixels du chrono, deux barres de même épaisseur et de même
 * teinte demandaient un temps d'arrêt pour savoir laquelle disait quoi.
 * L'orange plein reste au chrono, seule information vivante de l'écran.
 *
 * La consigne de la manche est rappelée pendant le tour : « ON PARLE » suffit
 * à qui connaît le jeu, pas à qui le découvre.
 */
function EnTete({ etat, manche, onPause }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70">
          Manche {etat.manche + 1} sur {MANCHES.length} : {manche.titre}
        </p>
        <ol className="flex gap-1.5 mt-1.5" aria-hidden="true">
          {MANCHES.map((m, i) => (
            <li
              key={m.titre}
              className={`h-1 w-7 rounded-full transition-colors ${
                i <= etat.manche ? 'bg-ardoise' : 'bg-ardoise/20'
              }`}
            />
          ))}
        </ol>
        {etat.phase === 'tour' && (
          <p className="text-ardoise font-texte text-sm mt-2 max-w-md">{manche.consigne}</p>
        )}
      </div>

      {onPause && (
        <button
          type="button"
          onClick={onPause}
          aria-label="Mettre le jeu en pause"
          className="w-11 h-11 shrink-0 rounded-full border border-encre/20 bg-white/70 flex items-center justify-center text-encre hover:border-orange hover:text-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
        >
          <IconePause className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/**
 * Écran de bascule entre deux moments : fin de tour, fin de manche, fin de
 * partie. Tous portent la même charpente — une annonce en grand, la grille des
 * scores, une seule action évidente — pour qu'on ne réapprenne pas l'écran à
 * chaque transition.
 */
function Bilan({ annonce, precision, etat, montrerVainqueur, onAjuster, onReinitialiser, children }) {
  return (
    // Centré : les trois transitions — fin de tour, fin de manche, fin de partie
    // — tiennent en une annonce, une grille et un bouton, et laissaient le bas du
    // panneau vide.
    <div className="flex-1 flex flex-col justify-center py-4">
      <p className="font-titre text-3xl sm:text-4xl text-brique text-center" role="status">
        {annonce}
      </p>
      {precision && (
        <p className="text-ardoise font-texte text-center mt-1">{precision}</p>
      )}
      <div className="mt-6 overflow-x-auto">
        <TableauScores
          lignes={lignesDeScore(etat, montrerVainqueur)}
          colonnes={COLONNES}
          // La manche en cours ressort du reste — sauf à la fin, où il n'y en a
          // plus.
          colonneActive={montrerVainqueur ? null : etat.manche}
          legende="Scores par équipe et par manche"
          onAjuster={onAjuster}
          onReinitialiser={onReinitialiser}
        />
      </div>
      <p className="text-ardoise/60 text-xs text-center mt-2">
        Un point de trop&nbsp;? Corrigez-le ici, la partie continue.
      </p>
      {children}
    </div>
  );
}

/** Voile de pause : le chrono s'arrête, rien ne se perd. */
function Pause({ onReprendre }) {
  return (
    // Opaque, et non translucide : à 5 % de transparence le mot en cours
    // restait lisible derrière, et une pause ne doit pas donner la réponse.
    // Le voile déborde sur les côtés et le bas — le rembourrage du panneau —
    // mais s'arrête au titre du jeu, si bien que le menu « ⋯ » de l'en-tête
    // reste atteignable par-dessus.
    <div className="absolute -inset-x-6 sm:-inset-x-10 -bottom-6 sm:-bottom-10 top-0 z-30 flex flex-col items-center justify-center gap-6 bg-creme px-6">
      <p className="font-titre text-4xl text-brique" role="status">
        Pause
      </p>
      <p className="text-ardoise font-texte text-center max-w-xs">
        Le chrono est arrêté. Le pot et les scores vous attendent.
      </p>
      {/* Un seul bouton : reprendre. Couper le son, recommencer, quitter et
          abandonner sont dans le menu de l'en-tête, qui reste visible au-dessus
          du voile — les réunir là a justement servi à ne plus faire réapparaître
          quatre boutons dès qu'on met le jeu en pause. */}
      <BarreActions className="mt-0 justify-center">
        <Bouton variante="principal" icone={Play} onClick={onReprendre}>
          Reprendre
        </Bouton>
      </BarreActions>
    </div>
  );
}

function Partie({
  game,
  mots,
  depart,
  reglages,
  ancreMenu,
  onQuitter,
  onAbandonner,
  libelleRetour
}) {
  const [etat, envoyer] = useReducer(reducteur, depart);
  const [enPause, setEnPause] = useState(false);
  const [son, setSon] = useState(true);

  /**
   * La partie est écrite à chaque changement.
   *
   * On touche la bannière du site par erreur, on répond à un message, l'onglet
   * est recyclé : sans cela, une demi-heure de jeu disparaît sur un geste
   * involontaire. Une partie terminée, elle, s'efface — il n'y a plus rien à
   * reprendre, et la proposer au prochain lancement serait déroutant.
   */
  useEffect(() => {
    if (etat.phase === 'fin') effacerPartie();
    else ecrirePartie({ slug: game.slug, titre: game.title, etat, reglages });
  }, [etat, game.slug, game.title, reglages]);

  const manche = MANCHES[etat.manche];
  const equipe = etat.equipes[etat.equipeActive];
  const derniereManche = etat.manche === MANCHES.length - 1;
  const gagnants = vainqueurs(etat);

  const ajuster = (equipeIndex, delta) =>
    envoyer({ type: 'ajusterScore', equipe: equipeIndex, delta });
  const reinitialiser = (equipeIndex) =>
    envoyer({ type: 'reinitialiserEquipe', equipe: equipeIndex });

  // Un pot neuf, de la même taille : rejouer les mêmes mots n'aurait aucun
  // intérêt une fois qu'ils sont tous connus.
  const recommencer = () => {
    setEnPause(false);
    envoyer({ type: 'rejouer', pot: melangeAleatoire(mots).slice(0, depart.pot.length) });
  };

  return (
    <div className="relative flex flex-col flex-1">
      {/* Les actions rares dans le menu de l'en-tête : recommencer et couper le
          son servent une fois par partie, quitter et abandonner une seule fois.
          Elles encombraient l'écran d'annonce d'équipe et le voile de pause, où
          deux boutons voisins dont l'un fait tout perdre se confondaient. */}
      <MenuPartie
        ancre={ancreMenu}
        slug={game.slug}
        libelleRetour={libelleRetour}
        onQuitter={onQuitter}
        onAbandonner={onAbandonner}
        extras={[
          {
            cle: 'recommencer',
            libelle: 'Recommencer la partie',
            icone: RotateCw,
            onClick: recommencer
          },
          {
            cle: 'son',
            libelle: son ? 'Couper le son' : 'Remettre le son',
            icone: son ? Volume2 : VolumeX,
            onClick: () => setSon((v) => !v)
          }
        ]}
      />

      <EnTete
        etat={etat}
        manche={manche}
        onPause={etat.phase === 'tour' ? () => setEnPause(true) : null}
      />

      {etat.phase === 'pret' && (
        // Centré dans la hauteur libre : le nom de l'équipe et son unique bouton
        // restaient calés en haut d'un panneau deux fois plus grand qu'eux.
        <div className="flex-1 flex flex-col justify-center text-center py-6">
          <p className="font-titre text-4xl sm:text-5xl text-brique leading-tight">
            {equipe}
          </p>
          <p className="text-ardoise font-texte text-lg mt-3 max-w-md mx-auto">
            {manche.consigne}
          </p>
          <p className="text-ardoise/70 text-sm mt-2">
            {etat.restants.length} mot{etat.restants.length > 1 ? 's' : ''} dans le pot
          </p>
          <BarreActions className="justify-center">
            <Bouton
              variante="principal"
              icone={Play}
              onClick={() => envoyer({ type: 'commencer' })}
            >
              C’est parti&nbsp;!
            </Bouton>
          </BarreActions>
        </div>
      )}

      {etat.phase === 'tour' && (
        <EcranTour
          mot={motCourant(etat)}
          secondes={reglages.duree}
          restants={etat.restants.length}
          trouves={scoreDuTour(etat)}
          cleTour={`${etat.manche}-${etat.equipeActive}`}
          peutAnnuler={Boolean(etat.dernier)}
          enPause={enPause}
          son={son}
          onTrouve={() => envoyer({ type: 'trouve' })}
          onPasse={() => envoyer({ type: 'passe' })}
          onAnnuler={() => envoyer({ type: 'annuler' })}
          onTempsEcoule={() => envoyer({ type: 'tempsEcoule' })}
        />
      )}

      {etat.phase === 'bilanTour' && (
        <Bilan
          annonce="Temps écoulé"
          precision={`${equipe} : ${etat.scores[etat.equipeActive][etat.manche]} mot${
            etat.scores[etat.equipeActive][etat.manche] > 1 ? 's' : ''
          } sur ce tour.`}
          etat={etat}
          onAjuster={ajuster}
          onReinitialiser={reinitialiser}
        >
          <BarreActions className="justify-center">
            <Bouton
              variante="principal"
              icone={Play}
              onClick={() => envoyer({ type: 'tourSuivant' })}
            >
              {etat.equipes[(etat.equipeActive + 1) % etat.equipes.length]}, à vous&nbsp;!
            </Bouton>
          </BarreActions>
        </Bilan>
      )}

      {etat.phase === 'bilanManche' && (
        <Bilan
          annonce="Le pot est vide"
          precision={
            derniereManche
              ? 'C’était la dernière manche.'
              : `Les mêmes mots repartent pour la manche ${etat.manche + 2}.`
          }
          etat={etat}
          onAjuster={ajuster}
          onReinitialiser={reinitialiser}
        >
          <BarreActions className="justify-center">
            <Bouton
              variante="principal"
              icone={Play}
              onClick={() => envoyer({ type: 'mancheSuivante' })}
            >
              {derniereManche
                ? 'Voir le résultat'
                : `Manche ${etat.manche + 2} : ${MANCHES[etat.manche + 1].titre}`}
            </Bouton>
          </BarreActions>
        </Bilan>
      )}

      {etat.phase === 'fin' && (
        <Bilan
          annonce={
            gagnants.length > 1
              ? 'Égalité parfaite'
              : `${etat.equipes[gagnants[0]]} l’emporte`
          }
          precision={`${totalEquipe(etat, gagnants[0])} mots devinés.`}
          etat={etat}
          montrerVainqueur
          onAjuster={ajuster}
          onReinitialiser={reinitialiser}
        >
          <BarreActions className="justify-center">
            <Bouton variante="principal" icone={RotateCw} onClick={recommencer}>
              Rejouer
            </Bouton>
            <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
              {libelleRetour}
            </Bouton>
          </BarreActions>
        </Bilan>
      )}

      {enPause && (
        <Pause onReprendre={() => setEnPause(false)} />
      )}
    </div>
  );
}

/**
 * Kit de « Trois fois rien ».
 *
 * Deux temps distincts, et donc deux composants : on règle la partie, puis on
 * la joue. Monter le déroulé seulement une fois le pot constitué évite d'avoir
 * à traiter un état « pas encore commencé » dans le réducteur, qui reste ainsi
 * total — chacune de ses actions a un sens à tout moment.
 */
/**
 * Écran d'accueil quand une partie dort en mémoire.
 *
 * Poser la question plutôt que trancher : reprendre d'office empêcherait d'en
 * lancer une neuve, et repartir de zéro d'office effacerait une soirée entière
 * sans prévenir. Le résumé donne de quoi choisir sans avoir à se souvenir.
 */
function Reprise({ partie, onReprendre, onNouvelle, onAbandonner, onQuitter, libelleRetour }) {
  const { etat } = partie;
  const totaux = etat.equipes.map((nom, i) => `${nom} ${totalEquipe(etat, i)}`).join(' · ');

  return (
    <div className="flex-1 flex flex-col justify-center py-4">
      <p className="font-titre text-3xl text-brique">Une partie est en cours</p>
      <p className="text-ardoise font-texte text-lg mt-2">
        Manche {etat.manche + 1} sur {MANCHES.length}, {etat.restants.length} mot
        {etat.restants.length > 1 ? 's' : ''} encore dans le pot.
      </p>
      <p className="text-ardoise/80 mt-1">{totaux}</p>

      <BarreActions>
        <Bouton variante="principal" icone={Play} onClick={onReprendre}>
          Reprendre la partie
        </Bouton>
        <Bouton variante="secondaire" icone={RotateCw} onClick={onNouvelle}>
          Nouvelle partie
        </Bouton>
      </BarreActions>
      <BarreActionsSecondaire>
        <Bouton variante="discret" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
        {/* C'est ici qu'on décide du sort de la partie enregistrée : l'abandon
            doit s'y trouver. Enfoui dans la pause, il obligeait à reprendre la
            partie pour pouvoir la supprimer. */}
        <Bouton variante="discret" destructeur icone={Trash2} onClick={onAbandonner}>
          Abandonner la partie
        </Bouton>
      </BarreActionsSecondaire>
    </div>
  );
}

function KitTroisFoisRien({
  game,
  joueurs,
  ancreMenu,
  onQuitter,
  onRetourAccueil,
  libelleRetour
}) {
  const mots = useMemo(
    () => contenuDuJeu(game.slug, 'mot').map((ligne) => ligne.contenu),
    [game.slug]
  );

  // Lue une seule fois au montage : la partie s'écrit ensuite en continu, et
  // relire le stockage à chaque rendu proposerait de reprendre celle qu'on est
  // justement en train de jouer.
  const [sauvegarde] = useState(() => partieDuJeu(game.slug));
  const [partie, setPartie] = useState(null);
  const [choixFait, setChoixFait] = useState(!sauvegarde);

  if (!choixFait) {
    return (
      <Reprise
        partie={sauvegarde}
        libelleRetour={libelleRetour}
        onQuitter={onQuitter}
        onAbandonner={() => {
          effacerPartie();
          onRetourAccueil();
        }}
        onReprendre={() => {
          setPartie({
            etat: reprendre(sauvegarde.etat),
            reglages: sauvegarde.reglages ?? {
              duree: game.chronoTour,
              motsParJoueur: MOTS_PAR_JOUEUR
            }
          });
          setChoixFait(true);
        }}
        onNouvelle={() => {
          effacerPartie();
          setChoixFait(true);
        }}
      />
    );
  }

  return partie ? (
    <Partie
      game={game}
      mots={mots}
      depart={partie.etat}
      reglages={partie.reglages}
      ancreMenu={ancreMenu}
      onQuitter={onQuitter}
      onAbandonner={() => {
        effacerPartie();
        onRetourAccueil();
      }}
      libelleRetour={libelleRetour}
    />
  ) : (
    <Reglage
      game={game}
      mots={mots}
      joueursConnus={joueurs}
      onDemarrer={setPartie}
      onQuitter={onQuitter}
      libelleRetour={libelleRetour}
    />
  );
}

export default KitTroisFoisRien;
