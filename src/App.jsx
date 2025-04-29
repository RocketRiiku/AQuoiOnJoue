import { useState } from 'react';
import Header from './components/Header';
import GameCard from './components/GameCard';
import GameDetail from './components/GameDetail';
import { gamesList } from './data/games';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [filters, setFilters] = useState({ players: '', alcohol: '', duration: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = gamesList.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase())
      || game.description.toLowerCase().includes(searchTerm.toLowerCase());
    return (!filters.players || game.players.includes(filters.players)) &&
           (!filters.alcohol || game.alcohol === filters.alcohol) &&
           (!filters.duration || game.duration === filters.duration) &&
           matchesSearch;
  });

  const handleSurprise = () => {
    if (filteredGames.length > 0) {
      const randomGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
      setSelectedGame(randomGame);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-400 to-blue-600 overflow-x-hidden">
      
      {/* Gradient animé */}
      <div className="absolute inset-0 animate-gradient opacity-30 z-0" />

      {/* Flou au clic sur une carte */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
            animate={{ backdropFilter: 'blur(12px)', opacity: 1 }}
            exit={{ backdropFilter: 'blur(0px)', opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 z-20"
          />
        )}
      </AnimatePresence>

{/* HEADER - Titre en haut totalement à gauche */}
<motion.h1
  initial={{ x: -30, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 100 }}
  className="text-4xl font-bold text-white drop-shadow-lg pl-8 pt-6 absolute left-0 top-0"
>
  À quoi on joue ? 🎉
</motion.h1>

{/* Recherche centrée */}
<div className="relative flex justify-center mt-20 mb-8">
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

      {/* HEADER - Filtres */}
      <div className="relative z-30">
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
      </div>

      {/* BOUTON SURPRENDS-MOI */}
      {!selectedGame && (
        <div className="flex justify-center my-6 relative z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSurprise}
            className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl shadow-md hover:bg-purple-100 transition-all"
          >
            🎉 Surprends-moi !
          </motion.button>
        </div>
      )}

      {/* LISTE DES JEUX OU GAME DETAIL */}
      <div className="relative z-30 mt-8 px-4">
        {!selectedGame ? (
          <motion.div
            key="list"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  <GameCard
                    game={game}
                    onSelect={() => setSelectedGame(game)}
                  />
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
  );
}

export default App;
