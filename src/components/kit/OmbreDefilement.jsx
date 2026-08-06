import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Brique : le bord d'une zone qui continue au-delà de ce qu'on voit.
 *
 * Un dégradé pour que le contenu s'y éteigne, une flèche pour dire dans quel sens
 * aller. Affiché seulement quand il y a effectivement quelque chose au-delà —
 * c'est [`useDefilement`](../../utils/useDefilement.js) qui le sait.
 *
 * **À poser hors de la zone qui défile.** Un calque absolu placé *dans* un
 * conteneur défilant suit le contenu et sort du cadre au premier geste : il lui
 * faut un parent positionné qui, lui, ne bouge pas. C'est la raison pour laquelle
 * `CarteTiree` se dédouble — l'enveloppe porte le décor et ces repères, la boîte
 * intérieure porte le texte et le défilement.
 *
 * Décoratif au sens strict (`aria-hidden`) : le contenu entier est déjà dans
 * l'arbre d'accessibilité, un lecteur d'écran n'a rien à faire défiler.
 *
 * @param position `haut` ou `bas`, le bord où se plaquer
 * @param fond     la couleur sur laquelle le contenu s'éteint : la carte, ou le
 *                 panneau derrière une liste
 * @param arrondi  les coins à suivre, quand le bord épouse une carte
 */
const BORDS = {
  haut: 'top-0 bg-gradient-to-b items-start pt-0.5',
  bas: 'bottom-0 bg-gradient-to-t items-end pb-0.5'
};

const FONDS = {
  paille: 'from-paille via-paille',
  creme: 'from-creme via-creme'
};

function OmbreDefilement({ position, fond = 'paille', arrondi = '' }) {
  const Fleche = position === 'haut' ? ChevronUp : ChevronDown;
  return (
    // Plus haut qu'une ligne de texte, et opaque sur sa première moitié : à 28 px
    // la dernière ligne se lisait encore au travers et la flèche lui passait
    // dessus.
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 flex h-12 justify-center from-40% to-transparent ${FONDS[fond]} ${BORDS[position]} ${arrondi}`}
    >
      <Fleche className="h-5 w-5 text-brique/70" strokeWidth={2.5} />
    </span>
  );
}

export default OmbreDefilement;
