import { RotateCw } from "lucide-react";
import * as Slider from '@radix-ui/react-slider';

function Header({ filters, setFilters }) {
  const handleReset = () => {
    setFilters({
      players: '',
      alcohol: '',
      minDuration: null,
      maxDuration: null,
      material: [],
      typeGame: '',
      level: ''
    });
  };

  const toggleMaterial = (mat) => {
    const set = new Set(filters.material || []);
    set.has(mat) ? set.delete(mat) : set.add(mat);
    setFilters(f => ({ ...f, material: Array.from(set) }));
  };

  return (
    <div className="relative z-30 max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-4 justify-center flex-wrap items-start relative">
        {/* Joueurs */}
        <div className="bg-[#fae9b4] rounded-xl w-32 h-40 px-2 py-3 shadow-md flex flex-col items-center justify-center -rotate-3">
          <span className="text-[1.2rem] font-[berlin] text-[#133f50] text-center">Joueurs</span>
          <div className="flex items-center gap-2 mt-2">
            <button className="text-[1.6rem] text-[#db4f22] font-bold" onClick={() => setFilters(f => ({ ...f, players: Math.max(1, (parseInt(f.players) || 1) - 1).toString() }))}>
              &lt;
            </button>
            <span className="text-[#123f50] text-3xl font-[berlin]">
              {filters.players || "-"}
            </span>
            <button className="text-[1.6rem] text-[#db4f22] font-bold" onClick={() => setFilters(f => ({ ...f, players: Math.min(10, (parseInt(f.players) || 1) + 1).toString() }))}>
              &gt;
            </button>
          </div>
        </div>

        {/* Durée */}
        <div className="bg-[#fae9b4] rounded-xl w-40 h-40 px-3 py-3 shadow-md flex flex-col items-center justify-center rotate-2">
          <span className="text-[1.2rem] font-[berlin] text-[#133f50] text-center">Durée</span>
          <Slider.Root
            className="w-full mt-3 flex items-center relative h-5"
            value={[filters.minDuration || 5, filters.maxDuration || 30]}
            min={5}
            max={30}
            step={1}
            onValueChange={([min, max]) => setFilters(f => ({ ...f, minDuration: min, maxDuration: max }))}
          >
            <Slider.Track className="bg-[#cccccc] relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-[#123f50] rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#123f50] rounded-full" />
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#123f50] rounded-full" />
          </Slider.Root>
          <span className="text-[#123f50] text-xs mt-2 text-center">
            Entre {filters.minDuration || 5} et {filters.maxDuration || 30} min
          </span>
        </div>

        {/* Matériel */}
        <div className="bg-[#fae9b4] rounded-xl w-40 h-40 px-3 py-3 shadow-md flex flex-col items-center justify-center -rotate-2">
          <span className="text-[1.2rem] font-[berlin] text-[#133f50] text-center">Matériel</span>
          <div className="flex flex-col gap-1 mt-2 text-sm">
            {["Papier & stylo", "Cartes à jouer", "Dé classique"].map(mat => (
              <label key={mat} className="text-[#123f50] flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-[#123f50] appearance-none relative custom-check"
                  checked={filters.material?.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                />
                {mat}
              </label>
            ))}
          </div>
        </div>

        {/* Type de jeu */}
        <div className="bg-[#fae9b4] rounded-xl w-32 h-40 px-3 py-3 shadow-md flex flex-col items-center justify-center rotate-3">
          <span className="text-[1.2rem] font-[berlin] text-[#133f50] text-center">Type de jeu</span>
          <div className="flex flex-col gap-1 mt-2 text-sm">
            {["coopératif", "compétitif", "par équipe", "à traîtres"].map(type => (
              <label key={type} className="text-[#123f50] flex items-center gap-2">
                <input
                  type="radio"
                  name="typeGame"
                  className="w-4 h-4 border-2 border-[#123f50] appearance-none rounded-full relative custom-check"
                  checked={filters.typeGame === type}
                  onChange={() => setFilters(f => ({ ...f, typeGame: type }))}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Type de joueurs */}
        <div className="bg-[#fae9b4] rounded-xl w-32 h-40 px-3 py-3 shadow-md flex flex-col items-center justify-center -rotate-1">
          <span className="text-[1.2rem] font-[berlin] text-[#133f50] text-center">Type de joueurs</span>
          <div className="flex flex-col gap-1 mt-2 text-sm">
            {["Débutant", "Intermédiaire", "Expert"].map(level => (
              <label key={level} className="text-[#123f50] flex items-center gap-2">
                <input
                  type="radio"
                  name="level"
                  className="w-4 h-4 border-2 border-[#123f50] appearance-none rounded-full relative custom-check"
                  checked={filters.level === level}
                  onChange={() => setFilters(f => ({ ...f, level }))}
                />
                {level}
              </label>
            ))}
          </div>
        </div>

        {/* Reset dans une carte */}
        <div className="bg-[#fae9b4] rounded-xl w-28 h-40 px-2 py-4 shadow-md flex flex-col items-center justify-center rotate-1">
          <button
            onClick={handleReset}
            className="rounded-full border-2 border-[#db4f22] p-3 transform transition-transform duration-700 hover:rotate-[360deg]"
          >
            <RotateCw className="text-[#db4f22] w-6 h-6" />
          </button>
          <span className="mt-2 text-[#133f50] text-sm font-[berlin] transform rotate-[-3deg] group-hover:rotate-0 transition-all">
            Réinitialiser
          </span>
        </div>
      </div>
    </div>
  );
}

export default Header;
