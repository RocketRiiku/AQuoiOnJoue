/**
 * Brique : le papier qu'on vient de tirer du chapeau.
 *
 * C'est la métaphore du site — des cartes à jouer posées en vrac — et c'est
 * elle qui porte le contenu, plutôt qu'une ligne de texte de plus. Écrite pour
 * « Trois fois rien », elle sert désormais aussi au défileur et au jet de dé :
 * d'où sa sortie d'`EcranTour`, où elle était enfermée avec le glissement.
 *
 * Deux tailles, et non une mesure automatique de la longueur : un mot à faire
 * deviner et une proposition de vingt mots ne se lisent pas dans le même
 * corps, mais c'est l'écran qui sait lequel il affiche, pas la carte.
 */
const TAILLES = {
  /** Un mot, deux au plus : « Piano », « Jeanne d'Arc ». */
  mot: 'text-4xl sm:text-5xl',
  /** Une phrase entière : un dilemme, un effet de dé, une proposition. */
  phrase: 'text-xl sm:text-2xl leading-snug',
  /**
   * Un paragraphe qu'on lit à voix haute : les résumés du Fitch montent à neuf
   * cents signes. En `phrase` ils débordaient de la carte, et laisser la carte
   * grandir aurait poussé le bouton principal hors de l'écran — or il doit
   * tomber au même endroit à chaque tour (docs/boutons.md). C'est donc le texte
   * qui défile dans la carte, dont la hauteur ne bouge pas.
   */
  passage: 'text-base sm:text-lg leading-relaxed'
};

/**
 * La hauteur d'une carte qui prend la place disponible.
 *
 * Deux choses la tiennent, et toutes deux viennent du même défaut : **rien dans
 * la charpente du site ne plafonne la hauteur du panneau d'un kit.** `flex-1` ne
 * partage que la place *libre* ; sans hauteur définie au-dessus, un bloc grandit
 * avec son contenu, et deux blocs qui réclament chacun le leur poussent la page
 * hors de l'écran. C'est arrivé dès que la carte a dû cohabiter avec autre chose
 * qu'un bouton — les joueurs à désigner du quiz d'animateur.
 *
 * - **`min-h-0` et le défilement** : la carte accepte de se laisser comprimer, et
 *   le texte défile dedans quand il ne rentre plus. Sans ça, elle réclamait son
 *   plafond comme hauteur *minimale* et la colonne ne pouvait rien lui reprendre.
 * - **Le plafond est en hauteur d'écran**, pas seulement en rem. Un mot s'arrête
 *   de lui-même bien avant les 26 rem ; un paragraphe de neuf cents signes, non,
 *   et il prendrait tout. C'est à l'écran que la carte se compare — même unité
 *   que les hauteurs minimales du site, et pour la même raison.
 *
 * À revoir le jour où le panneau aura une hauteur propre : ces plafonds
 * redeviendront alors inutiles.
 */
const HAUTEUR_PLEINE = 'h-full max-h-[min(26rem,42svh)] min-h-0 overflow-y-auto';

/**
 * La carte qui a cessé d'être la vedette de l'écran.
 *
 * Le quiz d'animateur s'en sert une fois la réponse révélée : la table ne cherche
 * plus, elle distribue des points, et ce sont les joueurs à désigner qui doivent
 * tomber sous le pouce.
 */
const HAUTEUR_REDUITE = 'max-h-[20svh] min-h-0 overflow-y-auto';

/**
 * @param cle     remonte la carte à neuf, ce qui rejoue l'animation d'arrivée
 * @param annonce lue à voix haute par les lecteurs d'écran : celui qui tient le
 *                téléphone doit connaître le contenu sans le chercher des yeux
 * @param plein   la carte prend la hauteur qu'on lui donne au lieu de son
 *                minimum. Un papier de 144 px flottant au milieu de 400 px de
 *                vide ne ressemblait à rien ; plafonné, pour qu'elle ne devienne
 *                pas une affiche sur grand écran
 * @param reduite la carte n'est plus la vedette : elle se borne à une part de
 *                l'écran et laisse la place à ce qui l'a remplacée
 */
function CarteTiree({
  texte,
  cle,
  taille = 'mot',
  annonce = true,
  plein = false,
  reduite = false,
  className = '',
  ...props
}) {
  const hauteur = reduite
    ? HAUTEUR_REDUITE
    : plein
      ? HAUTEUR_PLEINE
      : 'min-h-[9rem] sm:min-h-[11rem]';

  return (
    <div
      key={cle}
      className={`anim-carte-tiree w-full max-w-md rounded-2xl bg-paille shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-center px-5 py-6 ${hauteur} ${className}`}
      {...props}
    >
      {/* `whitespace-pre-line` : les paroles de Sorry mon french portent de vrais
          sauts de ligne, parce qu'on lit une chanson vers par vers et que d'un
          bloc elle ne veut plus rien dire. Sans retour à la ligne dans le texte,
          la règle ne change rien pour les autres cartes. */}
      <p
        role={annonce ? 'status' : undefined}
        className={`font-titre text-brique text-center break-words whitespace-pre-line ${
          taille === 'passage' ? '' : 'leading-tight'
        } ${TAILLES[taille]}`}
      >
        {texte}
      </p>
    </div>
  );
}

export default CarteTiree;
