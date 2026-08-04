/**
 * Brique : où l'on en est dans le tour de table.
 *
 * Sans repère, personne ne sait si la partie dure encore dix minutes ou une
 * heure — et trois de ces jeux demandent explicitement un tour de table complet.
 * Reprise du bandeau de manche de « Trois fois rien », qui remplit le même office
 * depuis le premier kit : une ligne en petites capitales, et de courts segments
 * qui se remplissent.
 *
 * **Un seul niveau, et les segments comptent ce que dit le libellé.** « Tour 1
 * sur 5 » s'affichait au-dessus de trois segments dont deux remplis, qui
 * comptaient en réalité les phases du tour : deux échelles superposées sans
 * qu'on puisse deviner laquelle on lisait. Les phases n'ont pas besoin de barre,
 * leur nom est écrit juste en dessous — « LE RÉCIT », puis « LES QUESTIONS ».
 *
 * Les segments restent **gris**, jamais orange : cette couleur est réservée au
 * chrono, seule information vivante de l'écran. Deux barres de même teinte à cent
 * pixels l'une de l'autre demandaient un temps d'arrêt pour savoir laquelle
 * disait quoi.
 *
 * @param rang    le tour en cours, à partir de 1
 * @param total   le nombre de tours d'un tour de table
 * @param complet tout le monde est passé
 */
function Progression({ rang, total, complet }) {
  return (
    <div>
      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70">
        {complet ? 'Tour de table complet' : `Tour ${rang} sur ${total}`}
      </p>
      {/* Un segment par tour, et non par phase : c'est ce que compte le libellé
          juste au-dessus. Au-delà de dix joueurs la barre deviendrait illisible,
          le compte écrit suffit alors. */}
      {total <= 10 && (
        <ol className="flex gap-1.5 mt-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <li
              key={i}
              className={`h-1 w-5 rounded-full transition-colors ${
                complet || i < rang ? 'bg-ardoise' : 'bg-ardoise/20'
              }`}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

export default Progression;
