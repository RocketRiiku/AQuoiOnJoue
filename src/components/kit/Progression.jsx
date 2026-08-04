/**
 * Brique : où l'on en est. « TOUR 3 SUR 5 », et les phases du tour.
 *
 * Sans repère, personne ne sait si la partie dure encore dix minutes ou une
 * heure — et trois de ces jeux demandent explicitement un tour de table complet.
 * Reprise du bandeau de manche de « Trois fois rien », qui remplit le même
 * office depuis le premier kit : une ligne en petites capitales, et de courts
 * segments qui se remplissent.
 *
 * Les segments restent **gris**, jamais orange : cette couleur est réservée au
 * chrono, seule information vivante de l'écran. Deux barres de même teinte à
 * cent pixels l'une de l'autre demandaient un temps d'arrêt pour savoir laquelle
 * disait quoi.
 *
 * @param rang    le tour en cours, à partir de 1
 * @param total   le nombre de tours d'un tour de table
 * @param complet tout le monde est passé
 * @param etapes  les phases du tour, si le jeu en déclare
 * @param etape   l'index de la phase en cours ; au-delà, c'est la résolution
 */
function Progression({ rang, total, complet, etapes = [], etape = 0 }) {
  // Les phases déclarées, plus la résolution qui les clôt.
  const jalons = [...etapes.map((e) => e.titre), 'Le vote'];

  return (
    <div>
      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70">
        {complet ? 'Tour de table complet' : `Tour ${rang} sur ${total}`}
      </p>
      {etapes.length > 0 && (
        <ol className="flex gap-1.5 mt-1.5" aria-hidden="true">
          {jalons.map((titre, i) => (
            <li
              key={titre}
              className={`h-1 w-7 rounded-full transition-colors ${
                i <= etape ? 'bg-ardoise' : 'bg-ardoise/20'
              }`}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

export default Progression;
