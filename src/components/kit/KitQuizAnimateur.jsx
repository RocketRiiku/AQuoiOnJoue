import { useEffect, useId, useMemo, useReducer, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Flag,
  Pause as IconePause,
  PencilLine,
  Play,
  RotateCw,
  Settings2,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
import BandeauScores, { DialogueScores } from './BandeauScores';
import CarteTiree from './CarteTiree';
import Chrono from './Chrono';
import Compteur from './Compteur';
import LigneJoueur from './LigneJoueur';
import MenuPartie from './MenuPartie';
import Progression from './Progression';
import TableauScores from './TableauScores';
import { contenuDuJeu } from '../../data/lancerJeu';
import { libelles } from '../../utils/pioche';
import { ecrirePartie, effacerPartie, partieDuJeu } from '../../utils/partieEnCours';
import { enJeu, nomsJoueurs, vainqueurs } from '../../utils/feuilleDeMatch';
import {
  avancement,
  baremeDe,
  carteCourante,
  epuise,
  etatInitial,
  reducteur,
  reglesDe,
  reprendre
} from '../../utils/quizAnimateur';

const pluriel = (n, mot) => `${n} ${mot}${Math.abs(n) > 1 ? 's' : ''}`;

/** « Joueur 1 », « Joueur 1 et Joueur 3 », « Joueur 1, Joueur 3 et Joueur 5 ». */
function listeFr(noms) {
  if (noms.length <= 1) return noms.join('');
  return `${noms.slice(0, -1).join(', ')} et ${noms.at(-1)}`;
}

/**
 * L'état traduit en lignes de `TableauScores`, une valeur par joueur.
 *
 * Aucune colonne : la brique se réduit alors à un classement, la forme dont la
 * feuille de match se sert déjà. Troisième client, et toujours sans un import de
 * jeu — c'est ce qui empêche le couplage de revenir.
 */
const lignesDeScore = (etat) => {
  const meilleurs = vainqueurs(etat);
  // Personne en tête quand tout le monde est à égalité : au premier tour,
  // souligner cinq joueurs sur cinq n'apprend rien.
  const enTete = meilleurs.length === enJeu(etat).length ? [] : meilleurs;
  return etat.joueurs.map((nom, i) => ({
    nom,
    total: etat.scores[i],
    enTete: enTete.includes(i),
    retraitPossible: etat.scores[i] > 0
  }));
};

/** Qui mène, en une ligne. Les six jeux marquent des points : pas de seuil à lire. */
function resumeDesScores(lignes, unite) {
  const meneurs = lignes.filter((l) => l.enTete);
  if (meneurs.length === 0 || meneurs[0].total === 0) return { texte: 'Scores à zéro' };
  return {
    texte: `${meneurs.length > 1 ? 'Égalité' : meneurs[0].nom} · ${pluriel(
      meneurs[0].total,
      unite
    )}`,
    couronne: true
  };
}

/**
 * Écran d'avant-partie : combien êtes-vous, et le rappel de la règle.
 *
 * Repris de la feuille de match, pour la même raison : on ne dessine pas N lignes
 * sans N, et l'effectif arrive pré-rempli par le filtre « Joueurs » de la liste.
 * Le défileur s'en passe à raison — lui n'a personne à compter.
 */
function Reglage({ game, regles, joueursConnus, onDemarrer, onQuitter, libelleRetour }) {
  const [nombre, setNombre] = useState(
    Math.min(Math.max(joueursConnus ?? game.idealPlayersMin, game.minPlayers), game.maxPlayers)
  );
  const [noms, setNoms] = useState(() => []);
  const [deplie, setDeplie] = useState(false);
  const idPanneau = useId();

  const nomsRetenus = nomsJoueurs(nombre).map((defaut, i) => noms[i]?.trim() || defaut);

  const renommer = (index, valeur) =>
    setNoms((actuels) => {
      const suite = [...actuels];
      suite[index] = valeur;
      return suite;
    });

  return (
    <div className="flex-1 flex flex-col justify-center py-4">
      <p className="text-ardoise font-texte text-lg">{regles.rappel}</p>

      <div className="mt-8">
        <p className="font-titre text-encre">Combien êtes-vous&nbsp;?</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <Compteur
            label="nombre de joueurs"
            valeur={nombre}
            min={game.minPlayers}
            max={game.maxPlayers}
            onChange={setNombre}
          />
          <span className="text-ardoise/80 text-sm">
            {/* Celui qui lit ne joue pas : c'est le principe de la famille, et
                l'effectif saisi est bien celui de la table entière. */}
            lecteur compris
          </span>
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
            <div className="mt-4 bg-paille/60 rounded-2xl px-4 py-4">
              <p className="font-titre text-encre">Noms des joueurs</p>
              <p className="text-ardoise/70 text-sm mt-0.5">
                Facultatif&nbsp;: sans prénom, on garde « Joueur&nbsp;n ».
              </p>
              <div className="flex flex-col gap-2 mt-3">
                {nomsJoueurs(nombre).map((defaut, i) => (
                  <label key={defaut} className="flex items-center gap-3 text-sm">
                    <span className="text-ardoise/80 w-20 shrink-0">Joueur {i + 1}</span>
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

      <BarreActions className="mt-10">
        <Bouton
          variante="principal"
          icone={Play}
          onClick={() => onDemarrer(nomsRetenus)}
        >
          Première carte
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>
    </div>
  );
}

/**
 * L'aperçu du barème, avant de valider.
 *
 * Repris de la feuille de match, où il a été écrit pour la même raison : rien ne
 * disait ce que « Compter les points » allait faire. Les gains sont groupés par
 * valeur, décroissants, et suivent la sélection au fil des tapes.
 */
function ApercuGains({ gains, joueurs, unite }) {
  const parValeur = new Map();
  for (const { joueur, points } of gains) {
    if (points === 0) continue;
    if (!parValeur.has(points)) parValeur.set(points, []);
    parValeur.get(points).push(joueurs[joueur]);
  }

  if (parValeur.size === 0) {
    return (
      <p className="text-ardoise/80 text-sm text-center">
        Personne ne marque de {unite} sur cette carte.
      </p>
    );
  }

  const groupes = [...parValeur.entries()].sort((a, b) => b[0] - a[0]);

  return (
    <p className="text-sm text-center text-encre" aria-live="polite">
      {groupes.map(([points, noms], i) => (
        <span key={points}>
          {i > 0 && <span className="text-ardoise/40 mx-1.5">·</span>}
          <span className="text-ardoise/80">{listeFr(noms)}</span>{' '}
          <span className="font-titre text-brique">
            {points > 0 ? '+' : ''}
            {points}
          </span>
        </span>
      ))}
    </p>
  );
}

/**
 * Qui marque, et combien.
 *
 * **Deux formes, et le barème décide laquelle.** Quatre de ces jeux donnent un
 * point à qui trouve : on tape la ligne, comme dans la feuille de match, parce
 * que c'est le geste du jeu répété cent fois dans la soirée (docs/boutons.md).
 * Sorry mon french en donne un ou deux, et une seconde tape suffit à le dire.
 *
 * Le Fitch est à part et il fallait l'admettre : chacun compte ses erreurs
 * trouvées moins ses fausses alertes, soit un solde de −5 à +5 par joueur. Ce
 * n'est plus une désignation mais une **saisie de nombre**, et le compteur
 * `< n >` est le contrôle que le site réserve à ça. Le forcer dans une ligne à
 * taper aurait demandé cinq tapes par joueur, et rien pour le négatif.
 */
function Designation({ etat, regles, bareme, unite, onValider }) {
  const [tapes, setTapes] = useState(() => etat.joueurs.map(() => 0));

  // Chaque carte repart d'une ardoise vide : les points du tour d'avant sont
  // déjà comptés.
  useEffect(() => setTapes(etat.joueurs.map(() => 0)), [etat.index, etat.joueurs]);

  const poser = (joueur, valeur) =>
    setTapes((actuels) => actuels.map((v, i) => (i === joueur ? valeur : v)));

  // Une tape de plus, et on repart de zéro passé le maximum : c'est ce qui rend
  // le deuxième point de Sorry mon french atteignable sans second contrôle.
  const taper = (joueur) => poser(joueur, tapes[joueur] >= bareme.max ? 0 : tapes[joueur] + 1);

  const gains = etat.joueurs.map((_, joueur) => ({ joueur, points: tapes[joueur] }));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70 mt-4 text-center">
        {regles.question}
      </p>
      {bareme.aide && (
        <p className="text-ardoise/80 font-texte text-xs mt-0.5 max-w-md mx-auto text-center">
          {bareme.aide}
        </p>
      )}

      {/* La liste défile dans sa propre zone, et son plafond est en hauteur
          d'écran.
          `flex-1` ne suffisait pas : rien dans la charpente du site ne donne au
          panneau d'un kit une hauteur définie, si bien qu'un `flex-1` grandit
          avec son contenu au lieu de se partager une place finie — et à cinq
          joueurs, le bouton passait sous la ligne de flottaison. Le `svh` borne
          ce que la liste peut réclamer, comme il borne la carte juste au-dessus.
          À revoir le jour où le panneau aura une hauteur propre : tout ceci
          redeviendra alors inutile. */}
      <ul className="flex-1 min-h-0 max-h-[18svh] overflow-y-auto flex flex-col gap-2 mt-3 list-none">
        {etat.joueurs.map((nom, joueur) => (
          <li key={nom}>
            {bareme.saisie ? (
              <div className="w-full flex items-center gap-3 rounded-2xl bg-paille px-4 py-2">
                <span className="font-titre text-xl flex-1 min-w-0 truncate text-encre">
                  {nom}
                </span>
                <Compteur
                  label={`points de ${nom}`}
                  valeur={tapes[joueur]}
                  min={bareme.min}
                  max={bareme.max}
                  onChange={(v) => poser(joueur, v)}
                />
              </div>
            ) : (
              <LigneJoueur
                nom={nom}
                selectionnable
                actif={tapes[joueur] > 0}
                nomAccessible={
                  tapes[joueur] > 0
                    ? `${nom}, ${pluriel(tapes[joueur], unite)}`
                    : `${nom} a trouvé`
                }
                onClick={() => taper(joueur)}
                aDroite={
                  // Le second point ne se voit nulle part ailleurs : sans ce
                  // chiffre, deux tapes et une seule se ressemblent.
                  bareme.max > 1 && tapes[joueur] > 0 ? (
                    <span className="font-titre text-lg text-brique tabular-nums" aria-hidden="true">
                      +{tapes[joueur]}
                    </span>
                  ) : undefined
                }
              />
            )}
          </li>
        ))}
      </ul>

      <div className="mt-auto max-w-sm w-full mx-auto">
        <div className="mt-3">
          <ApercuGains gains={gains} joueurs={etat.joueurs} unite={unite} />
        </div>

        {/* Un seul geste en bas, pleine largeur, toujours au même endroit.
            « Précédente » et « Masquer » ont vécu ici : la première sert avant la
            révélation, où elle est déjà, et la seconde est devenue la bascule de
            la carte. Deux rangées de moins, et autant de rendu aux joueurs à
            désigner — c'est ce qui manquait pour que l'écran tienne. */}
        <div className="mt-3">
          <Bouton
            variante="principal"
            icone={Check}
            className="w-full"
            onClick={() => onValider(gains.filter((g) => g.points !== 0))}
          >
            Compter les points
          </Bouton>
        </div>
      </div>
    </div>
  );
}

/** Le classement, et ce qu'on en fait. */
function Classement({ etat, unite, onRejouer, onQuitter, libelleRetour }) {
  const gagnants = vainqueurs(etat);

  return (
    <div className="flex-1 flex flex-col justify-center py-4">
      <p className="font-titre text-3xl sm:text-4xl text-brique text-center" role="status">
        {gagnants.length > 1 ? 'Égalité parfaite' : `${etat.joueurs[gagnants[0]]} l’emporte`}
      </p>
      <p className="text-ardoise font-texte text-center mt-1">
        {pluriel(etat.scores[gagnants[0]], unite)}.
      </p>

      <div className="mt-6 overflow-x-auto">
        <TableauScores
          lignes={lignesDeScore(etat)}
          legende={`Classement par joueur, en ${unite}s`}
        />
      </div>

      <BarreActions className="justify-center">
        <Bouton variante="principal" icone={RotateCw} onClick={onRejouer}>
          Rejouer
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>
    </div>
  );
}

/**
 * La partie en cours : une carte, sa réponse, et les points.
 *
 * Un tour se lit en deux temps, et c'est `revele` qui fait la coupure. Avant, la
 * carte occupe la place et le seul geste est de révéler — la table cherche. Après,
 * la réponse s'affiche et l'écran devient une liste de joueurs — la table compte.
 * Empiler les deux aurait donné la réponse en même temps que la question.
 */
function Partie({ game, regles, depart, ancreMenu, onQuitter, onAbandonner, libelleRetour }) {
  const [etat, envoyer] = useReducer(reducteur, depart);
  const [scores, setScores] = useState(null);
  const [son, setSon] = useState(true);
  const [chronoLance, setChronoLance] = useState(false);
  const bareme = baremeDe(regles);
  const unite = game.scoring === 'elimination' ? 'avertissement' : 'point';
  const carte = carteCourante(etat);
  const mots = useMemo(() => libelles(etat.pile[0]?.type), [etat.pile]);
  const suivi = avancement(etat, regles.manches);

  // Chaque carte repart avec son chrono à zéro : la minute de Soyez logique vaut
  // pour l'énigme affichée, pas pour la soirée.
  useEffect(() => setChronoLance(false), [etat.index, etat.revele]);

  // Écrite à chaque geste : une soirée de points se perd sur un onglet recyclé.
  // Une partie close s'efface — il n'y a plus rien à reprendre.
  useEffect(() => {
    if (etat.phase === 'fin') effacerPartie();
    else ecrirePartie({ slug: game.slug, titre: game.title, etat });
  }, [etat, game.slug, game.title]);

  const menu = (
    <MenuPartie
      ancre={ancreMenu}
      slug={game.slug}
      libelleRetour={libelleRetour}
      onQuitter={onQuitter}
      onAbandonner={onAbandonner}
      extras={[
        {
          cle: 'corriger',
          libelle: 'Corriger les scores',
          icone: PencilLine,
          onClick: () => setScores({ corrige: true })
        },
        {
          cle: 'remelanger',
          libelle: 'Remélanger la pile',
          icone: RotateCw,
          onClick: () => envoyer({ type: 'remelanger' })
        },
        // Terminer dort ici jusqu'à ce que conclure devienne l'étape attendue.
        ...(!suivi?.complet
          ? [
              {
                cle: 'terminer',
                libelle: 'Terminer la partie',
                icone: Flag,
                onClick: () => envoyer({ type: 'clore' })
              }
            ]
          : []),
        ...(game.chronoTour
          ? [
              {
                cle: 'son',
                libelle: son ? 'Couper le son' : 'Remettre le son',
                icone: son ? Volume2 : VolumeX,
                onClick: () => setSon((v) => !v)
              }
            ]
          : [])
      ]}
    />
  );

  if (etat.phase === 'fin') {
    return (
      <div className="flex flex-col flex-1">
        {menu}
        <Classement
          etat={etat}
          unite={unite}
          onRejouer={() => envoyer({ type: 'rejouer' })}
          onQuitter={onQuitter}
          libelleRetour={libelleRetour}
        />
      </div>
    );
  }

  const lignes = lignesDeScore(etat);

  if (epuise(etat)) {
    return (
      <div className="flex flex-col flex-1">
        {menu}
        <div className="flex-1 flex flex-col justify-center text-center py-6">
          <p className="font-titre text-3xl sm:text-4xl text-brique" role="status">
            La pile est vide
          </p>
          <p className="text-ardoise font-texte text-lg mt-2">
            Vous avez fait le tour des {etat.pile.length} {mots.pluriel}. Remélanger
            les repasse dans un autre ordre, scores gardés.
          </p>
          <BarreActions className="justify-center">
            <Bouton
              variante="principal"
              icone={RotateCw}
              onClick={() => envoyer({ type: 'remelanger' })}
            >
              Remélanger
            </Bouton>
            <Bouton variante="secondaire" icone={Flag} onClick={() => envoyer({ type: 'clore' })}>
              Voir le classement
            </Bouton>
          </BarreActions>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {menu}
      {scores && (
        <DialogueScores
          lignes={lignes}
          legende={`Scores par joueur, en ${unite}s`}
          corrigeAuDepart={scores.corrige}
          onFermer={() => setScores(null)}
          onAjuster={(joueur, delta) => envoyer({ type: 'ajuster', joueur, delta })}
          onReinitialiser={(joueur) => envoyer({ type: 'reinitialiser', joueur })}
        />
      )}

      {/* Où l'on en est et qui mène, sur une seule rangée : deux lectures d'une
          ligne chacune n'ont pas besoin de deux rangées, et la place gagnée va à
          la carte. Elles passent à la ligne d'elles-mêmes sur un écran étroit ou
          quand le nom du meneur est long. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* Une seule échelle à la fois. Le juste chiffre annonce cinq questions :
            c'est ce compte-là que la table suit, et afficher en plus « Question 3
            sur 120 » superposerait deux comptes sans dire lequel on lit
            (cf. `Progression`). Les autres jeux n'ont pas de longueur déclarée,
            leur repère est donc la pile. */}
        {suivi ? (
          <Progression {...suivi} />
        ) : (
          <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70">
            {mots.nom} {etat.index + 1} sur {etat.pile.length}
          </p>
        )}
        <BandeauScores
          resume={resumeDesScores(lignes, unite)}
          onVoir={() => setScores({ corrige: false })}
        />
      </div>

      <Enonce
        etat={etat}
        regles={regles}
        carte={carte}
        game={game}
        son={son}
        chronoLance={chronoLance}
        onChrono={() => setChronoLance((v) => !v)}
        onChronoFini={() => setChronoLance(false)}
      />

      {etat.revele ? (
        <Designation
          etat={etat}
          regles={regles}
          bareme={bareme}
          unite={unite}
          onValider={(gains) => envoyer({ type: 'marquer', gains })}
        />
      ) : (
        <div className="mt-auto max-w-sm w-full mx-auto">
          <div className="flex items-center justify-between gap-2">
            <Bouton
              variante="discret"
              icone={ArrowLeft}
              disabled={etat.index === 0}
              onClick={() => envoyer({ type: 'precedente' })}
            >
              {mots.precedente}
            </Bouton>
            <span aria-hidden="true" />
          </div>
          {/* Tant que la réponse est cachée, révéler *est* l'action de l'écran :
              seule, pleine largeur, à la place où le pouce la trouve sans
              regarder. */}
          <div className="mt-3">
            <Bouton
              variante="principal"
              icone={Eye}
              className="w-full"
              onClick={() => envoyer({ type: 'reveler' })}
            >
              Révéler la réponse
            </Bouton>
          </div>
        </div>
      )}

      {/* Le dernier geste se défait pendant deux secondes et demie, comme sur la
          feuille de match et l'écran de tour : mêmes lignes collées, même erreur
          prévisible, même fenêtre. */}
      <Annulation cle={etat.dernier} onAnnuler={() => envoyer({ type: 'annuler' })} />

      {/* Conclure ne se montre qu'au moment où c'est l'étape attendue : les cinq
          questions du juste chiffre sont passées. */}
      {suivi?.complet && (
        <BarreActionsSecondaire className="justify-center">
          <Bouton variante="secondaire" icone={Flag} onClick={() => envoyer({ type: 'clore' })}>
            Les {suivi.total} questions sont passées : voir le classement
          </Bouton>
        </BarreActionsSecondaire>
      )}
    </div>
  );
}

/**
 * La carte : l'énoncé, puis la réponse, et de quoi revenir en arrière.
 *
 * **Une seule carte, jamais les deux textes empilés.** Le Fitch l'imposait — cinq
 * cents signes de résumé contre deux cents de correction ne tiennent pas côte à
 * côte — et ce qui valait pour lui vaut pour les six : rien dans la charpente du
 * site ne plafonne un panneau, si bien que deux blocs qui réclament chacun leur
 * hauteur de contenu poussaient l'écran de trois cents pixels, et les joueurs à
 * désigner tombaient sous la ligne de flottaison.
 *
 * La bascule est de toute façon le geste du jeu : on annonce la réponse, puis on
 * relit l'énoncé pour montrer où était le piège. Un bouton, deux libellés, et les
 * mots appartiennent au jeu — « Le résumé » et « Les cinq erreurs » chez Le Fitch,
 * « L'énoncé » et « La réponse » partout ailleurs.
 */
function Enonce({ etat, regles, carte, game, son, chronoLance, onChrono, onChronoFini }) {
  // Révéler ouvre sur la réponse : c'est ce qu'on vient de demander.
  const [vueEnonce, setVueEnonce] = useState(false);

  // Chaque carte, et chaque retour en arrière, repart sur son énoncé.
  useEffect(() => setVueEnonce(false), [etat.index, etat.revele]);

  const theme = regles.theme?.[carte.type];
  const mots = regles.comparer ?? { avant: 'L’énoncé', apres: 'La réponse' };
  const montreEnonce = !etat.revele || vueEnonce;

  return (
    // `flex-1` tant que l'énoncé est la vedette, puis rien : une fois la réponse
    // révélée, la place flexible revient aux joueurs à désigner, et la carte se
    // borne à ce que `reduite` lui laisse.
    <div
      className={`flex flex-col justify-center items-center gap-2 ${
        // Moins d'air une fois la réponse tombée : la carte a rapetissé, et ces
        // seize pixels valent mieux à la liste des joueurs.
        etat.revele ? 'shrink-0 py-2' : 'flex-1 min-h-0 py-4 gap-3'
      }`}
    >
      {/* Les règles font annoncer le thème avant le titre : il se lit dans le
          `type` de la ligne, rien n'est écrit par slug. */}
      {theme && !etat.revele && (
        <p className="font-titre text-xs uppercase tracking-wide text-orange">{theme}</p>
      )}

      {/* Une seule région live sur l'écran, et c'est la carte : elle porte
          successivement les deux textes, donc toujours ce qui vient de changer. */}
      <CarteTiree
        texte={montreEnonce ? carte.contenu : carte.reponse}
        cle={`${etat.index}-${montreEnonce}`}
        taille={regles.taille}
        plein={!etat.revele}
        reduite={etat.revele}
      />

      {etat.revele && (
        <Bouton
          variante="discret"
          icone={vueEnonce ? Eye : EyeOff}
          onClick={() => setVueEnonce((v) => !v)}
          aria-pressed={vueEnonce}
        >
          {vueEnonce ? mots.apres : mots.avant}
        </Bouton>
      )}

      {game.chronoTour && !etat.revele && (
        <div className="flex items-end gap-4 max-w-md w-full mx-auto">
          <div className="flex-1 min-w-0">
            <Chrono
              secondes={game.chronoTour}
              enMarche={chronoLance}
              cle={etat.index}
              son={son}
              onFini={onChronoFini}
            />
          </div>
          <Bouton
            variante="discret"
            icone={chronoLance ? IconePause : Play}
            onClick={onChrono}
            className="mb-1"
          >
            {chronoLance ? 'Pause' : 'Chrono'}
          </Bouton>
        </div>
      )}
    </div>
  );
}

/**
 * « Annuler », offert deux secondes et demie après chaque geste.
 *
 * Même durée que la feuille de match et l'écran de tour, et ce n'est pas un
 * réglage d'écran mais une règle d'interaction du site : si l'une change, l'autre
 * suit. Compté en `setInterval`, que les tests peuvent simuler seuls — un
 * `setTimeout` simulé fige aussi l'ordonnanceur de React.
 */
function Annulation({ cle, onAnnuler }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!cle) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const debut = Date.now();
    const minuterie = setInterval(() => {
      if (Date.now() - debut >= 2500) setVisible(false);
    }, 250);
    return () => clearInterval(minuterie);
  }, [cle]);

  if (!visible) return null;

  return (
    <BarreActionsSecondaire className="justify-center">
      <Bouton variante="discret" icone={RotateCw} onClick={onAnnuler}>
        Annuler la dernière carte
      </Bouton>
    </BarreActionsSecondaire>
  );
}

/**
 * Écran d'accueil quand une partie dort en mémoire.
 *
 * Poser la question plutôt que trancher : reprendre d'office empêcherait d'en
 * lancer une neuve, et repartir de zéro effacerait une soirée sans prévenir.
 */
function Reprise({ partie, onReprendre, onNouvelle, onAbandonner, onQuitter, libelleRetour }) {
  const { etat } = partie;
  const totaux = etat.joueurs.map((nom, i) => `${nom} ${etat.scores[i]}`).join(' · ');

  return (
    <div className="flex-1 flex flex-col justify-center py-4">
      <p className="font-titre text-3xl text-brique">Une partie est en cours</p>
      <p className="text-ardoise font-texte text-lg mt-2">
        {etat.manches > 1
          ? `${etat.manches} cartes comptées`
          : `${etat.manches} carte comptée`}
        , {pluriel(etat.joueurs.length, 'joueur')}.
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
        <Bouton variante="discret" destructeur icone={Trash2} onClick={onAbandonner}>
          Abandonner la partie
        </Bouton>
      </BarreActionsSecondaire>
    </div>
  );
}

/**
 * Kit des six quiz d'animateur.
 *
 * Sorry mon french, Lost in translation, Le Fitch, Le souffleur, Soyez logique,
 * Le juste chiffre. Tous portent `prompts` et `compteur` au catalogue, et se
 * jouent de la même façon : quelqu'un lit, la table cherche, on révèle, on
 * distribue. Ce qui les sépare tient dans `quizAnimateur.js` — la taille du
 * texte, le barème, le thème à annoncer, la bascule du Fitch — et le reste vient
 * du catalogue : `chronoTour` décide du décompte, `minPlayers` et `maxPlayers`
 * bornent l'effectif, le `type` de la ligne donne le mot du bouton.
 *
 * Quatre jeux de la même famille attendent encore : Plan pas plan plan, Le
 * blindlo-fi, ETSY c'était ça ?!, Cacophonie. Ils tirent des images et des
 * vidéos hébergées ailleurs, ce que le site ne fait nulle part — et deux d'entre
 * eux demandent d'abord du travail côté données.
 */
function KitQuizAnimateur({
  game,
  joueurs,
  ancreMenu,
  onQuitter,
  onRetourAccueil,
  libelleRetour
}) {
  const regles = reglesDe(game.slug);
  const cartes = useMemo(() => contenuDuJeu(game.slug), [game.slug]);

  // Lue une seule fois au montage : la partie s'écrit ensuite en continu, et
  // relire le stockage à chaque rendu proposerait de reprendre celle qu'on joue.
  const [sauvegarde] = useState(() => partieDuJeu(game.slug));
  const [depart, setDepart] = useState(null);
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
          setDepart(reprendre(sauvegarde.etat));
          setChoixFait(true);
        }}
        onNouvelle={() => {
          effacerPartie();
          setChoixFait(true);
        }}
      />
    );
  }

  return depart ? (
    <Partie
      game={game}
      regles={regles}
      depart={depart}
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
      regles={regles}
      joueursConnus={joueurs}
      onDemarrer={(noms) => setDepart(etatInitial({ cartes, joueurs: noms }))}
      onQuitter={onQuitter}
      libelleRetour={libelleRetour}
    />
  );
}

export default KitQuizAnimateur;
