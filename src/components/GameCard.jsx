import { motion } from "framer-motion";
import { useMemo } from "react";

function GameCard({ game, onSelect }) {
  const randomRotation = useMemo(() => Math.floor(Math.random() * 11) - 5, []);

  const getGameIcon = (game) => {
    if (game.typeGame === 'coopératif') return '🤝';
    if (game.typeGame === 'compétitif') return '⚔️';
    if (game.typeGame === 'à traîtres') return '🕵️';
    if (game.material?.includes('Cartes à jouer')) return '🃏';
    if (game.alcohol) return '🖤';
    return '🎲';
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05 }}
      onClick={onSelect}
      className="relative cursor-pointer pl-20 pr-6 py-4 bg-[#f4efe6] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-4 group"
    >
      {/* Carte visuelle */}
      <motion.div
  whileHover={{ scale: 1.1, rotate: randomRotation + 5, y: -2 }}
  initial={{ rotate: randomRotation }}
  className="absolute -left-1 inset-y-0 my-auto w-16 h-24 bg-gradient-to-br from-[#fae9b4] to-[#f2d599] rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-2xl"
>
  <span>{getGameIcon(game)}</span>
</motion.div>


      {/* Contenu texte */}
      <div className="flex flex-col overflow-hidden">
        <h2 className="text-lg font-bold text-[#0d3c4c] leading-tight">
          {game.title}
        </h2>
        <p className="text-[#235766] text-sm truncate">
          {game.description}
        </p>
      </div>
    </motion.div>
  );
}

export default GameCard;