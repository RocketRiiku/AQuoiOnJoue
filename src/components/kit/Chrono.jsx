import { useEffect, useRef, useState } from 'react';
import { tic, vibrer } from '../../utils/sonKit';

/** En dessous, le décompte change de couleur, pulse et se fait entendre. */
export const SEUIL_TENSION = 10;
/** Les toutes dernières secondes, celles qu'on compte à voix haute. */
const SEUIL_VIBRATION = 3;

/**
 * Au-delà, on lit des minutes.
 *
 * Un tour de trente secondes s'annonce « 30 s » ; les cinq minutes de débat de
 * Sang bleu s'annonceraient « 300 s », qu'aucune table ne convertit de tête. Le
 * seuil porte sur la **durée totale**, pas sur le temps restant : sans quoi le
 * même décompte changerait de notation en cours de route.
 */
const SEUIL_MINUTES = 100;

const enMinutes = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * Décompte d'un tour, en secondes.
 *
 * Le temps restant se calcule à partir d'une échéance posée au démarrage, et
 * non en retranchant une seconde à chaque battement : un onglet en arrière-plan
 * ralentit les minuteries, et un décompte qui s'additionne lui-même dérive
 * d'autant. On relit l'horloge, elle ne ment pas.
 *
 * `enMarche` passe à faux pendant une pause : le battement s'arrête, le reste
 * est conservé, et la reprise pose une nouvelle échéance à partir de là. D'où
 * le `ref` — l'effet doit lire le temps restant sans se relancer à chaque
 * seconde, ce qu'une dépendance sur l'état provoquerait.
 *
 * `cle` remonte le décompte à neuf : un tour qui recommence repart de la durée
 * pleine, même si la précédente échéance n'était pas atteinte.
 */
function Chrono({ secondes, enMarche, onFini, cle, son = true }) {
  const [restant, setRestant] = useState(secondes);
  const restantRef = useRef(secondes);
  const onFiniRef = useRef(onFini);
  onFiniRef.current = onFini;

  const poser = (valeur) => {
    restantRef.current = valeur;
    setRestant(valeur);
  };

  useEffect(() => {
    poser(secondes);
  }, [secondes, cle]);

  useEffect(() => {
    if (!enMarche) return undefined;

    const echeance = Date.now() + restantRef.current * 1000;
    // Quatre battements par seconde : l'affichage change à l'instant juste,
    // sans qu'on paie une boucle d'animation pour un chiffre entier.
    const battement = setInterval(() => {
      const reste = Math.max(0, Math.ceil((echeance - Date.now()) / 1000));
      if (reste === restantRef.current) return;

      // La seconde vient de tomber : c'est là, et une seule fois, qu'on sonne.
      if (reste > 0 && reste <= SEUIL_TENSION) {
        if (son) tic({ aigu: reste % 2 === 0 });
        if (reste <= SEUIL_VIBRATION) vibrer(70);
      }

      poser(reste);
      if (reste === 0) {
        clearInterval(battement);
        if (son) tic({ aigu: false, volume: 0.12 });
        vibrer([90, 60, 90]);
        onFiniRef.current?.();
      }
    }, 250);

    return () => clearInterval(battement);
  }, [enMarche, cle, secondes, son]);

  const part = secondes > 0 ? restant / secondes : 0;
  const tendu = restant <= SEUIL_TENSION;
  const longue = secondes >= SEUIL_MINUTES;

  return (
    <div className="w-full">
      <p
        // `timer` sans annonce : une lecture par seconde couvrirait la voix des
        // joueurs. C'est le changement de phase qui est annoncé, pas le compte.
        role="timer"
        aria-live="off"
        className={`font-titre tabular-nums text-5xl sm:text-6xl leading-none transition-colors ${
          tendu ? 'text-brique anim-pulsation' : 'text-encre'
        }`}
      >
        {longue ? enMinutes(restant) : restant}
        {!longue && <span className="text-lg align-top ml-1 text-ardoise/70">s</span>}
      </p>

      <div
        aria-hidden="true"
        className="mt-2 h-2.5 w-full rounded-full bg-ardoise/15 overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-200 ease-linear motion-reduce:transition-none ${
            tendu ? 'bg-brique' : 'bg-orange'
          }`}
          style={{ width: `${part * 100}%` }}
        />
      </div>
    </div>
  );
}

export default Chrono;
