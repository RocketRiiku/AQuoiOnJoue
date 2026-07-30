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

/**
 * Signalement d'une erreur sur une fiche de jeu.
 *
 * Le message part avec le jeu concerné et l'adresse de sa fiche : sans eux,
 * un signalement arrive sous la forme « il y a une faute dans les règles » et
 * demande un aller-retour pour savoir de quel jeu il s'agit. La liste des
 * champs susceptibles d'être en cause tient lieu de question posée.
 */
export function lienSignalement(game) {
  const adresse = `${window.location.origin}/?jeu=${game.slug}`;

  return lienMailto({
    sujet: `À quoi on joue — erreur sur « ${game.title} »`,
    corps: [
      `Jeu : ${game.title}`,
      `Fiche : ${adresse}`,
      '',
      'Ce qui ne va pas (règles, description, durée, nombre de joueurs,',
      'matériel, niveau…) :',
      ''
    ].join('\n')
  });
}
