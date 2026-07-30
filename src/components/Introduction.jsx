import { HelpCircle, Play, Plus, SlidersHorizontal, Smartphone, X } from 'lucide-react';
import { BarreActions, Bouton } from './Bouton';

/**
 * Explication du principe, dépliée à la première visite.
 *
 * Plutôt qu'une page d'introduction à franchir avant d'entrer : elle
 * s'interposerait entre le visiteur et les jeux, et serait un passage obligé
 * inutile aux habitués. Ici l'explication est posée au-dessus du catalogue,
 * qui reste visible juste en dessous, et se referme définitivement d'un clic.
 * Un lien discret la rouvre au besoin, pour qu'elle ne soit jamais perdue.
 */
const ETAPES = [
  {
    icone: SlidersHorizontal,
    titre: 'Trouvez',
    texte: 'Filtrez selon votre groupe (joueurs, durée, matériel, niveau).'
  },
  {
    icone: Plus,
    titre: 'Composez',
    texte:
      'Explorez les fiches, et ajoutez vos favoris au programme de la soirée.'
  },
  {
    icone: Play,
    titre: 'Jouez',
    texte:
      'Chaque jeu a sa fiche avec les règles, et certains vont plus loin avec un kit pour jouer directement.'
  }
];

function Introduction({ visible, onMasquer, onAfficher }) {
  if (!visible) {
    return (
      <div className="flex justify-center mb-6">
        <Bouton variante="discret" icone={HelpCircle} onClick={onAfficher}>
          Comment ça marche ?
        </Bouton>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="titre-intro"
      className="anim-panneau relative bg-creme/95 rounded-2xl shadow-md max-w-3xl mx-auto px-5 py-5 sm:px-7 sm:py-6 mb-8"
    >
      <button
        type="button"
        onClick={onMasquer}
        aria-label="Masquer l’explication"
        className="absolute top-3 right-3 p-1.5 rounded-full text-ardoise/60 hover:text-brique hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <h2 id="titre-intro" className="font-titre text-2xl sm:text-3xl text-brique pr-8">
        Ce soir, on joue à quoi&nbsp;?
      </h2>
      <p className="text-ardoise font-texte text-base sm:text-lg mt-1 leading-snug">
        Des jeux d’ambiance à découvrir pour changer des classiques ou trouver
        quoi faire.
      </p>

      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-5">
        {ETAPES.map(({ icone: Icone, titre, texte }, index) => (
          <li key={titre} className="flex sm:flex-col gap-3">
            <span
              aria-hidden="true"
              className="shrink-0 w-9 h-9 rounded-full bg-paille flex items-center justify-center"
            >
              <Icone className="w-4 h-4 text-orange" />
            </span>
            <div className="min-w-0">
              <p className="font-titre text-encre">
                <span className="text-orange">{index + 1}.</span> {titre}
              </p>
              <p className="text-sm text-ardoise leading-snug mt-0.5">{texte}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* L'icône dit de quoi parle la ligne : elle porte sur l'appareil et le
          compte, pas sur la fête. */}
      {/* Sans retour à la ligne : le texte dépasse une ligne sur téléphone, et
          `flex-wrap` le renvoyait alors tout entier sous l'icône restée seule.
          `items-start` le fait courir à droite de l'icône, comme prévu. */}
      <div className="mt-5 flex items-start gap-2 text-sm text-ardoise/80">
        <Smartphone className="w-4 h-4 mt-0.5 text-orange shrink-0" aria-hidden="true" />
        <span>
          Pas besoin de créer un compte&nbsp;! Votre programme reste sur cet
          appareil.
        </span>
      </div>

      <BarreActions className="mt-5">
        <Bouton variante="principal" onClick={onMasquer}>
          C’est parti&nbsp;!
        </Bouton>
      </BarreActions>
    </section>
  );
}

export default Introduction;
