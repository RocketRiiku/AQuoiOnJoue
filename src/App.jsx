import { useState } from 'react';
import Header from './components/Header';
import GameCard from './components/GameCard';
import GameDetail from './components/GameDetail';
import { gamesList } from './data/games';
import { AnimatePresence, motion } from 'framer-motion';
import { filterGames } from './utils/filterGames';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [filters, setFilters] = useState({
    players: '',
    alcohol: '',
    minDuration: null,
    maxDuration: null,
    material: [],
    typeGame: '',
    level: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = filterGames(gamesList, filters, searchTerm);

  const handleSurprise = () => {
    if (filteredGames.length > 0) {
      const randomGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
      setSelectedGame(randomGame);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Fond étoiles + colline */}
      <div className="absolute top-0 left-0 w-full bg-stars bg-no-repeat bg-top bg-cover z-0" style={{ height: '1400px' }} />
      <div className="absolute left-0 w-full min-h-[2000px] bg-nature bg-repeat-y bg-top z-0" style={{ top: '1400px' }} />

      {/* Contenu principal */}
      <div className="relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center text-center leading-tight pt-20"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-[#133f50] text-6xl font-[berlin]">À quoi on joue</h1>
            <img src="/CarteInterrogation.png" alt="?" className="w-12 h-auto rotate-6" />
          </div>
          <p className="text-[#a64331] font-[corsiva] text-3xl leading-tight mt-1">
            Pour toujours avoir des cartes<br />à jouer en soirée
          </p>
        </motion.div>

        {/* Barre de recherche */}
        <div className="relative flex justify-center mt-8 mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative w-full max-w-md"
          >
            <input
              type="text"
              placeholder="Rechercher un jeu..."
              className="w-full py-2 pl-4 pr-10 rounded-full bg-white/80 text-black focus:outline-none shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              🔍
            </span>
          </motion.div>
        </div>

        {/* Filtres */}
        {!selectedGame && (
          <AnimatePresence mode="wait">
            <motion.div
              key="filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Header filters={filters} setFilters={setFilters} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Bouton Surprends-moi */}
        <div className="flex justify-center my-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSurprise}
            className="flex items-center gap-2 px-6 py-1 bg-[#a64331] text-[#f4efe6] text-2xl font-[berlin] rounded-full shadow-md transition-all"
          >
            <img src="/star.png" alt="étoile gauche" className="w-5 h-5" />
            Surprends-moi !
            <img src="/star.png" alt="étoile droite" className="w-5 h-5" />
          </motion.button>
        </div>

        {!selectedGame && (
          <p className="text-[#205262] text-sm text-center mb-4">
            {filteredGames.length} jeu(x) trouvé(s)
          </p>
        )}

        {/* Liste des jeux ou détail */}
        <div className="relative z-30 px-4 pb-10">
          {!selectedGame ? (
            <motion.div
              key="list"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 justify-items-center mx-auto"
            >
              {filteredGames.length > 0 ? (
                filteredGames.map((game) => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GameCard game={game} onSelect={() => setSelectedGame(game)} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center text-white font-semibold text-xl">
                  Aucun jeu trouvé 😢
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center min-h-[60vh]"
            >
              <GameDetail game={selectedGame} goBack={() => setSelectedGame(null)} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;