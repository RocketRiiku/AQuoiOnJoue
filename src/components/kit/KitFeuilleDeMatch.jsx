import { useEffect, useId, useReducer, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  PencilLine,
  Play,
  RotateCw,
  Settings2,
  Shuffle,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
import BandeauScores, { DialogueScores } from './BandeauScores';
import Compteur from './Compteur';
import FeuilleDeMatch from './FeuilleDeMatch';
import LigneJoueur from './LigneJoueur';
import MenuPartie from './MenuPartie';
import PhaseChronometree from './PhaseChronometree';
import Progression from './Progression';
import TableauScores from './TableauScores';
import { ecrirePartie, effacerPartie, partieDuJeu } from '../../utils/partieEnCours';
import {
  enJeu,
  etatInitial,
  nomsJoueurs,
  reducteur,
  reglesDe,
  reprendre,
  tourDeTable,
  vainqueurs
} from '../../utils/feuilleDeMatch';

/** Le mot du point, déduit du catalogue : on encaisse ou on marque. */
const uniteDe = (game) => (game.scoring === 'elimination' ? 'avertissement' : 'point');

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

/** « Joueur 1 », « Joueur 1 et Joueur 3 », « Joueur 1, Joueur 3 et Joueur 5 ». */
function listeFr(noms) {
  if (noms.length <= 1) return noms.join('');
  return `${noms.slice(0, -1).join(', ')} et ${noms.at(-1)}`;
}

/**
 * L'état du jeu traduit en lignes de `TableauScores`.
 *
 * Une seule valeur par joueur, donc aucune colonne : la brique se réduit alors
 * à un classement. C'est ce second client, réel, qui a permis de la découpler de
 * « Trois fois rien » sans dessiner son interface à l'aveugle.
 */
const lignesDeScore = (etat) => {
  /**
   * Qui mène, en cours de partie comme à l'arrivée : le bandeau des scores en
   * vit. Personne n'est mis en tête quand tout le monde est à égalité — au
   * premier tour, souligner cinq joueurs sur cinq ne dit rien.
   *
   * `vainqueurs` connaît le sens du jeu : le plus gros total quand on marque des
   * points, le moins puni quand on encaisse des avertissements.
   */
  const meilleurs = vainqueurs(etat);
  const enTete = meilleurs.length === enJeu(etat).length ? [] : meilleurs;
  return etat.joueurs.map((nom, i) => ({
    nom,
    total: etat.scores[i],
    enTete: enTete.includes(i),
    sortie: etat.sortis[i],
    retraitPossible: etat.scores[i] > 0
  }));
};

/**
 * La ligne que lit le bandeau des scores.
 *
 * **Elle ne dit pas la même chose selon le sens du jeu.** Quand on marque des
 * points, ce qui compte est qui mène. Quand on encaisse des avertissements, le
 * meneur est celui qui n'a rien pris — l'annoncer donnerait « Égalité, 0
 * avertissement », qui n'informe de rien. C'est alors le joueur le plus près de
 * sortir qu'on affiche, parce que c'est là qu'est la tension.
 */
function resumeDesScores(etat, lignes, unite) {
  const enCourse = enJeu(etat);

  if (etat.seuil !== null) {
    const menace = enCourse.reduce(
      (pire, i) => (etat.scores[i] > etat.scores[pire] ? i : pire),
      enCourse[0]
    );
    const encaisses = etat.scores[menace] ?? 0;
    // Personne en danger : c'est l'effectif restant qui informe. La ligne vivait
    // sous la feuille, où elle répétait ce que le bandeau aurait pu dire.
    return encaisses === 0
      ? { texte: `${pluriel(enCourse.length, 'joueur')} encore en course` }
      : { texte: `${etat.joueurs[menace]} : ${encaisses} sur ${etat.seuil}` };
  }

  const meneurs = lignes.filter((l) => l.enTete);
  if (meneurs.length === 0 || meneurs[0].total === 0) {
    return { texte: 'Personne n’a encore marqué.' };
  }
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
 * Une seule question, parce que l'effectif est la condition d'existence de la
 * feuille — on ne dessine pas N lignes sans N. Il arrive pré-rempli par le
 * filtre « Joueurs » de la liste : dans le cas courant, un coup d'œil et une
 * tape. Le défileur se passe d'un tel écran à raison, n'ayant rien à régler.
 *
 * Le rappel d'avant-partie y est fondu au lieu d'occuper son propre écran :
 * puisqu'il faut de toute façon s'arrêter ici, un péage de plus ne se justifie
 * pas. Même contenu que les `RAPPELS` du défileur — ce qui se perd entre la
 * lecture des règles et le premier point.
 */
function Reglage({ game, regles, joueursConnus, onDemarrer, onQuitter, libelleRetour }) {
  const [nombre, setNombre] = useState(
    Math.min(Math.max(joueursConnus ?? game.idealPlayersMin, game.minPlayers), game.maxPlayers)
  );
  // Vides au départ, et non pré-remplis de « Joueur n » : le champ annonce son
  // repli par son indice de saisie, et une valeur déjà là obligerait à
  // l'effacer avant d'écrire un prénom.
  const [noms, setNoms] = useState(() => []);
  const [deplie, setDeplie] = useState(false);
  const idPanneau = useId();

  // Un nom laissé vide retombe sur « Joueur n » : mieux vaut un nom générique
  // qu'une ligne sans en-tête. Même règle que les noms d'équipes.
  const nomsRetenus = nomsJoueurs(nombre).map((defaut, i) => noms[i]?.trim() || defaut);

  // La liste part vide et se remplit par index : un `map` n'aurait rien à
  // parcourir, et le premier nom saisi serait perdu.
  const renommer = (index, valeur) =>
    setNoms((actuels) => {
      const suite = [...actuels];
      suite[index] = valeur;
      return suite;
    });

  return (
    <>
      <p className="text-ardoise font-texte text-lg">{regles.rappel}</p>

      <div className="mt-6">
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
            soit {pluriel(nombre, 'ligne')} sur la feuille
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
              {/* Les équipes de « Trois fois rien » sont numérotées et ça
                  suffit, elles sont deux à quatre. Une feuille de match en
                  compte jusqu'à seize : « Joueur 11 » ne désigne plus personne,
                  et un score qu'on ne sait pas s'attribuer ne sert à rien.
                  Facultatif, donc — aucun prénom n'est *demandé*, et rien ne
                  quitte l'appareil. */}
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

      <BarreActions>
        <Bouton
          variante="principal"
          icone={Play}
          onClick={() =>
            onDemarrer(
              etatInitial({
                joueurs: nomsRetenus,
                seuil: regles.seuil ?? null,
                forme: regles.forme
              })
            )
          }
        >
          Ouvrir la feuille
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>
    </>
  );
}

/**
 * L'aperçu du barème, en clair, avant de valider.
 *
 * **Rien ne disait ce que « Compter les points » allait faire.** Ni ce que
 * rapporte une bonne réponse, ni si le conteur marque quand personne ne le
 * démasque — alors que c'est justement le calcul qu'on lui a retiré. L'aperçu le
 * rend : les gains sont groupés par valeur, dans l'ordre décroissant, et ils
 * suivent la sélection au fil des tapes.
 *
 * Il remplace du même coup le « Personne, pour l'instant » : quand aucun joueur
 * n'est désigné, la ligne dit ce que ça vaut au conteur, ce qui est l'information
 * utile à ce moment-là.
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
        Personne ne marque de {unite} sur ce tour.
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
          <span className="font-titre text-brique">+{points}</span>
        </span>
      ))}
    </p>
  );
}

/**
 * Écran de vote : on désigne, on voit ce que ça donne, on valide.
 *
 * **Des lignes pleine largeur et non des pastilles à cocher.** On désigne
 * quelqu'un autour d'une table, souvent debout : la cible fait toute la largeur
 * et cinquante pixels de haut, comme la feuille de match dont elle reprend la
 * brique (docs/boutons.md).
 *
 * C'est là que le barème disparaît de la table : Le Liars Club veut « autant de
 * points au conteur qu'il a trompé de monde », Tudum « trois points si tout le
 * monde a reconnu le son ». Demander ces chiffres à qui tient le téléphone
 * serait lui faire compter deux fois la même chose — on désigne, `ApercuGains`
 * montre le résultat, le réducteur l'applique.
 */
function EcranVote({
  etat,
  regles,
  unite,
  onResoudre,
  onPrecedent,
  libellePrecedent,
  entete
}) {
  const [trouveurs, setTrouveurs] = useState([]);
  const courant = etat.courant;
  const participants = enJeu(etat).filter((i) => i !== courant);

  // Changer de joueur courant remet la sélection à plat : les coches du tour
  // précédent n'ont plus de sens.
  useEffect(() => setTrouveurs([]), [courant]);

  const basculer = (joueur) =>
    setTrouveurs((actuels) =>
      actuels.includes(joueur) ? actuels.filter((i) => i !== joueur) : [...actuels, joueur]
    );

  const gains = regles.resoudre({ courant, trouveurs, enJeu: enJeu(etat) });

  return (
    <div className="flex flex-col min-h-[62svh]">
      {entete}

      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70 mt-4 text-center">
        Le vote
      </p>
      <p
        className="font-titre text-brique text-center leading-none mt-2 text-[clamp(1.75rem,11svh,3rem)] break-words"
        role="status"
      >
        {regles.questionTrouveurs}
      </p>
      {regles.consigneVote && (
        <p className="text-ardoise font-texte mt-3 max-w-md mx-auto text-center">
          {regles.consigneVote}
        </p>
      )}

      <ul className="flex flex-col gap-2 mt-6 list-none">
        {participants.map((joueur) => (
          <li key={joueur}>
            <LigneJoueur
              nom={etat.joueurs[joueur]}
              selectionnable
              actif={trouveurs.includes(joueur)}
              nomAccessible={`${etat.joueurs[joueur]} a trouvé`}
              onClick={() => basculer(joueur)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {/* L'aperçu se lit juste au-dessus du bouton : c'est là que le pouce
            s'arrête avant de valider. */}
        <div className="mt-6">
          <ApercuGains gains={gains} joueurs={etat.joueurs} unite={unite} />
        </div>

        {/* Même paire qu'ailleurs : reculer à gauche, avancer à droite, et le
            retour rendu même quand il n'y a rien derrière pour que le bouton
            principal ne bouge pas d'un écran à l'autre. */}
        <BarreActions className="justify-center">
          <Bouton
            variante="discret"
            icone={ArrowLeft}
            disabled={!onPrecedent}
            onClick={onPrecedent}
          >
            {libellePrecedent ?? 'Précédent'}
          </Bouton>
          <Bouton
            variante="principal"
            icone={Check}
            onClick={() => {
              onResoudre(gains);
              setTrouveurs([]);
            }}
          >
            Compter les points
          </Bouton>
        </BarreActions>
      </div>
    </div>
  );
}

/**
 * Panneau de duel : deux joueurs tirés au sort, et la matrice de leurs choix.
 *
 * **La matrice 2×2 est la forme canonique de ce jeu**, et c'est elle qui sert
 * d'entrée : on tape la case qui vient de se produire, une fois, et les points
 * tombent des deux côtés. La version d'avant listait les trois issues en boutons
 * de prose, dont une à dédoubler pour dire lequel des deux avait trahi — quatre
 * boutons et trois lignes à lire pour un geste unique.
 *
 * Elle fait aussi le travail que le texte des règles fait mal : le barème
 * complet se lit d'un coup d'œil, ses quatre cases côte à côte. On voit que
 * trahir seul rapporte le plus, que se méfier à deux ne rapporte presque rien,
 * et que le pot fond à mesure. C'est ce que la table doit comprendre pour que le
 * choix ait du sel, et une liste de trois phrases ne le montre pas.
 *
 * Un vrai `<table>` : deux entrées, deux en-têtes, et les lecteurs d'écran
 * savent les parcourir. Chaque case est une **surface de jeu** et non un bouton
 * de panneau, comme la ligne d'une feuille de match (docs/boutons.md). Son nom
 * accessible nomme les deux joueurs et leurs points : « 5 / 0 » ne dit pas qui
 * prend quoi.
 *
 * Le tirage vit dans l'état et non dans le composant, pour qu'une partie reprise
 * retrouve son duel en cours.
 */
function PanneauDuel({ etat, regles, onTirer, onResoudre }) {
  if (!etat.duel) {
    return (
      <div className="text-center">
        <p className="text-ardoise font-texte text-lg">
          Six points sur la table, deux joueurs dos à dos.
        </p>
        <BarreActions className="justify-center">
          <Bouton variante="principal" icone={Shuffle} onClick={onTirer}>
            Tirer deux duellistes
          </Bouton>
        </BarreActions>
      </div>
    );
  }

  const [a, b] = etat.duel;
  const { etiquettes, gains } = regles.matrice;

  return (
    <div>
      <p className="font-titre text-2xl sm:text-3xl text-brique text-center" role="status">
        {etat.joueurs[a]} <span className="text-ardoise/60">contre</span> {etat.joueurs[b]}
      </p>

      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70 mt-8">
        Qu’annoncent les deux étiquettes&nbsp;?
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <caption className="sr-only">
            Points gagnés selon l’étiquette posée par chaque duelliste
          </caption>
          <thead>
            <tr>
              <th className="w-20 sm:w-28">
                <span className="sr-only">Étiquette posée</span>
              </th>
              {etiquettes.map((etiquette) => (
                <th key={etiquette} scope="col" className="font-normal pb-2 px-1">
                  <span className="block truncate font-titre text-sm sm:text-base text-encre">
                    {etat.joueurs[b]}
                  </span>
                  <span className="font-titre text-xs uppercase tracking-wide text-ardoise/70">
                    {etiquette}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gains.map((ligne, i) => (
              <tr key={etiquettes[i]}>
                <th scope="row" className="font-normal text-left pr-2 align-middle">
                  <span className="block truncate font-titre text-sm sm:text-base text-encre">
                    {etat.joueurs[a]}
                  </span>
                  <span className="font-titre text-xs uppercase tracking-wide text-ardoise/70">
                    {etiquettes[i]}
                  </span>
                </th>
                {ligne.map((points, j) => (
                  <td key={etiquettes[j]} className="p-1">
                    <button
                      type="button"
                      onClick={() =>
                        onResoudre(
                          [
                            { joueur: a, points: points[0] },
                            { joueur: b, points: points[1] }
                          ],
                          [a, b]
                        )
                      }
                      aria-label={`${etat.joueurs[a]} pose ${etiquettes[i]} et ${etat.joueurs[b]} pose ${etiquettes[j]} : ${points[0]} pour ${etat.joueurs[a]}, ${points[1]} pour ${etat.joueurs[b]}`}
                      className="w-full rounded-xl bg-paille hover:bg-paille/70 active:bg-white/80 py-4 sm:py-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                    >
                      <span
                        aria-hidden="true"
                        className="font-titre text-2xl sm:text-3xl tabular-nums text-encre"
                      >
                        {points[0]}
                        <span className="text-ardoise/50 mx-1">/</span>
                        {points[1]}
                      </span>
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-ardoise/60 text-xs text-center mt-2">
        Touchez la case qui s’est produite.
      </p>
    </div>
  );
}

/** Le classement, et ce qu'on en fait. */
function Classement({ etat, unite, onRejouer, onQuitter, libelleRetour }) {
  const gagnants = vainqueurs(etat);

  return (
    <div className="mt-8">
      <p className="font-titre text-3xl sm:text-4xl text-brique text-center" role="status">
        {gagnants.length > 1
          ? 'Égalité parfaite'
          : `${etat.joueurs[gagnants[0]]} l’emporte`}
      </p>
      <p className="text-ardoise font-texte text-center mt-1">
        {etat.seuil !== null
          ? 'Le dernier debout.'
          : `${pluriel(etat.scores[gagnants[0]], unite)}.`}
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
 * La partie en cours : la feuille, et ce qui se pose dessus.
 *
 * Les cinq jeux partagent tout — l'effectif, les scores, le seuil, l'annulation,
 * la persistance, le classement — et ne divergent que par la façon dont un point
 * s'attribue. D'où un seul orchestrateur et trois panneaux, plutôt que trois
 * écrans qui recopieraient la même feuille.
 */
function Partie({ game, regles, depart, ancreMenu, onQuitter, onAbandonner, libelleRetour }) {
  const [etat, envoyer] = useReducer(reducteur, depart);
  const [scores, setScores] = useState(null);
  const [son, setSon] = useState(true);
  const unite = uniteDe(game);

  // Écrite à chaque geste : une soirée de points se perd sur un onglet recyclé.
  // Une partie close s'efface — il n'y a plus rien à reprendre.
  useEffect(() => {
    if (etat.phase === 'fin') effacerPartie();
    else ecrirePartie({ slug: game.slug, titre: game.title, etat });
  }, [etat, game.slug, game.title]);

  const resoudre = (gains, passes = [etat.courant]) =>
    envoyer({ type: 'marquer', gains, passes, avancer: regles.forme === 'parTour' });

  if (etat.phase === 'fin') {
    return (
      <Classement
        etat={etat}
        unite={unite}
        onRejouer={() => envoyer({ type: 'rejouer' })}
        onQuitter={onQuitter}
        libelleRetour={libelleRetour}
      />
    );
  }

  const lignes = lignesDeScore(etat);
  const complet = tourDeTable(etat).complet;

  /**
   * Le bandeau ne se déplie que là où le tableau apprend quelque chose.
   *
   * Chez un jeu « au fil de l'eau », la feuille de match *est* le tableau des
   * scores : tous les joueurs y sont, avec leurs avertissements. Le rouvrir en
   * modale affichait deux fois la même chose. Le bandeau garde sa ligne de
   * résumé, et la correction passe dans le menu — elle sert une fois sur vingt.
   */
  const tableauUtile = regles.forme !== 'auFil';
  const bandeau = (
    <BandeauScores
      resume={resumeDesScores(etat, lignes, unite)}
      onVoir={tableauUtile ? () => setScores({ corrige: false }) : undefined}
    />
  );

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
        // Terminer reste ici tant que la partie n'a pas atteint sa fin
        // naturelle ; il remonte en bas d'écran au tour de table complet.
        ...(etat.seuil === null && !complet
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

  /**
   * L'en-tête d'un tour : où l'on en est, et les scores en une ligne.
   *
   * Passé aux écrans plutôt que posé au-dessus d'eux, pour qu'ils gardent la
   * main sur leur mise en page — la barre d'actions doit tomber au même endroit
   * d'un écran à l'autre, ce qu'un empilement extérieur casserait.
   */
  const entete = regles.forme === 'auFil' ? bandeau : (
    <div className="flex flex-col gap-3">
      <Progression {...tourDeTable(etat)} etapes={regles.etapes} etape={etat.etape} />
      {bandeau}
    </div>
  );

  // Une phase déclarée par le jeu, ou le vote qui clôt le tour.
  const etapeCourante = regles.etapes?.[etat.etape] ?? null;

  return (
    <div>
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

      {regles.forme === 'auFil' && (
        <>
          {bandeau}
          <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70 mt-5">
            {regles.seuil !== null
              ? `${regles.seuil} avertissements et on sort`
              : 'Touchez une ligne pour marquer un point'}
          </p>
          <div className="mt-3">
            <FeuilleDeMatch
              etat={etat}
              seuil={regles.seuil ?? null}
              libelleGeste={regles.libelleGeste}
              unite={unite}
              onMarquer={(joueur) =>
                envoyer({ type: 'marquer', gains: [{ joueur, points: 1 }], passes: [joueur] })
              }
              onAnnuler={() => envoyer({ type: 'annuler' })}
            />
          </div>
        </>
      )}

      {regles.forme === 'parTour' &&
        (etapeCourante ? (
          <PhaseChronometree
            entete={entete}
            titre={etapeCourante.titre}
            nom={`${etat.joueurs[etat.courant]} ${regles.roleCourant}`}
            consigne={etapeCourante.consigne}
            secondes={
              etapeCourante.secondes === 'chronoTour'
                ? game.chronoTour
                : etapeCourante.secondes
            }
            action={etapeCourante.action}
            cle={`${etat.courant}-${etat.etape}`}
            son={son}
            onSuivant={() => envoyer({ type: 'etapeSuivante' })}
            onPrecedent={
              etat.etape > 0 ? () => envoyer({ type: 'etapePrecedente' }) : undefined
            }
            libellePrecedent={regles.etapes[etat.etape - 1]?.titre}
          />
        ) : (
          <EcranVote
            entete={entete}
            etat={etat}
            regles={regles}
            unite={unite}
            onResoudre={resoudre}
            onPrecedent={
              regles.etapes.length > 0
                ? () => envoyer({ type: 'etapePrecedente' })
                : undefined
            }
            libellePrecedent={regles.etapes.at(-1)?.titre}
          />
        ))}

      {regles.forme === 'duel' && (
        <>
          {bandeau}
          <div className="mt-5">
            <PanneauDuel
              etat={etat}
              regles={regles}
              onTirer={() => envoyer({ type: 'tirerDuel' })}
              onResoudre={resoudre}
            />
          </div>
        </>
      )}

      {/* Conclure ne se montre qu'au moment où c'est l'étape attendue : tout le
          monde est passé. Le reste du temps, l'action dort dans le menu — la
          voir sur chaque écran ne servait qu'à encombrer, et deux boutons de
          sortie voisins finissaient par se confondre. */}
      {etat.seuil === null && complet && (
        <BarreActionsSecondaire className="justify-center">
          <Bouton
            variante="secondaire"
            icone={Flag}
            onClick={() => envoyer({ type: 'clore' })}
          >
            Tout le monde est passé : voir le classement
          </Bouton>
        </BarreActionsSecondaire>
      )}
    </div>
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
  const totaux = etat.joueurs
    .map((nom, i) => `${nom} ${etat.scores[i]}`)
    .join(' · ');

  return (
    <>
      <p className="font-titre text-3xl text-brique">Une partie est en cours</p>
      <p className="text-ardoise font-texte text-lg mt-2">
        {pluriel(enJeu(etat).length, 'joueur')} encore en course sur {etat.joueurs.length}.
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
    </>
  );
}

/**
 * Kit des cinq jeux qui ne tiennent qu'un score.
 *
 * Le Liars Club, Avez-vous confiance ?, Tudum, Qui rit sort, Sur parole. Aucun
 * ne déclare de module de `kit` : il n'y a rien à tirer, et l'invariant du
 * catalogue interdit de leur écrire du contenu. Ce qui les distingue tient dans
 * `feuilleDeMatch.js` — la forme de l'écran, le seuil, le barème — et le reste
 * se déduit du catalogue : `scoring` donne le mot du point, `chronoTour` décide
 * du décompte, `minPlayers` et `maxPlayers` bornent l'effectif.
 */
function KitFeuilleDeMatch({
  game,
  joueurs,
  ancreMenu,
  onQuitter,
  onRetourAccueil,
  libelleRetour
}) {
  const regles = reglesDe(game.slug);

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
      onDemarrer={setDepart}
      onQuitter={onQuitter}
      libelleRetour={libelleRetour}
    />
  );
}

export default KitFeuilleDeMatch;
