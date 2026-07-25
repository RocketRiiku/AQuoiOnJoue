/**
 * Résout un fichier de `public/` en tenant compte du chemin de base du site.
 *
 * Vite préfixe automatiquement les URL qu'il rencontre dans le HTML et le CSS,
 * mais pas les chaînes littérales du JavaScript. Sans cela, les huit images
 * référencées depuis les composants et le catalogue (cartes des jeux, étoile,
 * carte du titre) tombaient en 404 dès que le site n'est pas servi à la racine
 * — le cas de GitHub Pages, où il vit sous /AQuoiOnJoue/.
 *
 * Les chemins restent écrits « à la racine » dans les données (`/CarteX.png`) :
 * c'est à l'affichage qu'ils sont résolus, ce qui garde le catalogue
 * indépendant de l'hébergeur.
 */
export function asset(chemin) {
  if (!chemin) return chemin;
  // Une URL absolue (http…, data…) n'a pas à être préfixée.
  if (/^[a-z][a-z0-9+.-]*:/i.test(chemin)) return chemin;

  const base = import.meta.env?.BASE_URL ?? '/';
  return `${base.replace(/\/$/, '')}/${chemin.replace(/^\//, '')}`;
}
