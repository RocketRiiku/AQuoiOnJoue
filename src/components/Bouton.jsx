import Infobulle from './Infobulle';

/**
 * Tous les boutons du site passent par ici.
 *
 * Les boutons étaient auparavant écrits à la main, écran par écran : « Partager »
 * était une icône sur la fiche d'un jeu et une pastille pleine sur le programme
 * de la soirée, et les actions secondaires du programme étaient de simples liens
 * texte. Un composant unique rend l'incohérence impossible à réintroduire.
 *
 * Les règles sont documentées dans docs/boutons.md — les lire avant d'ajouter
 * une action.
 */

const VARIANTES = {
  // Forte emphase. Une seule par vue.
  principal:
    'bg-brique text-creme shadow-md hover:bg-orange focus-visible:ring-offset-2',
  // Emphase moyenne. Accompagne le principal.
  secondaire:
    'border-2 border-brique text-brique hover:bg-brique hover:text-creme focus-visible:ring-offset-2',
  // Basse emphase. Actions auxiliaires, sur leur propre ligne.
  discret:
    'border border-encre/20 bg-white/70 text-encre hover:border-orange hover:text-orange focus-visible:ring-offset-1',
  // Emphase minimale. Réservée au pied de page : sur sa bande verte, des
  // pastilles auraient réclamé plus d'attention que les jeux eux-mêmes.
  // Le crème est à pleine opacité : l'atténuer faisait passer le contraste sur
  // la bande sous le seuil lisible.
  lien:
    'text-creme hover:text-white hover:underline underline-offset-4 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
};

// Une action qui fait perdre quelque chose reste en basse emphase — elle n'est
// jamais l'action principale d'un écran — mais vire au brique au survol.
const DESTRUCTEUR =
  'border border-encre/20 bg-white/70 text-ardoise hover:border-brique hover:text-brique focus-visible:ring-offset-1';

const TAILLES = {
  principal: 'px-6 py-2 text-xl gap-2',
  secondaire: 'px-6 py-2 text-xl gap-2',
  discret: 'px-4 py-1.5 text-sm gap-2',
  lien: 'px-2 py-1 text-sm gap-1.5'
};

// Les deux variantes de basse emphase portent un texte plus petit : une icône
// de 20 px y dépasserait la hauteur de la ligne.
const PETITES = ['discret', 'lien'];

const BASE =
  'inline-flex items-center justify-center rounded-full font-titre transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange';

/**
 * @param icone       icône affichée avant le libellé
 * @param iconeApres  icône affichée après — réservée aux déplacements vers
 *                    l'avant (« Jeu suivant › »), où la flèche suit le sens
 *                    de lecture
 * @param destructeur action qui fait perdre des données
 * @param href        destination réelle (un `mailto:`) : rend un lien plutôt
 *                    qu'un bouton, sans changer d'apparence
 */
export function Bouton({
  variante = 'secondaire',
  icone: Icone,
  iconeApres: IconeApres,
  destructeur = false,
  href,
  className = '',
  children,
  ...props
}) {
  const apparence = destructeur ? DESTRUCTEUR : VARIANTES[variante];
  const tailleIcone = PETITES.includes(variante) ? 'w-4 h-4' : 'w-5 h-5';

  // Écrire un courriel est une destination, pas une commande : un vrai lien se
  // copie, s'ouvre dans un onglet, et est annoncé comme lien par les lecteurs
  // d'écran. L'apparence reste celle du système — le rendre à la main aurait
  // rouvert la porte aux boutons écrits au cas par cas.
  const Element = href ? 'a' : 'button';
  const propresAuType = href ? { href } : { type: 'button' };

  return (
    <Element
      className={`${BASE} ${TAILLES[variante]} ${apparence} ${className}`}
      {...propresAuType}
      {...props}
    >
      {Icone && <Icone className={`${tailleIcone} shrink-0`} aria-hidden="true" />}
      {children}
      {IconeApres && <IconeApres className={`${tailleIcone} shrink-0`} aria-hidden="true" />}
    </Element>
  );
}

/**
 * Bouton réduit à une icône, réservé aux actions portant sur l'objet affiché
 * (partager ce jeu, l'ajouter à la soirée). Toujours groupées en haut à droite
 * du panneau.
 *
 * L'infobulle et le nom accessible sont obligatoires et intégrés ici : une
 * icône seule sans libellé n'est compréhensible que si l'information est
 * exposée au survol *et* au focus, et l'oublier sur une seule icône suffit à
 * rendre tout le groupe incompréhensible.
 */
export function BoutonIcone({ icone: Icone, infobulle, nomAccessible, actif = false, ...props }) {
  return (
    <Infobulle texte={infobulle}>
      <button
        type="button"
        aria-label={nomAccessible ?? infobulle}
        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${
          actif
            ? 'bg-brique border-brique text-creme'
            : 'border-brique/50 text-brique hover:bg-brique hover:text-creme hover:border-brique'
        }`}
        {...props}
      >
        <Icone className="w-5 h-5" aria-hidden="true" />
      </button>
    </Infobulle>
  );
}

/**
 * Rangée d'actions en bas d'un panneau : le principal d'abord, aligné à gauche.
 * Les actions auxiliaires vont dans une seconde rangée, via `BarreActions.Second`.
 */
export function BarreActions({ children, className = '' }) {
  return (
    <div className={`mt-8 flex flex-wrap items-center gap-3 ${className}`}>{children}</div>
  );
}

/** Rangée des actions de basse emphase, sous la rangée principale. */
export function BarreActionsSecondaire({ children, className = '' }) {
  return (
    <div className={`mt-3 flex flex-wrap items-center gap-2 ${className}`}>{children}</div>
  );
}

/** Groupe d'icônes en haut à droite d'un panneau. */
export function ActionsObjet({ children }) {
  return (
    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 flex items-center gap-2">
      {children}
    </div>
  );
}
