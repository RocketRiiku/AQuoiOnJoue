/**
 * Le réglage système « réduire les animations ».
 *
 * La règle CSS globale d'`index.css` raccourcit les animations, mais ne touche
 * pas aux **minuteries** : un tirage qui dure huit cents millisecondes parce
 * qu'un `setTimeout` le dit reste long quel que soit le réglage. Les composants
 * qui pilotent une durée en JavaScript doivent donc le lire eux-mêmes.
 *
 * Deux le font aujourd'hui — le mélange de « Surprends-moi ! » et le jet de dé
 * de La blessure critique — et ils partent du même principe : sans animation
 * demandée, le résultat est immédiat.
 */
export const animationsReduites = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
