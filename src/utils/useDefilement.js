import { useCallback, useEffect, useState } from 'react';

/**
 * Reste-t-il quelque chose au-delà de ce qu'on voit, au-dessus, en dessous ?
 *
 * Sert à dire qu'une zone continue. Une carte coupée en pleine phrase ne l'annonce
 * pas, et une liste de joueurs coupée à la quatrième ligne laisse croire qu'il n'y
 * en a que quatre. Le repère lui-même est
 * [`OmbreDefilement`](../components/kit/OmbreDefilement.jsx).
 *
 * On écoute le défilement **et** le redimensionnement : une zone change de taille
 * sans que son contenu bouge — rotation de l'écran, ou le passage d'une carte de
 * « pleine » à « réduite » au moment de révéler la réponse.
 *
 * @param ref  la zone défilante
 * @param deps ce qui, en changeant, remet la mesure en cause
 */
export function useDefilement(ref, deps = []) {
  const [reste, setReste] = useState({ dessus: false, dessous: false });

  const mesurer = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Deux pixels de marge : les hauteurs fractionnaires font mentir l'égalité
    // stricte, et une flèche qui reste allumée en bout de course ne dit rien.
    const debord = el.scrollHeight - el.clientHeight;
    setReste({
      dessus: el.scrollTop > 2,
      dessous: debord > 2 && el.scrollTop < debord - 2
    });
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    mesurer();
    el.addEventListener('scroll', mesurer, { passive: true });
    // jsdom n'implémente pas ResizeObserver : le repère se contente alors de la
    // mesure au montage, ce qui suffit à ce que les tests voient juste.
    const observateur =
      typeof ResizeObserver === 'function' ? new ResizeObserver(mesurer) : null;
    observateur?.observe(el);
    return () => {
      el.removeEventListener('scroll', mesurer);
      observateur?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesurer, ...deps]);

  return reste;
}
