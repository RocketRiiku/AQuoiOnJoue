import { motion } from "framer-motion";

function GameCard({ game, onSelect }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05 }}
      onClick={onSelect}
      className="relative cursor-pointer p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-4 group"
    >
      {/* Smiley animé */}
      <motion.div
  whileHover={{ scale: 1.2, rotate: 10 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="flex-shrink-0 bg-white rounded-full shadow p-2"
>
  <span className="text-3xl">🎉</span>
</motion.div>


      {/* Titre + Description */}
      <div className="flex flex-col overflow-hidden">
        <h2 className="text-lg font-bold text-gray-900 leading-tight">
          {game.title}
        </h2>
        <p className="text-gray-600 text-sm truncate">
          {game.description}
        </p>
      </div>
    </motion.div>
  );
}

export default GameCard;
