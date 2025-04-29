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
    <div className="relative min-h-screen bg-soft-stars overflow-x-hidden">
      <div className="star-overlay" />

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

{/* Titre avec cartes autour */}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="flex justify-center items-center gap-4 mt-16 mb-2"
>
  <img
    src="/CarteRenard.png"
    alt="Carte renard"
    className="w-14 h-auto rotate-[-10deg] drop-shadow"
  />
<h1 className="font-title text-[#123f50] text-5xl font-bold">
  À quoi on joue
</h1>
  <img
    src="/CarteInterrogation.png"
    alt="Carte mystère"
    className="w-10 h-auto rotate-[8deg] drop-shadow"
  />
</motion.div>

<p className="font-subtitle text-[#EF793D] text-center mt-2 text-xl italic font-light">
  Pour toujours avoir des cartes à jouer en soirée
</p>

{/* Recherche centrée */}
<div className="relative flex justify-center mt-8
 mb-8
">
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
        <div className="flex justify-center my-6 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSurprise}
            className="px-6 py-3 bg-[#f8dea8] text-[#db4f22] font-bold rounded-xl shadow-md hover:bg-purple-100 transition-all"
          >
            🎉 Surprends-moi !
          </motion.button>
        </div>
      )}

{!selectedGame && (
  <p className="text-[#205262] text-sm text-center mb-2">
    {filteredGames.length} jeu(x) trouvé(s)
  </p>
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
