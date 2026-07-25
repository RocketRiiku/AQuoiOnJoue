import { useCallback, useState } from 'react';

/**
 * Affichage de l'explication « comment ça marche ».
 *
 * Dépliée à la première visite, repliée ensuite : un site de soirée se rouvre
 * souvent, et réexpliquer le principe à chaque fois deviendrait vite pénible.
 * Le choix est mémorisé localement — comme la sélection de soirée, c'est un
 * confort qui ne doit jamais empêcher le site de fonctionner s'il échoue.
 */
const CLE = 'aquoionjoue:intro-vue';

export function useIntroduction() {
  const [visible, setVisible] = useState(() => {
    try {
      return window.localStorage.getItem(CLE) !== 'vue';
    } catch {
      return true;
    }
  });

  const masquer = useCallback(() => {
    setVisible(false);
    try {
      window.localStorage.setItem(CLE, 'vue');
    } catch {
      /* stockage indisponible : l'explication réapparaîtra, sans gravité */
    }
  }, []);

  const afficher = useCallback(() => setVisible(true), []);

  return { visible, masquer, afficher };
}
