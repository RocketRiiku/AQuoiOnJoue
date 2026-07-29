import { Bouton } from './Bouton';
import { lienMailto } from '../utils/contact';

/**
 * La bande de bas de page : proposer un jeu, écrire, lire les mentions légales.
 *
 * Ces trois entrées portent sur le site entier et non sur l'écran affiché. Elles
 * prennent donc la plus basse emphase du système — la variante `lien`, sans
 * cadre ni fond — et se posent sur une bande d'un vert à peine plus sombre que
 * l'herbe du décor. Un encart clair aux pastilles nettes réclamait, en bas de
 * page, plus d'attention que les jeux eux-mêmes.
 *
 * Elle est plaquée contre le bas de la page, pas contre le bas de l'écran : le
 * site se lit sur téléphone en pleine soirée, et rien ne doit recouvrir les
 * règles pendant une partie.
 *
 * « Contact » est un lien `mailto:` et non un bouton : c'est une destination.
 *
 * `pageActive` porte `aria-current` sur l'entrée correspondant à la vue
 * affichée — sans quoi, une fois sur les mentions légales, rien n'indiquerait
 * au clavier ni au lecteur d'écran où l'on se trouve.
 */
const ACTIF = 'text-white underline underline-offset-4';

function PiedDePage({ pageActive = null, onSuggestions, onMentions }) {
  return (
    <footer className="bg-herbe-sombre border-t border-black/5">
      <nav
        aria-label="À propos de ce site"
        className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
      >
        <Bouton
          variante="lien"
          onClick={onSuggestions}
          aria-current={pageActive === 'suggestions' ? 'page' : undefined}
          className={pageActive === 'suggestions' ? ACTIF : ''}
        >
          Suggestions
        </Bouton>

        <Bouton variante="lien" href={lienMailto({ sujet: 'À quoi on joue — un mot' })}>
          Contact
        </Bouton>

        <Bouton
          variante="lien"
          onClick={onMentions}
          aria-current={pageActive === 'mentions-legales' ? 'page' : undefined}
          className={pageActive === 'mentions-legales' ? ACTIF : ''}
        >
          Mentions légales
        </Bouton>
      </nav>
    </footer>
  );
}

export default PiedDePage;
