import { motion } from 'framer-motion'

function GameDetail({ game, goBack }) {
  return (
    <motion.div
      layoutId={`card-${game.id}`}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl"
    >
      <h2 className="text-3xl font-bold mb-4 text-gray-800">{game.title}</h2>
      <p className="text-gray-600 mb-6">{game.description}</p>

      <button
        onClick={goBack}
        className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
      >
        ← Retour
      </button>
    </motion.div>
  )
}

export default GameDetail
