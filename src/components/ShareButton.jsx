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
    const donnees = { title: titre, text: texte, url: lien };

    // `canShare` écarte les navigateurs qui exposent l'API mais refusent ces
    // données : sans lui, l'appel échoue et le partage est perdu au lieu de
    // retomber sur la copie.
    if (navigator.share && (!navigator.canShare || navigator.canShare(donnees))) {
      try {
        await navigator.share(donnees);
        return;
      } catch (error) {
        // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
        if (error?.name === 'AbortError') return;
        // Sinon on tente le presse-papier.
      }
    }

    // Le repli copie le message entier, et non la seule adresse : un lien nu
    // collé dans une conversation n'annonce pas ce qu'il y a au bout.
    try {
      await navigator.clipboard.writeText(texte ? `${texte}\n${lien}` : lien);
      signaler('copie');
    } catch {
      signaler('echec');
    }
  };

  const messages = {
    pret: libelle,
    copie: 'Message copié !',
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
        {etat === 'copie' ? 'Message copié dans le presse-papier' : ''}
        {etat === 'echec'
          ? `Copie impossible. Le lien est ${url ?? window.location.href}`
          : ''}
      </span>
    </>
  );
}

export default ShareButton;
