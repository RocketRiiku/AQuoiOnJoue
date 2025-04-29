import { useState, useEffect, useRef } from "react";
import { RotateCw } from "lucide-react";

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
<div className="relative flex justify-between items-center gap-6 px-8 py-6 w-full max-w-6xl bg-white/20 backdrop-blur-sm rounded-3xl shadow-md mx-auto overflow-visible">

{/* Groupe des filtres (Joueurs / Alcool / Durée) */}
<div className="flex justify-center items-center gap-6 flex-grow">
  {['players', 'alcohol', 'duration'].map((type) => (
    <div key={type} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu(openMenu === type ? null : type);
        }}
        className="flex flex-col items-center justify-center px-4 py-2 bg-white text-black rounded-xl border border-gray-300 hover:shadow-md transition-all"
      >
        <span className="font-bold">
          {type === 'players' ? 'Joueurs' : type === 'alcohol' ? 'Alcool' : 'Durée'}
        </span>
        <span className="text-xs text-gray-500">
          {filters[type]
            ? (type === 'players' ? `${filters.players}+` : type === 'duration' ? `${filters.duration} min` : filters.alcohol === 'yes' ? 'Avec' : 'Sans')
            : type === 'players'
            ? 'Ajouter des joueurs'
            : type === 'alcohol'
            ? 'Choisir'
            : 'Ajouter durée'}
        </span>
      </button>

      {/* Popover */}
      {openMenu === type && (
        <div
          ref={(el) => {
            if (!popoverRefs.current) popoverRefs.current = {};
            popoverRefs.current[type] = el;
          }}          
          className="absolute top-[130%] left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {type === 'players' && (
            <>
              <input
                type="range"
                min="2"
                max="8"
                step="2"
                value={filters.players || 2}
                onChange={(e) => setFilters(f => ({ ...f, players: e.target.value }))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs w-full mt-2">
                <span>2+</span><span>4+</span><span>6+</span><span>8+</span>
              </div>
            </>
          )}
          {type === 'alcohol' && (
            <select
              value={filters.alcohol}
              onChange={(e) => setFilters(f => ({ ...f, alcohol: e.target.value }))}
              className="p-2 w-full mt-2 rounded-lg border text-black"
            >
              <option value="">Tous</option>
              <option value="yes">Avec alcool</option>
              <option value="no">Sans alcool</option>
            </select>
          )}
          {type === 'duration' && (
            <>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={filters.duration || 5}
                onChange={(e) => setFilters(f => ({ ...f, duration: e.target.value }))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs w-full mt-2">
                <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  ))}
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
