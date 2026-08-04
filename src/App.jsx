import { useEffect, useState } from 'react';
import { CircleHelp, PartyPopper, Search, Star, Timer } from 'lucide-react';
import { BoutonIcone } from './components/Bouton';
import Dialogue from './components/Dialogue';
import BoutonTirage from './components/BoutonTirage';
import Header from './components/Header';
import Tuile from './components/Tuile';
import GameCard from './components/GameCard';
import GameThumb from './components/GameThumb';
import GameDetail from './components/GameDetail';
import Introduction from './components/Introduction';
import SoireePage from './components/SoireePage';
import SoireeLancement from './components/SoireeLancement';
import PiedDePage from './components/PiedDePage';
import Suggestions from './components/Suggestions';
import MentionsLegales from './components/MentionsLegales';
import KitJeu from './components/kit/KitJeu';
import MenuPartie from './components/kit/MenuPartie';
import TriJeux from './components/TriJeux';
import { gamesList } from './data/games';
import { DEFAULT_FILTERS } from './data/filterOptions';
import { asset } from './utils/asset';
import { filterGames } from './utils/filterGames';
import { estRecommande, nombreJoueurs } from './utils/formatGame';
import { TRI_PAR_DEFAUT, trierJeux } from './utils/trierJeux';
import { useIntroduction } from './utils/useIntroduction';
import { useNavigation } from './utils/useNavigation';
import { lirePartie } from './utils/partieEnCours';

function App() {
  const {
    vue,
    jeuAffiche,
    soiree,
    etape,
    jeuDuKit,
    ouvrirJeu,
    fermerJeu,
    ouvrirKit,
    ouvrirKitDuJeu,
    fermerKit,
    ouvrirSoiree,
    fermerSoiree,
    lancerSoiree,
    allerEtape,
    quitterLancement,
    retourAccueil,
    ouvrirPage,
    fermerPage,
    estDansSoiree,
    basculerSoiree,
    retirerDeSoiree,
    deplacerDansSoiree,
    viderSoiree
  } = useNavigation(gamesList);

  const introduction = useIntroduction();
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, material: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [tri, setTri] = useState(TRI_PAR_DEFAUT);

  /**
   * Une partie de kit laissée en plan se signale sur la liste.
   *
   * Relue à chaque changement de vue plutôt qu'à chaque rendu : elle ne bouge
   * qu'en quittant le kit, et un accès au stockage par frappe au clavier dans
   * la recherche serait payé pour rien.
   */
  const [partieEnCours, setPartieEnCours] = useState(lirePartie);
  useEffect(() => setPartieEnCours(lirePartie()), [vue]);

  // Les règles rouvertes pendant une partie. Refermées en quittant le kit :
  // les retrouver ouvertes à la partie suivante n'aurait aucun sens.
  const [reglesOuvertes, setReglesOuvertes] = useState(false);
  useEffect(() => setReglesOuvertes(false), [vue, jeuAffiche]);

  /**
   * L'emplacement du menu de la partie, dans l'en-tête du kit.
   *
   * Le nœud est confié au kit, qui y pose ses propres actions par un portail :
   * l'application ne sait pas ce qu'un jeu a d'autre à offrir que la sortie, et
   * faire remonter ces entrées jusqu'ici l'obligerait à toutes les connaître.
   */
  const [ancreMenu, setAncreMenu] = useState(null);

  /**
   * L'effectif de la soirée, saisi une fois dans le filtre « Joueurs », suit
   * jusque dans le déroulé : la durée d'une partie dépend du nombre de joueurs,
   * et ce nombre ne change pas d'un jeu à l'autre. Tant qu'il n'est pas
   * renseigné, chaque durée s'affiche en fourchette.
   */
  const joueurs = nombreJoueurs(filters.players);

  /**
   * Filtrer retire des jeux, trier les réordonne : les deux restent séparés.
   *
   * L'ordre par défaut remonte les jeux à leur meilleur pour l'effectif, qui
   * portent une étoile — plutôt qu'un filtre de plus, qui aurait caché le reste
   * alors que la fourchette idéale est un conseil, pas une condition.
   */
  const filteredGames = trierJeux(
    filterGames(gamesList, filters, searchTerm),
    tri,
    joueurs
  );

  const nbRecommandes =
    joueurs == null ? 0 : filteredGames.filter((g) => estRecommande(g, joueurs)).length;

  const aucunResultat = filteredGames.length === 0;
  const enListe = vue === 'liste';

  /**
   * Une partie prend l'écran entier.
   *
   * L'en-tête du site et le pied de page mangeaient près de 300 px sur
   * téléphone, soit un tiers de la hauteur utile, pour deux choses dont on n'a
   * aucun besoin en pleine partie : le nom du site et trois liens d'éditeur. Le
   * kit récupère la place, ce qui permet enfin d'écrire le nom du joueur assez
   * grand pour se lire depuis l'autre bout de la table.
   *
   * Le titre du site était par ailleurs le seul moyen de sortir sans passer par
   * les boutons du kit ; c'est maintenant le rôle du menu de la partie, qui
   * demande confirmation au lieu de tout perdre sur un clic.
   */
  const enKit = vue === 'kit';

  // Changer de vue depuis le bas de la liste laissait l'écran au milieu de nulle part.
  useEffect(() => {
    if (!enListe) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [enListe, vue, etape, jeuAffiche]);

  /**
   * Vrai quand la fiche affichée vient d'un tirage au sort. La fiche propose
   * alors de relancer sans repasser par la liste — c'est le geste attendu quand
   * le jeu tiré ne plaît pas.
   *
   * Volontairement hors de l'URL : le lien partagé depuis une fiche ne doit pas
   * trimballer ce détail d'usage.
   */
  const [issuDuHasard, setIssuDuHasard] = useState(false);

  useEffect(() => {
    if (vue !== 'jeu') setIssuDuHasard(false);
  }, [vue]);

  /** Tire un jeu parmi les résultats, en évitant celui déjà affiché. */
  const tirerAuHasard = (aEviter) => {
    const candidats = aEviter
      ? filteredGames.filter((g) => g.slug !== aEviter.slug)
      : filteredGames;
    if (candidats.length === 0) return;
    setIssuDuHasard(true);
    ouvrirJeu(candidats[Math.floor(Math.random() * candidats.length)]);
  };

  const ouvrirDepuisLaListe = (game) => {
    setIssuDuHasard(false);
    ouvrirJeu(game);
  };

  /**
   * Le titre du site ramène à la liste.
   *
   * C'est un vrai lien, et non un bouton : Ctrl+clic doit pouvoir l'ouvrir dans
   * un onglet, et l'adresse doit pouvoir se copier. Le clic simple est
   * intercepté pour rester dans l'application — un rechargement complet
   * perdrait l'animation d'entrée pour rien.
   */
  const allerAccueil = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Déjà sur la liste : empiler une entrée d'historique identique rendrait le
    // bouton Retour du navigateur sans effet visible. On remonte, c'est tout.
    if (!enListe) retourAccueil();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Colonne flexible : le pied de page est plaqué contre le bas même quand la
    // vue est courte, sans quoi une bande d'herbe vide traînerait sous lui.
    //
    // `overflow-x-clip` et non `hidden` : masquer un seul axe fait passer
    // l'autre de `visible` à `auto`, ce qui transformait ce bloc en zone
    // défilante à part. Sur les vues courtes, le ciel étoilé qui le dépassait
    // devenait alors du défilement interne — on descendait sous le pied de
    // page, et le geste s'arrêtait là avant de reprendre sur la page. `clip`
    // masque tout autant sans créer de conteneur de défilement.
    //
    // `svh` et non `vh` : sur téléphone, `100vh` vaut la hauteur *sans* la
    // barre d'adresse, donc plus que l'écran réellement visible — la page
    // dépassait d'autant. `svh` prend la plus petite des deux, et ne bouge pas
    // pendant le défilement (contrairement à `dvh`, qui décalerait la mise en
    // page à chaque apparition de la barre).
    <div className="relative min-h-screen min-h-svh w-full overflow-x-clip bg-nature bg-repeat-y bg-top flex flex-col">
      {/* Ciel étoilé : hauteur souple et fondu vers le décor, au lieu de deux
          calques figés à 1400 px qui coupaient la liste net en deux. */}
      {/* Cadrage mobile ajusté pour garder le renard visible. `cover` rogne le
          décor sur les côtés, et le renard — à 84 % de la largeur de l'image —
          tombait hors champ : on décale donc le cadrage vers la droite (on n'y
          perd qu'une zone de ciel et d'herbe vide). Le calque est aussi plus
          haut qu'auparavant, ce qui fait descendre le renard dans l'espace
          libre entre la barre de recherche et les cartes de filtres, au lieu
          de le laisser caché derrière la première. */}
      <div
        aria-hidden="true"
        // `max-h-full` borne le calque à la hauteur de la page : sur une vue
        // courte, ses 1400 px la dépassaient et rallongeaient le défilement
        // d'un ciel vide. Ceinture et bretelles avec `overflow-x-clip` ci-dessus,
        // qui ne s'applique pas sur les navigateurs les plus anciens.
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1400px] max-h-full sm:h-[900px] bg-stars bg-cover bg-[position:82%_top] sm:bg-top bg-no-repeat"
        style={{
          maskImage: 'linear-gradient(to bottom, #000 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 75%, transparent 100%)'
        }}
      />

      <div className="relative z-20 flex flex-1 flex-col">
        {!enKit && (
        <header className="flex flex-col items-center text-center leading-tight pt-16 sm:pt-20 px-4">
          <div className="anim-entree flex flex-col items-center">
            <a
              href={asset('/')}
              onClick={allerAccueil}
              className="group flex items-center gap-3 rounded-2xl px-2 -mx-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
            >
              <h1 className="text-encre text-4xl sm:text-6xl font-titre">
                À quoi on joue
                {/* Le texte visible reste le début du nom accessible : la
                    précision ne s'ajoute qu'à l'oral. */}
                <span className="sr-only">, retour à l’accueil</span>
              </h1>
              <img
                src={asset('/CarteInterrogation.png')}
                alt=""
                aria-hidden="true"
                className="w-10 sm:w-12 h-auto rotate-6 transition-transform duration-200 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-6"
              />
            </a>
            {/* Petit Formal Script est sensiblement plus large et plus haute
                que l'ancienne Corsiva à taille égale : au 3xl d'origine, la
                ligne dépassait le titre de 21 % en largeur et lui volait la
                vedette. Deux crans en dessous, le sous-titre repasse sous la
                largeur du titre. */}
            <p className="text-brique font-manuscrit text-base sm:text-xl leading-snug mt-1">
              Pour toujours avoir des cartes
              <br />à jouer en soirée
            </p>
          </div>
        </header>
        )}

        <main className="flex-1">
          {/* Une vue s'affiche d'un bloc, bandeau de recherche et filtres
              compris : rendus à l'extérieur, ils disparaissaient d'un coup
              pendant que la liste mettait 200 ms à s'effacer, et ce décalage
              était le « saut » visible au retour.
              Le retrait sous l'en-tête est porté ici plutôt que par la barre de
              recherche, pour que toutes les vues en bénéficient. */}
          <div
            className={`relative z-30 px-4 min-h-[70svh] ${
              enKit ? 'pt-4 pb-6' : 'pt-8 pb-16'
            }`}
          >
            {/* Une clé par vue : React remonte le conteneur, ce qui rejoue
                l'animation CSS d'apparition. Un fondu CSS ne dépend d'aucun
                cycle de vie JavaScript et ne peut pas rester bloqué. */}
            <div key={vue} className="anim-vue">
              {vue === 'kit' ? (
                <div className="flex justify-center items-start min-h-[60svh]">
                  {/* Le kit prend le même panneau crème que les autres vues :
                      c'est le même objet — un jeu — vu pendant qu'on y joue. */}
                  <section
                    aria-labelledby="titre-kit"
                    className="anim-panneau bg-creme rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-10"
                  >
                    {/* Le titre du jeu ancre l'écran : on peut y arriver par un
                        lien, sans être passé par la fiche. Deux crans sous le
                        titre d'une fiche — ici, c'est la partie qui compte. */}
                    <div className="relative flex items-center gap-3 mb-4">
                      {/* La carte du jeu, en petit : le kit reste rattaché à
                          l'objet qu'on a ouvert, et non un écran hors sol. */}
                      <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden shadow-md -rotate-2 bg-paille">
                        <GameThumb game={jeuDuKit} />
                      </div>
                      <h2
                        id="titre-kit"
                        className="font-titre text-2xl text-brique leading-tight pr-11"
                      >
                        {jeuDuKit.title}
                      </h2>
                      {/* Les règles restent à portée pendant toute la partie.
                          On lit la fiche, on lance le jeu, et vingt minutes
                          plus tard quelqu'un arrive ou une question tombe :
                          sans ça, il faut quitter le kit — donc mettre la
                          partie de côté — pour relire trois phrases.

                          Une action qui porte sur l'objet affiché, donc une
                          icône seule en haut à droite (docs/boutons.md). Elle
                          vaut pour les quatre orchestrateurs, d'où sa place
                          ici plutôt que dans chacun d'eux. */}
                      <div className="absolute top-0 right-0 flex items-center gap-2">
                        <BoutonIcone
                          icone={CircleHelp}
                          infobulle="Revoir les règles"
                          // Les guillemets évitent l'élision : « les règles de
                          // Avez-vous confiance ? » se lit mal, et une règle
                          // par titre à voyelle initiale serait ingérable.
                          nomAccessible={`Revoir les règles de « ${jeuDuKit.title} »`}
                          onClick={() => setReglesOuvertes(true)}
                        />
                        {/* L'emplacement du menu de la partie, que le kit vient
                            remplir par un portail : c'est lui qui connaît ses
                            propres actions, l'application ne connaît que la
                            sortie. Hors de portée du pouce, ce qui est voulu
                            pour des cibles qui font perdre une partie. */}
                        <div ref={setAncreMenu} className="flex items-center" />
                      </div>
                    </div>

                    {reglesOuvertes && (
                      <Dialogue
                        titre={`Comment on joue à ${jeuDuKit.title}`}
                        onFermer={() => setReglesOuvertes(false)}
                      >
                        <p className="text-ardoise font-texte text-lg leading-relaxed whitespace-pre-line">
                          {jeuDuKit.rules}
                        </p>
                      </Dialogue>
                    )}
                    {/* Le kit se pose sur la fiche ou sur le déroulé : le
                        libellé de sortie doit nommer l'écran où l'on retourne,
                        sans quoi il promet la fiche et rend la soirée. */}
                    <KitJeu
                      game={jeuDuKit}
                      joueurs={joueurs}
                      ancreMenu={ancreMenu}
                      onQuitter={fermerKit}
                      onRetourAccueil={retourAccueil}
                      libelleRetour={etape != null ? 'Retour à la soirée' : 'Retour à la fiche'}
                    />
                  </section>
                </div>
              ) : vue === 'suggestions' ? (
                <div className="flex justify-center items-start min-h-[60svh]">
                  <Suggestions onRetour={fermerPage} />
                </div>
              ) : vue === 'mentions-legales' ? (
                <div className="flex justify-center items-start min-h-[60svh]">
                  <MentionsLegales onRetour={fermerPage} />
                </div>
              ) : vue === 'lancement' ? (
                <div className="flex justify-center items-start min-h-[60svh]">
                  <SoireeLancement
                    soiree={soiree}
                    etape={etape}
                    onEtape={allerEtape}
                    onQuitter={quitterLancement}
                    onLancerKit={ouvrirKit}
                    joueurs={joueurs}
                  />
                </div>
              ) : vue === 'soiree' ? (
                <div className="flex justify-center items-start min-h-[60svh]">
                  <SoireePage
                    soiree={soiree}
                    onRetour={fermerSoiree}
                    onLancer={lancerSoiree}
                    onVider={viderSoiree}
                    onRetirer={retirerDeSoiree}
                    onDeplacer={deplacerDansSoiree}
                    onOuvrirJeu={ouvrirDepuisLaListe}
                    joueurs={joueurs}
                  />
                </div>
              ) : vue === 'jeu' ? (
                <div className="flex justify-center items-start min-h-[60svh]">
                  <GameDetail
                    game={jeuAffiche}
                    goBack={fermerJeu}
                    onAutreJeu={
                      issuDuHasard && filteredGames.length > 1
                        ? () => tirerAuHasard(jeuAffiche)
                        : undefined
                    }
                    joueurs={joueurs}
                    onLancerKit={ouvrirKit}
                    dansSoiree={estDansSoiree(jeuAffiche.slug)}
                    onBasculerSoiree={basculerSoiree}
                  />
                </div>
              ) : (
                <div>
                  <Introduction
                    visible={introduction.visible}
                    onMasquer={introduction.masquer}
                    onAfficher={introduction.afficher}
                  />

                  <div className="flex justify-center mb-8">
                    <div className="relative w-full max-w-md">
                      <label htmlFor="recherche" className="sr-only">
                        Rechercher un jeu
                      </label>
                      <input
                        id="recherche"
                        type="search"
                        placeholder="Rechercher un jeu..."
                        className="w-full py-2 pl-4 pr-10 rounded-full bg-white/80 text-black shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search
                        aria-hidden="true"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                      />
                    </div>
                  </div>

                  <Header filters={filters} setFilters={setFilters} />

                  {/* Le mélange de cartes vit dans le bouton, cf. BoutonTirage. */}
                  <div className="flex flex-wrap justify-center items-center gap-3 my-6">
                    <BoutonTirage
                      candidats={filteredGames}
                      onTirer={() => tirerAuHasard()}
                      disabled={aucunResultat}
                    />
                  </div>

                  {/* Une partie en cours passe devant « Ma soirée » : c'est
                      la seule chose sur cette page qui attend qu'on y revienne,
                      et le chrono le dit d'un coup d'œil. */}
                  {partieEnCours && (
                    <div className="flex justify-center mb-3">
                      <Tuile
                        icone={Timer}
                        titre="Partie en cours"
                        description={`« ${partieEnCours.titre} »`}
                        onClick={() => ouvrirKitDuJeu(partieEnCours.slug)}
                      />
                    </div>
                  )}

                  {/* Entrée vers une section, pas une action : une tuile plutôt
                      qu'un bouton, cf. docs/boutons.md. La ligne d'explication
                      remplace l'infobulle — elle est lisible sans survol. */}
                  <div className="flex justify-center mb-6">
                    <Tuile
                      icone={PartyPopper}
                      titre="Ma soirée"
                      badge={soiree.length > 0 ? soiree.length : null}
                      // Les deux états d'une même ligne : ils gardent la même
                      // voix, à l'infinitif, sous un titre à la première
                      // personne.
                      description={
                        soiree.length === 0
                          ? 'Composer le programme de ma soirée en cliquant sur le bouton + des jeux'
                          : 'Réordonner, partager, puis lancer la soirée jeu après jeu'
                      }
                      onClick={ouvrirSoiree}
                      disabled={soiree.length === 0}
                    />
                  </div>

                  <div className="mb-4">
                    <p
                      className="text-ardoise text-sm text-center"
                      role="status"
                      aria-live="polite"
                    >
                      {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} trouvé
                      {filteredGames.length > 1 ? 's' : ''}
                    </p>

                    {/* Légende de l'étoile : sans elle, le symbole est joli mais
                        muet. Elle n'apparaît que lorsqu'il y a des étoiles à
                        expliquer, et ne promet la tête de liste que si c'est
                        bien l'ordre retenu. */}
                    {nbRecommandes > 0 && (
                      <p className="text-ardoise/80 text-sm text-center mt-1 flex flex-wrap items-center justify-center gap-x-1.5">
                        <Star
                          aria-hidden="true"
                          className="w-3.5 h-3.5 fill-orange text-orange shrink-0"
                        />
                        <span>
                          idéal à {joueurs} joueurs
                          {tri === TRI_PAR_DEFAUT &&
                            (nbRecommandes > 1
                              ? `, et ces ${nbRecommandes} jeux passent en tête`
                              : ', et ce jeu passe en tête')}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Trier réordonne, filtrer retire : le tri garde donc son
                      propre bouton, hors du panneau de filtres. Il est replié,
                      mais son libellé porte l'ordre en cours. */}
                  {!aucunResultat && <TriJeux tri={tri} onTri={setTri} />}

                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 justify-items-center mx-auto max-w-6xl list-none">
                    {aucunResultat ? (
                      <li className="col-span-full text-center bg-creme/90 rounded-2xl px-6 py-5 shadow-md">
                        <p className="font-titre text-xl text-brique">Aucun jeu trouvé 😢</p>
                        <p className="text-ardoise text-sm mt-1">
                          Essayez d&apos;élargir la durée ou de décocher un filtre.
                        </p>
                      </li>
                    ) : (
                      filteredGames.map((game) => (
                        // Pas de `layout` ici : il animait le repositionnement
                        // des cartes au changement de filtre, mais réagissait
                        // aussi au repli de l'explication — et la projection
                        // restait figée sur un translateY de la hauteur du
                        // panneau, poussant toute la liste hors de l'écran.
                        <li key={game.id} className="w-full flex justify-center">
                          <GameCard
                            game={game}
                            onSelect={() => ouvrirDepuisLaListe(game)}
                            joueurs={joueurs}
                            dansSoiree={estDansSoiree(game.slug)}
                            onBasculerSoiree={basculerSoiree}
                          />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Présent sur toutes les vues sauf une partie : ces trois entrées
            portent sur le site entier, et n'ont rien à dire à qui joue. Elles
            volaient une centaine de pixels au bas de l'écran, là où le kit place
            justement ses boutons. */}
        {!enKit && (
          <PiedDePage
            pageActive={vue === 'suggestions' || vue === 'mentions-legales' ? vue : null}
            onSuggestions={() => ouvrirPage('suggestions')}
            onMentions={() => ouvrirPage('mentions-legales')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
