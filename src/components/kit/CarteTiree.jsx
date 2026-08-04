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
  phrase: 'text-xl sm:text-2xl leading-snug'
};

/**
 * @param cle     remonte la carte à neuf, ce qui rejoue l'animation d'arrivée
 * @param annonce lue à voix haute par les lecteurs d'écran : celui qui tient le
 *                téléphone doit connaître le contenu sans le chercher des yeux
 * @param plein   la carte prend la hauteur qu'on lui donne au lieu de son
 *                minimum. Un papier de 144 px flottant au milieu de 400 px de
 *                vide ne ressemblait à rien ; plafonné, pour qu'elle ne devienne
 *                pas une affiche sur grand écran
 */
function CarteTiree({
  texte,
  cle,
  taille = 'mot',
  annonce = true,
  plein = false,
  className = '',
  ...props
}) {
  return (
    <div
      key={cle}
      className={`anim-carte-tiree w-full max-w-md rounded-2xl bg-paille shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-center px-5 py-6 ${
        plein ? 'h-full max-h-[26rem]' : 'min-h-[9rem] sm:min-h-[11rem]'
      } ${className}`}
      {...props}
    >
      <p
        role={annonce ? 'status' : undefined}
        className={`font-titre text-brique leading-tight text-center break-words ${TAILLES[taille]}`}
      >
        {texte}
      </p>
    </div>
  );
}

export default CarteTiree;
