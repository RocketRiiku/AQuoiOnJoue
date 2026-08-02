import { useMemo, useReducer, useState } from 'react';
import { ArrowLeft, Pause as IconePause, Play, RotateCw, Volume2, VolumeX, X } from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
import Pastille from '../Pastille';
import EcranTour from './EcranTour';
import TableauScores from './TableauScores';
import { contenuDuJeu } from '../../data/lancerJeu';
import {
  composerPot,
  etatInitial,
  MANCHES,
  melangeAleatoire,
  MOTS_PAR_JOUEUR,
  motCourant,
  nomsEquipes,
  reducteur,
  scoreDuTour,
  totalEquipe,
  vainqueurs
} from '../../utils/troisFoisRien';

const EQUIPES_POSSIBLES = [2, 3, 4];

/**
 * Réglage d'avant-partie : l'effectif fixe la taille du pot, le nombre
 * d'équipes fixe la grille des scores. Rien d'autre n'est demandé — aucun
 * prénom à saisir, parce que taper huit prénoms sur un téléphone au milieu
 * d'une soirée coûte plus cher que ça ne rapporte.
 */
function Reglage({ game, mots, joueursConnus, onDemarrer, onQuitter, libelleRetour }) {
  const [joueurs, setJoueurs] = useState(joueursConnus ?? game.idealPlayersMin);
  const [equipes, setEquipes] = useState(2);

  const taillePot = Math.min(joueurs * MOTS_PAR_JOUEUR, mots.length);
  const potPlafonne = taillePot < joueurs * MOTS_PAR_JOUEUR;

  const pas = (delta) =>
    setJoueurs((n) => Math.min(game.maxPlayers, Math.max(game.minPlayers, n + delta)));

  return (
    <>
      <p className="text-ardoise font-texte text-lg">
        Trois manches sur les mêmes mots, {game.chronoTour} secondes par tour. Je tire le
        pot, je tiens le chrono et je compte les points.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <div>
          <p className="font-titre text-encre">Combien êtes-vous&nbsp;?</p>
          {/* Même contrôle que le filtre « Joueurs » de la liste : deux flèches
              et un nombre. C'est un réglage de formulaire, pas une action — il
              ne relève donc pas du système de boutons (docs/boutons.md). */}
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              aria-label="Moins de joueurs"
              onClick={() => pas(-1)}
              disabled={joueurs <= game.minPlayers}
              className="w-10 h-10 text-2xl text-orange font-bold leading-none disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-full"
            >
              &lt;
            </button>
            <span
              aria-live="polite"
              className="font-titre text-3xl text-encre tabular-nums w-10 text-center"
            >
              {joueurs}
            </span>
            <button
              type="button"
              aria-label="Plus de joueurs"
              onClick={() => pas(1)}
              disabled={joueurs >= game.maxPlayers}
              className="w-10 h-10 text-2xl text-orange font-bold leading-none disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-full"
            >
              &gt;
            </button>
            <span className="text-ardoise/80 text-sm">
              soit {taillePot} mots dans le pot
              {potPlafonne && ' (tout ce que j’ai en réserve)'}
            </span>
          </div>
        </div>

        <div role="group" aria-label="Nombre d’équipes">
          <p className="font-titre text-encre">Combien d’équipes&nbsp;?</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {EQUIPES_POSSIBLES.map((n) => (
              <Pastille key={n} actif={equipes === n} onClick={() => setEquipes(n)}>
                {n} équipes
              </Pastille>
            ))}
          </div>
        </div>
      </div>

      <BarreActions>
        <Bouton
          variante="principal"
          icone={Play}
          onClick={() =>
            onDemarrer(
              etatInitial({ pot: composerPot(mots, joueurs), equipes: nomsEquipes(equipes) })
            )
          }
        >
          Remplir le pot
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>
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
          Manche {etat.manche + 1} sur {MANCHES.length} — {manche.titre}
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
    <div className="mt-8">
      <p className="font-titre text-3xl sm:text-4xl text-brique text-center" role="status">
        {annonce}
      </p>
      {precision && (
        <p className="text-ardoise font-texte text-center mt-1">{precision}</p>
      )}
      <div className="mt-6 overflow-x-auto">
        <TableauScores
          etat={etat}
          montrerVainqueur={montrerVainqueur}
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
function Pause({ onReprendre, onRecommencer, onQuitter, libelleRetour, son, onBasculerSon }) {
  return (
    // Opaque, et non translucide : à 5 % de transparence le mot en cours
    // restait lisible derrière, et une pause ne doit pas donner la réponse.
    // Le voile déborde sur les côtés et le bas — le rembourrage du panneau —
    // mais s'arrête au titre du jeu, qui reste le repère de l'écran.
    <div className="absolute -inset-x-6 sm:-inset-x-10 -bottom-6 sm:-bottom-10 top-0 z-30 flex flex-col items-center justify-center gap-6 bg-creme px-6">
      <p className="font-titre text-4xl text-brique" role="status">
        Pause
      </p>
      <p className="text-ardoise font-texte text-center">
        Le chrono est arrêté. Le pot et les scores vous attendent.
      </p>
      <BarreActions className="mt-0 justify-center">
        <Bouton variante="principal" icone={Play} onClick={onReprendre}>
          Reprendre
        </Bouton>
      </BarreActions>
      <BarreActionsSecondaire className="mt-0 justify-center">
        {/* Le tic-tac des dix dernières secondes se coupe ici : un son qu'on ne
            peut pas éteindre finit par se retourner contre le jeu. */}
        <Bouton
          variante="discret"
          icone={son ? Volume2 : VolumeX}
          onClick={onBasculerSon}
          aria-pressed={son}
        >
          {son ? 'Couper le son' : 'Remettre le son'}
        </Bouton>
        <Bouton variante="discret" icone={RotateCw} onClick={onRecommencer}>
          Recommencer la partie
        </Bouton>
        <Bouton variante="discret" destructeur icone={X} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActionsSecondaire>
    </div>
  );
}

function Partie({ game, mots, depart, onQuitter, libelleRetour }) {
  const [etat, envoyer] = useReducer(reducteur, depart);
  const [enPause, setEnPause] = useState(false);
  const [son, setSon] = useState(true);

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
    <div className="relative">
      <EnTete
        etat={etat}
        manche={manche}
        onPause={etat.phase === 'tour' ? () => setEnPause(true) : null}
      />

      {etat.phase === 'pret' && (
        <div className="mt-10 text-center">
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
          <BarreActionsSecondaire className="justify-center">
            <Bouton variante="discret" destructeur icone={X} onClick={onQuitter}>
              {libelleRetour}
            </Bouton>
          </BarreActionsSecondaire>
        </div>
      )}

      {etat.phase === 'tour' && (
        <EcranTour
          mot={motCourant(etat)}
          secondes={game.chronoTour}
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
                : `Manche ${etat.manche + 2} — ${MANCHES[etat.manche + 1].titre}`}
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
        <Pause
          onReprendre={() => setEnPause(false)}
          onRecommencer={recommencer}
          onQuitter={onQuitter}
          libelleRetour={libelleRetour}
          son={son}
          onBasculerSon={() => setSon((v) => !v)}
        />
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
function KitTroisFoisRien({ game, joueurs, onQuitter, libelleRetour }) {
  const mots = useMemo(
    () => contenuDuJeu(game.slug, 'mot').map((ligne) => ligne.contenu),
    [game.slug]
  );
  const [depart, setDepart] = useState(null);

  return depart ? (
    <Partie
      game={game}
      mots={mots}
      depart={depart}
      onQuitter={onQuitter}
      libelleRetour={libelleRetour}
    />
  ) : (
    <Reglage
      game={game}
      mots={mots}
      joueursConnus={joueurs}
      onDemarrer={setDepart}
      onQuitter={onQuitter}
      libelleRetour={libelleRetour}
    />
  );
}

export default KitTroisFoisRien;
