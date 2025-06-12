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
      className="w-[400px] h-[80px] bg-[#f4efe6] rounded-2xl shadow-md hover:shadow-lg transition-all relative cursor-pointer pl-20 pr-4 py-4 flex items-center gap-4 group"
    >
      {/* Carte visuelle */}
      <motion.div
  whileHover={{ scale: 1.1, rotate: randomRotation + 5, y: -2 }}
  initial={{ rotate: randomRotation }}
  className="absolute -left-1 inset-y-0 my-auto w-16 h-24 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] overflow-hidden"
>
  {game.image ? (
    <img src={game.image} alt="" className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#fae9b4] to-[#f2d599] flex items-center justify-center text-2xl">
      <span>{getGameIcon(game)}</span>
    </div>
  )}
</motion.div>


      {/* Contenu texte */}
      <div className="flex flex-col overflow-hidden gap-0.1">
      <h2 className="text-[1.50rem] font-[berlin] text-[#a64331] leading-tight line-clamp-2">
  {game.title}
</h2>
<p className="text-[1.05rem] text-[#235766] acumin-fine leading-[1.1] line-clamp-2">
  {game.description}
</p>
      </div>
    </motion.div>
  );
}

export default GameCard;