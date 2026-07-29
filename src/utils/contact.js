/**
 * Adresse de contact et fabrication des liens `mailto:`.
 *
 * Déclarée à un seul endroit : l'adresse apparaît sur trois écrans (contact,
 * suggestions, mentions légales) et n'est que provisoire — le site n'a pas
 * encore d'adresse à lui.
 */
export const ADRESSE_CONTACT = 'nathanboumadjer@gmail.com';

/**
 * Construit un lien `mailto:` avec objet et corps déjà remplis.
 *
 * `URLSearchParams` encode l'espace en `+`, que les clients de messagerie
 * n'interprètent pas dans un corps de message — on rétablit `%20`. Les retours
 * à la ligne, eux, sont correctement encodés en `%0A`.
 */
export function lienMailto({ sujet, corps } = {}) {
  const params = new URLSearchParams();
  if (sujet) params.set('subject', sujet);
  if (corps) params.set('body', corps);

  const requete = params.toString().replace(/\+/g, '%20');
  return `mailto:${ADRESSE_CONTACT}${requete ? `?${requete}` : ''}`;
}
