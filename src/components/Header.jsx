import { useId, useState } from 'react';
import { ChevronDown, RotateCw, SlidersHorizontal } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import {
  compterFiltresActifs,
  compterFiltresSecondaires,
  DEFAULT_FILTERS,
  DURATION_CEIL,
  DURATION_FLOOR,
  DURATION_STEP,
  HAS_ALCOHOL_GAMES,
  LEVEL_OPTIONS,
  MATERIAL_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  TYPE_OPTIONS
} from '../data/filterOptions';

const CARTE =
  'bg-paille rounded-xl px-3 py-3 h-40 shadow-md flex flex-col items-center justify-center';
const TITRE_CARTE = 'text-[1.2rem] font-titre text-encre text-center leading-tight';

/**
 * Pastille de filtre, avec sa case à cocher.
 *
 * Les filtres secondaires étaient présentés comme quatre cartes de cases à
 * cocher, soit près de 400 px occupés en permanence. Les pastilles disent la
 * même chose en quatre lignes et absorbent les nouvelles options du catalogue
 * en passant simplement à la ligne.
 *
 * La petite case conserve le geste d'origine — cocher d'une croix sur une
 * feuille — en réutilisant la croix dessinée à la main (/Croix.png). Une fois
 * cochée, la pastille passe sur le fond paille des cartes en papier plutôt que
 * sur un aplat plein, pour rester dans la même métaphore.
 *
 * `aria-pressed` plutôt qu'un vrai <input> : un bouton bascule se décoche
 * naturellement d'un second clic, sans le contournement qu'imposaient les
 * boutons radio.
 */
function Pastille({ actif, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-1 ${
        actif
          ? 'bg-paille border-orange text-encre'
          : 'bg-white/70 border-encre/20 text-encre hover:border-orange hover:text-orange'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-4 h-4 shrink-0 rounded-[3px] border-2 border-encre bg-white/80 ${
          actif ? "bg-[url('/Croix.png')] bg-contain bg-center bg-no-repeat" : ''
        }`}
      />
      {children}
    </button>
  );
}

/**
 * Un intitulé de filtre et ses pastilles.
 *
 * Grille à deux colonnes, et non une rangée en `flex-wrap` : l'intitulé tenait
 * la première place d'une rangée partagée avec les pastilles, si bien que
 * celles-ci repassaient sous lui dès qu'elles étaient nombreuses — « Type de
 * jeu » en compte huit. Une colonne réservée les garde toutes à droite, sur
 * autant de lignes qu'il faut. Sur mobile, la grille repasse à une colonne et
 * l'intitulé se remet au-dessus.
 */
function GroupePastilles({ label, children }) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      // 9rem : assez large pour « Matériel sous la main » d'un seul tenant.
      className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-3 gap-y-2 items-start"
    >
      <span
        id={id}
        className="font-titre text-encre text-sm sm:text-right sm:pt-1.5 leading-snug"
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Header({ filters, setFilters }) {
  const [deplie, setDeplie] = useState(false);
  const idPanneau = useId();

  const nbSecondaires = compterFiltresSecondaires(filters);
  const nbActifs = compterFiltresActifs(filters);

  const handleReset = () => setFilters({ ...DEFAULT_FILTERS, material: [] });

  const basculerMateriel = (mat) =>
    setFilters((f) => {
      const actuels = f.material ?? [];
      return {
        ...f,
        material: actuels.includes(mat)
          ? actuels.filter((m) => m !== mat)
          : [...actuels, mat]
      };
    });

  // Un second clic sur une valeur déjà retenue la remet à « indifférent ».
  const basculerSimple = (cle, valeur) =>
    setFilters((f) => ({ ...f, [cle]: f[cle] === valeur ? '' : valeur }));

  /**
   * Saisie directe du nombre de joueurs.
   *
   * On ne borne que par le haut. Borner aussi par le bas empêcherait de taper
   * « 10 » : le « 1 » intermédiaire serait aussitôt réécrit en « 2 ». Un
   * nombre trop petit ne renvoie simplement aucun jeu, ce que l'état vide
   * explique déjà.
   */
  const saisirJoueurs = (valeur) => {
    const chiffres = valeur.replace(/\D/g, '').slice(0, 2);
    const nombre = Math.min(parseInt(chiffres, 10) || 0, MAX_PLAYERS);
    setFilters((f) => ({ ...f, players: nombre === 0 ? '' : String(nombre) }));
  };

  /**
   * Le compteur boucle aux deux bouts, en repassant par « indifférent ».
   *
   * Buter contre la borne obligeait à refaire dix-huit clics en sens inverse
   * pour revenir à un catalogue complet. Un cran de plus au maximum efface donc
   * la valeur, comme un cran de moins au minimum le faisait déjà.
   */
  const stepPlayers = (delta) =>
    setFilters((f) => {
      const current = parseInt(f.players, 10);
      // Premier clic : on démarre au minimum jouable, pas à 1 (aucun jeu ne se
      // joue seul, et le compteur restait bloqué sur un résultat vide).
      if (!Number.isFinite(current)) {
        return { ...f, players: String(delta > 0 ? MIN_PLAYERS : MAX_PLAYERS) };
      }
      const next = current + delta;
      if (next < MIN_PLAYERS || next > MAX_PLAYERS) return { ...f, players: '' };
      return { ...f, players: String(next) };
    });

  // Aux extrémités, la borne devient nulle = « sans limite », ce qui évite de
  // rabattre un jeu long sur le maximum du curseur.
  const setDuration = ([min, max]) =>
    setFilters((f) => ({
      ...f,
      minDuration: min <= DURATION_FLOOR ? null : min,
      maxDuration: max >= DURATION_CEIL ? null : max
    }));

  const sliderMin = filters.minDuration ?? DURATION_FLOOR;
  const sliderMax = filters.maxDuration ?? DURATION_CEIL;

  return (
    <section aria-label="Filtres" className="relative z-30 max-w-3xl mx-auto px-4 py-4">
      {/* Niveau 1 : les deux critères qu'on renseigne presque toujours. */}
      <div className="flex gap-4 justify-center items-stretch">
        <div className={`${CARTE} w-32 -rotate-3`}>
          <span className={TITRE_CARTE}>Joueurs</span>
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              aria-label="Moins de joueurs"
              className="text-[1.6rem] text-orange font-bold leading-none px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
              onClick={() => stepPlayers(-1)}
            >
              &lt;
            </button>
            {/* Saisissable au clavier : atteindre 8 joueurs demandait sept
                clics. `type="text"` avec `inputMode="numeric"` plutôt que
                `type="number"`, pour éviter les flèches natives qui jureraient
                avec la carte, tout en ouvrant le pavé numérique sur mobile. */}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Nombre de joueurs"
              placeholder="–"
              value={filters.players}
              onChange={(e) => saisirJoueurs(e.target.value)}
              className="w-10 bg-transparent text-center text-encre text-3xl font-titre tabular-nums placeholder:text-encre/50 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            />
            <button
              type="button"
              aria-label="Plus de joueurs"
              className="text-[1.6rem] text-orange font-bold leading-none px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded"
              onClick={() => stepPlayers(1)}
            >
              &gt;
            </button>
          </div>
        </div>

        <div className={`${CARTE} w-40 rotate-2`}>
          <span className={TITRE_CARTE}>Durée</span>
          <Slider.Root
            className="w-full mt-3 flex items-center relative h-5 touch-none select-none"
            value={[sliderMin, sliderMax]}
            min={DURATION_FLOOR}
            max={DURATION_CEIL}
            step={DURATION_STEP}
            minStepsBetweenThumbs={1}
            onValueChange={setDuration}
          >
            <Slider.Track className="bg-[#cccccc] relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-encre rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              aria-label="Durée minimum"
              className="block w-4 h-4 bg-white border-2 border-encre rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            />
            <Slider.Thumb
              aria-label="Durée maximum"
              className="block w-4 h-4 bg-white border-2 border-encre rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            />
          </Slider.Root>
          <span className="text-encre text-xs mt-2 text-center">
            Entre {sliderMin} et {sliderMax}
            {filters.maxDuration == null ? '+' : ''} min
          </span>
        </div>
      </div>

      {/* Niveau 2 : tout le reste, replié par défaut. */}
      <div className="flex flex-wrap justify-center items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => setDeplie((v) => !v)}
          aria-expanded={deplie}
          aria-controls={idPanneau}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-creme/90 text-encre font-titre rounded-full shadow-sm hover:bg-creme transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange" aria-hidden="true" />
          Plus de filtres
          {nbSecondaires > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-brique text-creme text-xs">
              {nbSecondaires}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={`w-4 h-4 transition-transform ${deplie ? 'rotate-180' : ''}`}
          />
        </button>

        {/* N'apparaît que lorsqu'il a quelque chose à réinitialiser : la carte
            dédiée occupait une place permanente pour rien. */}
        {nbActifs > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-ardoise hover:text-brique focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-full"
          >
            <RotateCw className="w-4 h-4" aria-hidden="true" />
            Réinitialiser
            <span className="sr-only">
              {nbActifs} filtre{nbActifs > 1 ? 's' : ''} actif{nbActifs > 1 ? 's' : ''}
            </span>
          </button>
        )}
      </div>

      {/* Dépliage animé en CSS : une grille dont l'unique rangée passe de 0fr à
          1fr, ce qui interpole la hauteur du contenu sans avoir à la mesurer.
          `inert` empêche d'atteindre les pastilles au clavier quand c'est replié
          — elles restent dans le DOM pour que la transition soit possible. */}
      <div
        id={idPanneau}
        inert={!deplie}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          deplie ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 bg-paille/90 rounded-2xl shadow-md px-4 py-4 flex flex-col gap-3">
              <GroupePastilles label="Matériel sous la main">
                {MATERIAL_OPTIONS.map((mat) => (
                  <Pastille
                    key={mat}
                    actif={filters.material?.includes(mat) ?? false}
                    onClick={() => basculerMateriel(mat)}
                  >
                    {mat}
                  </Pastille>
                ))}
              </GroupePastilles>

              <GroupePastilles label="Type de jeu">
                {TYPE_OPTIONS.map((type) => (
                  <Pastille
                    key={type}
                    actif={filters.typeGame === type}
                    onClick={() => basculerSimple('typeGame', type)}
                  >
                    {type}
                  </Pastille>
                ))}
              </GroupePastilles>

              {/* « Niveau des règles » et non « des joueurs » : la donnée mesure
                  la complexité des règles à expliquer, pas l'expérience de la
                  table. L'ancien intitulé faisait lire l'inverse. */}
              <GroupePastilles label="Niveau des règles">
                {LEVEL_OPTIONS.map((level) => (
                  <Pastille
                    key={level}
                    actif={filters.level === level}
                    onClick={() => basculerSimple('level', level)}
                  >
                    {level}
                  </Pastille>
                ))}
              </GroupePastilles>

              {HAS_ALCOHOL_GAMES && (
                <GroupePastilles label="Alcool">
                  {[
                    ['oui', 'Avec'],
                    ['non', 'Sans']
                  ].map(([valeur, libelle]) => (
                    <Pastille
                      key={valeur}
                      actif={filters.alcohol === valeur}
                      onClick={() => basculerSimple('alcohol', valeur)}
                    >
                      {libelle}
                    </Pastille>
                  ))}
                </GroupePastilles>
              )}
            </div>
          </div>
        </div>
    </section>
  );
}

export default Header;
