import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';

/**
 * Partage un lien.
 *
 * Sur mobile, `navigator.share` ouvre la feuille de partage native (WhatsApp,
 * Messages…), ce qui correspond à l'usage réel : convaincre le groupe sans
 * passer son téléphone. Ailleurs, on retombe sur la copie dans le presse-papier,
 * puis sur une sélection manuelle si même celle-ci est refusée (contexte non
 * sécurisé, permission bloquée).
 */
function ShareButton({
  url,
  titre,
  texte,
  libelle = 'Partager',
  iconeSeule = false,
  className = ''
}) {
  const [etat, setEtat] = useState('pret'); // pret | copie | echec
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const signaler = (valeur) => {
    setEtat(valeur);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setEtat('pret'), 2500);
  };

  const handleClick = async () => {
    const lien = url ?? window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: titre, text: texte, url: lien });
        return;
      } catch (error) {
        // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
        if (error?.name === 'AbortError') return;
        // Sinon on tente le presse-papier.
      }
    }

    try {
      await navigator.clipboard.writeText(lien);
      signaler('copie');
    } catch {
      signaler('echec');
    }
  };

  const messages = {
    pret: libelle,
    copie: 'Lien copié !',
    echec: 'Copie impossible'
  };

  const Icone = etat === 'copie' ? Check : Share2;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        // En variante icône seule, le libellé passe en nom accessible : le
        // bouton reste annoncé « Partager ce jeu » aux lecteurs d'écran.
        aria-label={iconeSeule ? messages[etat] : undefined}
        className={`inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${className}`}
      >
        <Icone className="w-5 h-5" aria-hidden="true" />
        {!iconeSeule && messages[etat]}
      </button>

      {/* Le changement d'état du bouton doit aussi être annoncé vocalement. */}
      <span role="status" aria-live="polite" className="sr-only">
        {etat === 'copie' ? 'Lien copié dans le presse-papier' : ''}
        {etat === 'echec' ? `Copie impossible. Le lien est ${url ?? ''}` : ''}
      </span>
    </>
  );
}

export default ShareButton;
