import { ChevronRight } from 'lucide-react';

/**
 * Tuile cliquable : une entrée vers une section, pas une action.
 *
 * « Notre soirée » avait d'abord été traité comme un bouton, et aucun niveau
 * d'emphase ne lui allait : en secondaire il paraissait mis de côté, en
 * principal il serait entré en concurrence avec « Surprends-moi ! », alors
 * qu'une vue ne doit porter qu'une seule action de forte emphase.
 *
 * C'est qu'il ne s'agit pas d'une action mais d'une porte d'entrée. La tuile
 * tire sa présence de sa taille et de son contenu — un titre et une ligne qui
 * explique à quoi elle mène — plutôt que d'une couleur qui crierait plus fort
 * que le reste.
 *
 * Tout le bloc est cliquable et ne contient aucune commande interne : un second
 * point de clic à l'intérieur rendrait la cible ambiguë.
 */
function Tuile({ icone: Icone, titre, description, badge, ...props }) {
  return (
    <button
      type="button"
      // Désactivée, la tuile s'estompe sans devenir illisible : sa description
      // s'adresse justement à qui découvre la fonction.
      className="group w-full max-w-md flex items-center gap-4 text-left bg-paille rounded-2xl shadow-md px-4 py-3 transition-colors hover:enabled:bg-[#f7e2a4] disabled:opacity-80 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
      {...props}
    >
      {Icone && (
        <span
          aria-hidden="true"
          className="shrink-0 w-11 h-11 rounded-full bg-creme/80 flex items-center justify-center"
        >
          <Icone className="w-6 h-6 text-orange" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-titre text-xl text-encre leading-tight">{titre}</span>
          {badge != null && (
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-brique text-creme text-sm shrink-0">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-sm text-ardoise leading-snug mt-0.5">{description}</span>
      </span>

      <ChevronRight
        aria-hidden="true"
        className="shrink-0 w-5 h-5 text-orange transition-transform group-hover:enabled:translate-x-0.5"
      />
    </button>
  );
}

export default Tuile;
