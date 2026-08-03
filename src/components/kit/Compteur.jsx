/**
 * Réglage d'un nombre : deux flèches et une valeur.
 *
 * Repris du filtre « Joueurs » de la liste — deux réglages de même nature se
 * règlent du même geste. C'est un contrôle de formulaire, pas une action : il ne
 * relève donc pas du système de boutons, cf. docs/boutons.md.
 *
 * Écrit pour l'écran de réglage de « Trois fois rien », sorti de son fichier à
 * l'arrivée du second kit qui demande un effectif avant de commencer. Aucun kit
 * ne peut dessiner sa table sans savoir combien de joueurs s'y assoient.
 */
function Compteur({ label, valeur, unite, min, max, pas = 1, onChange }) {
  const borner = (n) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`Diminuer : ${label}`}
        onClick={() => onChange(borner(valeur - pas))}
        disabled={valeur <= min}
        className="w-10 h-10 text-2xl text-orange font-bold leading-none disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-full"
      >
        &lt;
      </button>
      <span
        aria-live="polite"
        className="font-titre text-2xl text-encre tabular-nums min-w-[3rem] text-center"
      >
        {valeur}
        {unite && <span className="text-base text-ardoise/70 ml-0.5">{unite}</span>}
      </span>
      <button
        type="button"
        aria-label={`Augmenter : ${label}`}
        onClick={() => onChange(borner(valeur + pas))}
        disabled={valeur >= max}
        className="w-10 h-10 text-2xl text-orange font-bold leading-none disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-full"
      >
        &gt;
      </button>
    </div>
  );
}

export default Compteur;
