/**
 * Contenu tiré par les kits de jeu — l'onglet « LancerJeu » du tableur.
 *
 * Séparé de `games.js` : le catalogue tient en cinquante entrées qu'on relit,
 * ce contenu-ci se compte en centaines de lignes par jeu et n'intéresse que le
 * kit. Les mêler rendrait le catalogue illisible.
 *
 * Invariant, vérifié par games.test.js : un jeu a des lignes ici **si et
 * seulement si** son `kit` contient un module qui tire du contenu (`prompts`,
 * `distribution`, `regle-secrete`). Sinon le kit pioche dans le vide, ou du
 * contenu écrit reste inatteignable. Cet invariant a déjà cédé trois fois en
 * silence côté tableur.
 *
 * `type` sert à séparer plusieurs pioches dans un même jeu (Petit Bac tire des
 * catégories *et* une lettre). `reponse` est vide quand il n'y a rien à
 * révéler — un mot à faire deviner ne cache pas de solution.
 */
export const contenuLancerJeu = {
  /**
   * 120 mots à faire deviner. Le pot d'une partie en prélève cinq par joueur,
   * et ce sont les mêmes qui reviennent aux trois manches.
   */
  'trois-fois-rien': [
    { type: 'mot', contenu: 'Michael Jackson' },
    { type: 'mot', contenu: 'Beyoncé' },
    { type: 'mot', contenu: 'Napoléon' },
    { type: 'mot', contenu: 'Cléopâtre' },
    { type: 'mot', contenu: 'Albert Einstein' },
    { type: 'mot', contenu: 'Marie Curie' },
    { type: 'mot', contenu: 'Elon Musk' },
    { type: 'mot', contenu: 'Zinédine Zidane' },
    { type: 'mot', contenu: 'Céline Dion' },
    { type: 'mot', contenu: 'Charlie Chaplin' },
    { type: 'mot', contenu: 'Freddie Mercury' },
    { type: 'mot', contenu: "Jeanne d'Arc" },
    { type: 'mot', contenu: 'Louis XIV' },
    { type: 'mot', contenu: 'Barack Obama' },
    { type: 'mot', contenu: 'Lady Gaga' },
    { type: 'mot', contenu: 'Usain Bolt' },
    { type: 'mot', contenu: 'Mozart' },
    { type: 'mot', contenu: 'Van Gogh' },
    { type: 'mot', contenu: 'Coluche' },
    { type: 'mot', contenu: 'Jean Dujardin' },
    { type: 'mot', contenu: 'Omar Sy' },
    { type: 'mot', contenu: 'Angèle' },
    { type: 'mot', contenu: 'Orelsan' },
    { type: 'mot', contenu: 'Stromae' },
    { type: 'mot', contenu: 'Serena Williams' },
    { type: 'mot', contenu: 'Steve Jobs' },
    { type: 'mot', contenu: 'Léonard de Vinci' },
    { type: 'mot', contenu: 'Gandhi' },
    { type: 'mot', contenu: 'Rihanna' },
    { type: 'mot', contenu: 'Teddy Riner' },
    { type: 'mot', contenu: 'Harry Potter' },
    { type: 'mot', contenu: 'Dark Vador' },
    { type: 'mot', contenu: 'Superman' },
    { type: 'mot', contenu: 'Batman' },
    { type: 'mot', contenu: 'Astérix' },
    { type: 'mot', contenu: 'Obélix' },
    { type: 'mot', contenu: 'Sherlock Holmes' },
    { type: 'mot', contenu: 'Mario' },
    { type: 'mot', contenu: 'Pikachu' },
    { type: 'mot', contenu: 'Shrek' },
    { type: 'mot', contenu: "Bob l'éponge" },
    { type: 'mot', contenu: 'Gollum' },
    { type: 'mot', contenu: 'Dracula' },
    { type: 'mot', contenu: 'Frankenstein' },
    { type: 'mot', contenu: 'Cendrillon' },
    { type: 'mot', contenu: 'Peter Pan' },
    { type: 'mot', contenu: 'Tintin' },
    { type: 'mot', contenu: 'Gandalf' },
    { type: 'mot', contenu: 'Hulk' },
    { type: 'mot', contenu: 'Spider-Man' },
    { type: 'mot', contenu: 'Le Père Noël' },
    { type: 'mot', contenu: 'Homer Simpson' },
    { type: 'mot', contenu: 'Son Goku' },
    { type: 'mot', contenu: 'Naruto' },
    { type: 'mot', contenu: 'Elsa' },
    { type: 'mot', contenu: 'Woody' },
    { type: 'mot', contenu: 'Mickey' },
    { type: 'mot', contenu: 'James Bond' },
    { type: 'mot', contenu: 'Terminator' },
    { type: 'mot', contenu: 'Jack Sparrow' },
    { type: 'mot', contenu: 'Parapluie' },
    { type: 'mot', contenu: 'Tire-bouchon' },
    { type: 'mot', contenu: 'Trampoline' },
    { type: 'mot', contenu: 'Aspirateur' },
    { type: 'mot', contenu: 'Menottes' },
    { type: 'mot', contenu: 'Boussole' },
    { type: 'mot', contenu: 'Échelle' },
    { type: 'mot', contenu: 'Micro-ondes' },
    { type: 'mot', contenu: 'Bouée' },
    { type: 'mot', contenu: 'Casque de moto' },
    { type: 'mot', contenu: 'Sèche-cheveux' },
    { type: 'mot', contenu: 'Balai' },
    { type: 'mot', contenu: 'Cintre' },
    { type: 'mot', contenu: 'Passoire' },
    { type: 'mot', contenu: 'Perceuse' },
    { type: 'mot', contenu: 'Chaussure à talon' },
    { type: 'mot', contenu: 'Réveil' },
    { type: 'mot', contenu: 'Valise' },
    { type: 'mot', contenu: 'Cadenas' },
    { type: 'mot', contenu: 'Extincteur' },
    { type: 'mot', contenu: 'Parachute' },
    { type: 'mot', contenu: 'Machine à coudre' },
    { type: 'mot', contenu: 'Loupe' },
    { type: 'mot', contenu: 'Trottinette' },
    { type: 'mot', contenu: 'Brosse à dents' },
    { type: 'mot', contenu: 'Gant de boxe' },
    { type: 'mot', contenu: 'Tondeuse à gazon' },
    { type: 'mot', contenu: 'Serpillière' },
    { type: 'mot', contenu: 'Dé à coudre' },
    { type: 'mot', contenu: 'Rouleau à pâtisserie' },
    { type: 'mot', contenu: 'Aéroport' },
    { type: 'mot', contenu: 'Cimetière' },
    { type: 'mot', contenu: 'Piscine municipale' },
    { type: 'mot', contenu: "Salle d'attente" },
    { type: 'mot', contenu: 'Ascenseur en panne' },
    { type: 'mot', contenu: 'Marché de Noël' },
    { type: 'mot', contenu: 'Salle de sport' },
    { type: 'mot', contenu: 'Autoroute' },
    { type: 'mot', contenu: 'Boulangerie' },
    { type: 'mot', contenu: 'Château fort' },
    { type: 'mot', contenu: 'Hôpital' },
    { type: 'mot', contenu: 'Bibliothèque' },
    { type: 'mot', contenu: 'Camping' },
    { type: 'mot', contenu: 'Discothèque' },
    { type: 'mot', contenu: 'Station-service' },
    { type: 'mot', contenu: 'Vestiaire' },
    { type: 'mot', contenu: 'Grenier' },
    { type: 'mot', contenu: 'Zoo' },
    { type: 'mot', contenu: 'Musée' },
    { type: 'mot', contenu: 'Karaoké' },
    { type: 'mot', contenu: 'Éternuer' },
    { type: 'mot', contenu: 'Ronfler' },
    { type: 'mot', contenu: 'Déménager' },
    { type: 'mot', contenu: 'Faire la queue' },
    { type: 'mot', contenu: 'Rater son train' },
    { type: 'mot', contenu: 'Applaudir' },
    { type: 'mot', contenu: 'Bâiller' },
    { type: 'mot', contenu: 'Chuchoter' },
    { type: 'mot', contenu: 'Trébucher' },
    { type: 'mot', contenu: 'Se réveiller en retard' }
  ]
};

/**
 * Contenu d'un jeu, éventuellement restreint à un type de pioche.
 * Un jeu sans contenu rend un tableau vide plutôt que `undefined` : l'appelant
 * n'a pas à distinguer « pas de kit » de « kit sans contenu ».
 */
export function contenuDuJeu(slug, type) {
  const lignes = contenuLancerJeu[slug] ?? [];
  return type ? lignes.filter((ligne) => ligne.type === type) : lignes;
}
