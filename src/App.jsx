import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { PartyPopper, Search } from 'lucide-react';
import Header from './components/Header';
import GameCard from './components/GameCard';
import GameDetail from './components/GameDetail';
import Introduction from './components/Introduction';
import SoireePage from './components/SoireePage';
import SoireeLancement from './components/SoireeLancement';
import { gamesList } from './data/games';
import { DEFAULT_FILTERS } from './data/filterOptions';
import { filterGames } from './utils/filterGames';
import { useIntroduction } from './utils/useIntroduction';
import { useNavigation } from './utils/useNavigation';

function App() {
  const {
    vue,
    jeuAffiche,
    soiree,
    etape,
    ouvrirJeu,
    fermerJeu,
    ouvrirSoiree,
    fermerSoiree,
    lancerSoiree,
    allerEtape,
    quitterLancement,
    estDansSoiree,
    basculerSoiree,
    retirerDeSoiree,
    deplacerDansSoiree,
    viderSoiree
  } = useNavigation(gamesList);

  const introduction = useIntroduction();
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, material: [] });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = filterGames(gamesList, filters, searchTerm);
  const aucunResultat = filteredGames.length === 0;
  const enListe = vue === 'liste';

  // Changer de vue depuis le bas de la liste laissait l'écran au milieu de nulle part.
  useEffect(() => {
    if (!enListe) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [enListe, vue, etape, jeuAffiche]);

  const handleSurprise = () => {
    if (aucunResultat) return;
    ouvrirJeu(filteredGames[Math.floor(Math.random() * filteredGames.length)]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-nature bg-repeat-y bg-top">
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
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[1400px] sm:h-[900px] bg-stars bg-cover bg-[position:82%_top] sm:bg-top bg-no-repeat"
        style={{
          maskImage: 'linear-gradient(to bottom, #000 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 75%, transparent 100%)'
        }}
      />

      <div className="relative z-20">
        <header className="flex flex-col items-center text-center leading-tight pt-16 sm:pt-20 px-4">
          <div className="anim-entree flex flex-col items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-encre text-4xl sm:text-6xl font-titre">À quoi on joue</h1>
              <img
                src="/CarteInterrogation.png"
                alt=""
                aria-hidden="true"
                className="w-10 sm:w-12 h-auto rotate-6"
              />
            </div>
            {/* Petit Formal Script est sensiblement plus large et plus haute
                que l'ancienne Corsiva à taille égale : au 3xl d'origine, la
                ligne dépassait le titre de 21 % en largeur et lui volait la
                vedette. Deux crans en dessous, le sous-titre repasse sous la
                largeur du titre. */}
            <p className="text-brique font-manuscrit text-lg sm:text-2xl leading-snug mt-1">
              Pour toujours avoir des cartes
              <br />à jouer en soirée
            </p>
          </div>
        </header>

        <main>
          {/* Une vue = un seul enfant d'AnimatePresence, bandeau de recherche et
              filtres compris. Rendus à l'extérieur, ils disparaissaient d'un
              coup pendant que la liste, elle, mettait 200 ms à s'effacer : le
              décalage entre les deux était le « saut » visible au retour. */}
          {/* Le retrait sous l'en-tête est porté ici plutôt que par la barre de
              recherche : toutes les vues en bénéficient, pas seulement la liste. */}
          <div className="relative z-30 px-4 pt-8 pb-16 min-h-[70vh]">
            {/* initial={false} : pas de fondu au tout premier rendu. Sinon la
                vue démarre à opacité 0 et reste invisible jusqu'au chargement
                du module d'animation, différé exprès. Les changements de vue
                suivants, eux, s'animent normalement. */}
            <AnimatePresence mode="wait" initial={false}>
              {vue === 'lancement' ? (
                <m.div
                  key="lancement"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center items-start min-h-[60vh]"
                >
                  <SoireeLancement
                    soiree={soiree}
                    etape={etape}
                    onEtape={allerEtape}
                    onQuitter={quitterLancement}
                  />
                </m.div>
              ) : vue === 'soiree' ? (
                <m.div
                  key="soiree"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center items-start min-h-[60vh]"
                >
                  <SoireePage
                    soiree={soiree}
                    onRetour={fermerSoiree}
                    onLancer={lancerSoiree}
                    onVider={viderSoiree}
                    onRetirer={retirerDeSoiree}
                    onDeplacer={deplacerDansSoiree}
                    onOuvrirJeu={ouvrirJeu}
                  />
                </m.div>
              ) : vue === 'jeu' ? (
                <m.div
                  key="detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center items-start min-h-[60vh]"
                >
                  <GameDetail
                    game={jeuAffiche}
                    goBack={fermerJeu}
                    dansSoiree={estDansSoiree(jeuAffiche.slug)}
                    onBasculerSoiree={basculerSoiree}
                  />
                </m.div>
              ) : (
                <m.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
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

                  <div className="flex flex-wrap justify-center items-center gap-3 my-6">
                    <m.button
                      type="button"
                      whileHover={aucunResultat ? undefined : { scale: 1.05 }}
                      whileTap={aucunResultat ? undefined : { scale: 0.95 }}
                      onClick={handleSurprise}
                      disabled={aucunResultat}
                      className="flex items-center gap-2 px-6 py-1 bg-brique text-creme text-2xl font-titre rounded-full shadow-md transition-opacity disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
                    >
                      <img src="/star.png" alt="" aria-hidden="true" className="w-5 h-5" />
                      Surprends-moi !
                      <img src="/star.png" alt="" aria-hidden="true" className="w-5 h-5" />
                    </m.button>

                    {/* Toujours visible, même vide : sa présence fait découvrir
                        la fonction. Désactivé tant qu'aucun jeu n'est retenu. */}
                    <button
                      type="button"
                      onClick={ouvrirSoiree}
                      disabled={soiree.length === 0}
                      title={
                        soiree.length === 0
                          ? 'Ajoutez des jeux avec le bouton + d’une carte pour composer votre soirée'
                          : 'Voir le programme de la soirée'
                      }
                      className="flex items-center gap-2 px-5 py-1 bg-paille text-encre text-xl font-titre rounded-full shadow-md transition-opacity hover:enabled:bg-[#f2d599] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
                    >
                      <PartyPopper className="w-5 h-5 text-orange" aria-hidden="true" />
                      Notre soirée
                      {soiree.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brique text-creme text-sm">
                          {soiree.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <p
                    className="text-ardoise text-sm text-center mb-4"
                    role="status"
                    aria-live="polite"
                  >
                    {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} trouvé
                    {filteredGames.length > 1 ? 's' : ''}
                  </p>

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
                        <m.li key={game.id} layout className="w-full flex justify-center">
                          <GameCard
                            game={game}
                            onSelect={() => ouvrirJeu(game)}
                            dansSoiree={estDansSoiree(game.slug)}
                            onBasculerSoiree={basculerSoiree}
                          />
                        </m.li>
                      ))
                    )}
                  </ul>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
