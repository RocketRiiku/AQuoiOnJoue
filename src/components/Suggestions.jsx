import { useEffect, useRef } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { BarreActions, Bouton } from './Bouton';
import { lienMailto } from '../utils/contact';

/**
 * Proposer un jeu au catalogue.
 *
 * Le site est statique : sans serveur, un formulaire n'aurait nulle part où
 * poster. Le message part donc par courriel, avec un gabarit déjà rempli. La
 * page dit d'abord ce que j'attends, pour que la suggestion arrive utilisable
 * du premier coup plutôt qu'en trois allers-retours.
 *
 * Le texte est à la première personne du singulier, comme les mentions légales :
 * je tiens ce site seul, et le « nous » d'origine promettait une équipe qui
 * n'existe pas.
 *
 * Les champs listés à l'écran et ceux du courriel viennent de la même source :
 * les laisser diverger était le défaut le plus probable à la première retouche.
 */
const CHAMPS = [
  { intitule: 'Le nom du jeu', aide: 'et ses autres noms, s’il en a' },
  {
    intitule: 'Comment on y joue',
    aide: 'quelques phrases, comme vous l’expliqueriez à table'
  },
  { intitule: 'Combien de joueurs', aide: 'un minimum et un maximum' },
  { intitule: 'Combien de temps', aide: 'la durée d’une partie, en minutes' },
  { intitule: 'Le matériel', aide: 'un jeu de cartes, un papier… ou rien du tout' }
];

const GABARIT = CHAMPS.map(({ intitule }) => `${intitule} :`).join('\n\n');

function Suggestions({ onRetour }) {
  const titreRef = useRef(null);

  // Le focus suit la navigation, comme sur la fiche d'un jeu.
  useEffect(() => {
    titreRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onRetour();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onRetour]);

  return (
    <section
      aria-labelledby="titre-suggestions"
      className="anim-panneau bg-creme rounded-2xl shadow-xl w-full max-w-2xl px-6 py-6 sm:px-8 sm:py-8"
    >
      <h2
        id="titre-suggestions"
        ref={titreRef}
        tabIndex={-1}
        className="text-3xl sm:text-4xl font-titre text-brique leading-tight focus:outline-none"
      >
        Un jeu à me faire découvrir&nbsp;?
      </h2>
      <p className="text-ardoise font-texte text-lg mt-2 leading-snug">
        Le catalogue vient en grande partie de mes soirées. J’y mets les jeux
        d’ambiance qui ne demandent presque rien&nbsp;: ni boîte ni préparation,
        et des règles qui se retiennent facilement.
      </p>

      <h3 className="font-titre text-2xl text-encre mt-6 mb-3">
        Ce qu’il me faut
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-none">
        {CHAMPS.map(({ intitule, aide }) => (
          <li key={intitule} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-orange"
            />
            <div className="min-w-0">
              <p className="font-titre text-encre leading-tight">{intitule}</p>
              <p className="text-sm text-ardoise leading-snug">{aide}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-ardoise font-texte mt-5 leading-snug">
        Pas besoin d’illustration. Je dessine les cartes à la main&nbsp;!
      </p>

      {/* Le bouton est un lien `mailto:` : il ouvre le logiciel de messagerie
          au lieu d'envoyer sur place. Le dire évite la surprise, et un libellé
          qui promet l'envoi rendrait l'ouverture du courrielleur incompréhensible. */}
      <p className="text-sm text-ardoise/80 font-texte mt-4 leading-snug">
        Le bouton ouvre votre messagerie avec le message déjà
        commencé&nbsp;: vous complétez, vous envoyez.
      </p>

      <BarreActions>
        <Bouton
          variante="principal"
          icone={Mail}
          href={lienMailto({
            sujet: 'À quoi on joue — suggestion de jeu',
            corps: GABARIT
          })}
        >
          Écrire ma suggestion
        </Bouton>

        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onRetour}>
          Retour aux jeux
        </Bouton>
      </BarreActions>
    </section>
  );
}

export default Suggestions;
