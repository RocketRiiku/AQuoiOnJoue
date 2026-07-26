import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { BoutonIcone } from './Bouton';

/**
 * Partage un lien.
 *
 * Sur mobile, `navigator.share` ouvre la feuille de partage native (WhatsApp,
 * Messages…), ce qui correspond à l'usage réel : convaincre le groupe sans
 * passer son téléphone. Ailleurs, on retombe sur la copie dans le presse-papier,
 * puis sur une sélection manuelle si même celle-ci est refusée (contexte non
 * sécurisé, permission bloquée).
 *
 * Toujours rendu en icône : partager porte sur l'objet affiché, et ces
 * actions-là vivent dans le groupe en haut à droite du panneau (docs/boutons.md).
 */
function ShareButton({ url, titre, texte, libelle = 'Partager' }) {
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

  return (
    <>
      <BoutonIcone
        icone={etat === 'copie' ? Check : Share2}
        infobulle={messages[etat]}
        actif={etat === 'copie'}
        onClick={handleClick}
      />

      {/* Le changement d'état doit aussi être annoncé vocalement. */}
      <span role="status" aria-live="polite" className="sr-only">
        {etat === 'copie' ? 'Lien copié dans le presse-papier' : ''}
        {etat === 'echec' ? `Copie impossible. Le lien est ${url ?? ''}` : ''}
      </span>
    </>
  );
}

export default ShareButton;
