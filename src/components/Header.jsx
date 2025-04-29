import { useState, useEffect, useRef } from "react";
import { RotateCw } from "lucide-react";
import * as Slider from '@radix-ui/react-slider';

function Header({ filters, setFilters }) {
  const [openMenu, setOpenMenu] = useState(null);
  const popoverRefs = useRef({}); // Un objet pour plusieurs refs

  // Fermeture quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      const currentPopover = popoverRefs.current[openMenu];
      if (currentPopover && !currentPopover.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const handleReset = () => {
    setFilters({ players: '', alcohol: '', duration: '' });
    setOpenMenu(null);
  };

  return (
<div className="relative z-30 flex justify-between items-center gap-6 px-8 py-6 w-full max-w-6xl bg-white/30 backdrop-blur-md rounded-3xl shadow-xl mx-auto overflow-visible border border-white/30">

<div key="players" className="relative">
  <button
    onClick={() => setOpenMenu(openMenu === "players" ? null : "players")}
    className="flex flex-col items-center justify-center px-4 py-2 bg-white text-black rounded-xl border border-gray-300 hover:shadow-md transition-all">
    <span className="font-bold">Joueurs</span>
    <span className="text-xs text-gray-500">{filters.players || 'Ajouter des joueurs'}</span>
  </button>
  {openMenu === "players" && (
    <div ref={el => popoverRefs.current.players = el} className="absolute top-[130%] left-1/2 transform -translate-x-1/2 w-56 bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center z-50">
      <div className="flex items-center gap-3">
        <button onClick={() => setFilters(f => ({ ...f, players: Math.max(1, (parseInt(f.players) || 1) - 1) }))} className="px-3 py-1 bg-gray-200 rounded">-</button>
        <span className="font-bold">{filters.players || 1}</span>
        <button onClick={() => setFilters(f => ({ ...f, players: Math.min(10, (parseInt(f.players) || 1) + 1) }))} className="px-3 py-1 bg-gray-200 rounded">+</button>
      </div>
    </div>
  )}
</div>

<div key="duration" className="relative">
  <button
    onClick={() => setOpenMenu(openMenu === "duration" ? null : "duration")}
    className="flex flex-col items-center justify-center px-4 py-2 bg-white text-black rounded-xl border border-gray-300 hover:shadow-md transition-all">
    <span className="font-bold">Durée</span>
    <span className="text-xs text-gray-500">{filters.minDuration && filters.maxDuration ? `Entre ${filters.minDuration} et ${filters.maxDuration} min` : 'Votre temps ?'}</span>
  </button>
  {openMenu === "duration" && (
    <div ref={el => popoverRefs.current.duration = el} className="absolute top-[130%] left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center z-50">
<Slider.Root
  className="relative flex items-center select-none touch-none w-full h-5"
  value={[filters.minDuration || 5, filters.maxDuration || 30]}
  min={5}
  max={30}
  step={1}
  onValueChange={([min, max]) => setFilters(f => ({ ...f, minDuration: min, maxDuration: max }))}
>
  <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
    <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
  </Slider.Track>
  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full shadow-md hover:scale-110 transition-transform" />
  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full shadow-md hover:scale-110 transition-transform" />
</Slider.Root>
<div className="text-xs mt-2 text-center">Entre {filters.minDuration || 5} et {filters.maxDuration || 30} min</div>
    </div>
  )}
</div>

<div key="material" className="relative">
  <button
    onClick={() => setOpenMenu(openMenu === "material" ? null : "material")}
    className="flex flex-col items-center justify-center px-4 py-2 bg-white text-black rounded-xl border border-gray-300 hover:shadow-md transition-all">
    <span className="font-bold">Matériel</span>
    <span className="text-xs text-gray-500">{(filters.material || []).join(', ') || 'Aucun sélectionné'}</span>
  </button>
  {openMenu === "material" && (
    <div ref={el => popoverRefs.current.material = el} className="absolute top-[130%] left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2 z-50">
      {['Papier/Stylo', 'Cartes à jouer'].map((mat) => (
        <label key={mat} className="flex items-center gap-2">
          <input type="checkbox" checked={filters.material?.includes(mat)}
            onChange={(e) => {
              const set = new Set(filters.material || [])
              e.target.checked ? set.add(mat) : set.delete(mat)
              setFilters(f => ({ ...f, material: Array.from(set) }))
            }}
          />
          {mat}
        </label>
      ))}
    </div>
  )}
</div>

<div key="typeGame" className="relative">
  <button
    onClick={() => setOpenMenu(openMenu === "typeGame" ? null : "typeGame")}
    className="flex flex-col items-center justify-center px-4 py-2 bg-white text-black rounded-xl border border-gray-300 hover:shadow-md transition-all">
    <span className="font-bold">Type de jeu</span>
    <span className="text-xs text-gray-500">{filters.typeGame || 'Sélectionner'}</span>
  </button>
  {openMenu === "typeGame" && (
    <div ref={el => popoverRefs.current.typeGame = el} className="absolute top-[130%] left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2 z-50">
      {['coopératif', 'compétitif', 'par équipe', 'à traîtres'].map((type) => (
        <label key={type} className="flex items-center gap-2">
          <input type="radio" name="typeGame" value={type} checked={filters.typeGame === type}
            onChange={() => setFilters(f => ({ ...f, typeGame: type }))} />
          {type}
        </label>
      ))}
    </div>
  )}
</div>

<div key="level" className="relative">
  <button
    onClick={() => setOpenMenu(openMenu === "level" ? null : "level")}
    className="flex flex-col items-center justify-center px-4 py-2 bg-white text-black rounded-xl border border-gray-300 hover:shadow-md transition-all">
    <span className="font-bold">Type de joueurs</span>
    <span className="text-xs text-gray-500">{filters.level || 'Niveau souhaité'}</span>
  </button>
  {openMenu === "level" && (
    <div ref={el => popoverRefs.current.level = el} className="absolute top-[130%] left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-2 z-50">
      {['Débutant', 'Intermédiaire', 'Expert'].map((lvl) => (
        <label key={lvl} className="flex items-center gap-2">
          <input type="radio" name="level" value={lvl} checked={filters.level === lvl}
            onChange={() => setFilters(f => ({ ...f, level: lvl }))} />
          {lvl}
        </label>
      ))}
    </div>
  )}
</div>

{/* Bouton Reset */}
<div className="flex flex-col items-center group">
  <button
    onClick={handleReset}
    className="rounded-full border-2 border-white p-3 transform transition-transform duration-700 hover:rotate-[360deg]"
  >
    <RotateCw className="text-white w-6 h-6" />
  </button>
  <span className="-mt-1 text-white text-sm font-handwritten transform rotate-[-5deg] group-hover:rotate-0 transition-all">
    Réinitialiser
  </span>
</div>

</div>


  );
}

export default Header;
