import { HelpCircle, PartyPopper, Play, Plus, SlidersHorizontal, X } from 'lucide-react';
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
    texte:
      'Dites combien vous êtes et le temps dont vous disposez. Ou laissez « Surprends-moi ! » trancher à votre place.'
  },
  {
    icone: Plus,
    titre: 'Composez',
    texte:
      'Retenez les jeux qui vous tentent : ils s’ajoutent au programme de votre soirée, que vous pouvez réordonner et partager.'
  },
  {
    icone: Play,
    titre: 'Jouez',
    texte:
      'Lancez la soirée : les règles s’affichent un jeu après l’autre, en grand, pour être lues à voix haute.'
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
        Vous ne savez pas à quoi jouer ce soir&nbsp;?
      </h2>
      <p className="text-ardoise font-texte text-base sm:text-lg mt-1 leading-snug">
        Ce site rassemble des jeux d’ambiance qui ne demandent presque rien : ni
        boîte, ni préparation. Trouvez celui qui colle à votre groupe, ou
        composez tout le programme de la soirée.
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

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ardoise/80">
        <PartyPopper className="w-4 h-4 text-orange shrink-0" aria-hidden="true" />
        <span>
          Tout se garde sur votre appareil, sans compte&nbsp;: votre programme
          vous attendra à la prochaine visite.
        </span>
      </div>

      <BarreActions className="mt-5">
        <Bouton variante="principal" onClick={onMasquer}>
          C’est parti
        </Bouton>
      </BarreActions>
    </section>
  );
}

export default Introduction;
