/**
 * Catalogue des jeux.
 *
 * Conventions (respectées par tous les jeux, la logique de filtrage en dépend) :
 *  - slug       : identifiant stable utilisé dans l'URL (?jeu=undercover).
 *                 Ne jamais le modifier ensuite : les liens partagés casseraient.
 *  - minPlayers / maxPlayers : nombres. Bornes incluses.
 *  - duration   : durée typique d'une partie, en minutes (nombre).
 *  - material   : tableau. [] = aucun matériel requis, le jeu passe donc
 *                 tous les filtres « matériel ».
 *  - typeGame   : toujours un tableau, même pour une seule valeur.
 *  - alcohol    : booléen. true = le jeu tourne autour de l'alcool.
 *
 * Les libellés de `material`, `typeGame` et `level` alimentent directement les
 * filtres (cf. src/data/filterOptions.js) : ajouter un jeu avec un nouveau
 * libellé fait apparaître l'option, et aucune option ne peut donner 0 résultat.
 */
export const gamesList = [
  {
    id: 1,
    title: 'Le Liars Club',
    slug: 'liars-club',
    description: 'Deux histoires fausses et une vraie. Mentez à tous les autres joueurs !',
    rules:
      "Chacun son tour, un joueur raconte trois anecdotes le concernant : deux sont inventées, une est vraie. Les autres le questionnent librement pendant une minute, puis votent pour l'anecdote qu'ils croient authentique. Le conteur marque un point par joueur trompé ; chaque joueur ayant trouvé la vraie histoire marque un point. On fait un tour complet, et le meilleur menteur l'emporte.",
    minPlayers: 3,
    maxPlayers: 10,
    duration: 40,
    material: [],
    typeGame: ['compétitif', 'à traîtres'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteLeLiarsClub.png'
  },
  {
    id: 2,
    title: 'Eau ou vodka ?',
    slug: 'eau-ou-vodka',
    description: 'Un jeu classique de soirée alcoolisé, qui fonctionne toujours',
    rules:
      "Préparez autant de verres que de joueurs : certains contiennent de l'eau, les autres de la vodka. Mélangez-les hors de vue, puis chaque joueur en boit un cul sec sans laisser transparaître la moindre grimace. Les autres votent ensuite pour désigner qui, selon eux, est tombé sur la vodka. Ceux qui se trompent boivent à leur tour.",
    minPlayers: 3,
    maxPlayers: 10,
    duration: 15,
    material: ['Verres'],
    typeGame: ['compétitif'],
    level: 'Débutant',
    alcohol: true,
    image: '/CarteEauouVodka.png'
  },
  {
    id: 3,
    title: 'Le Joker',
    slug: 'le-joker',
    description: 'Oserez-vous répondre aux questions ou utiliserez-vous votre Joker ?',
    rules:
      "Chaque joueur commence avec un seul Joker. À son tour, on pioche une carte et on lit la question à voix haute : il faut y répondre honnêtement, quelle qu'elle soit. Un joueur qui refuse doit dépenser son Joker — et une fois celui-ci utilisé, plus aucune échappatoire pour le reste de la partie. Le dernier joueur à conserver son Joker gagne.",
    minPlayers: 3,
    maxPlayers: 10,
    duration: 20,
    material: ['Cartes à jouer'],
    typeGame: ['compétitif'],
    level: 'Débutant',
    alcohol: false,
    image: '/CarteLeJoker.png'
  },
  {
    id: 4,
    title: 'Undercover',
    slug: 'undercover',
    description: 'Un mot en commun pour tous, sauf pour le traître !',
    rules:
      "Tous les joueurs reçoivent secrètement le même mot, sauf un : l'Undercover, qui reçoit un mot très proche (par exemple « thé » face à « café »). À tour de rôle, chacun décrit son mot avec un seul terme, sans jamais le prononcer — assez précis pour prouver qu'il fait partie du groupe, assez vague pour ne pas trahir le mot. Après chaque tour, on vote pour éliminer un joueur. Le groupe gagne s'il démasque l'Undercover ; l'Undercover gagne s'il survit jusqu'à ce qu'il ne reste que deux joueurs.",
    minPlayers: 4,
    maxPlayers: 10,
    duration: 20,
    material: ['Papier & stylo'],
    typeGame: ['à traîtres', 'par équipe'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteUndercover.png'
  },
  {
    id: 5,
    title: 'Cacophonie',
    slug: 'cacophonie',
    description: '5 musiques lancées en même temps, à vous de les retrouver',
    rules:
      "Un joueur fait office d'arbitre : il lance cinq morceaux simultanément sur cinq téléphones, puis laisse le vacarme tourner trente secondes. Les équipes notent tous les titres qu'elles pensent reconnaître. On compte un point par titre correct, deux si l'artiste est également trouvé. L'arbitre change à chaque manche, et on joue en cinq manches.",
    minPlayers: 4,
    maxPlayers: 10,
    duration: 25,
    material: ['Téléphone'],
    typeGame: ['par équipe', 'compétitif'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteCacophonie.png'
  },
  {
    id: 6,
    title: 'mix.GPT',
    slug: 'mix-gpt',
    description: 'Une IA vous propose un mix de mini-jeux rapides et funs',
    rules:
      "Décrivez votre soirée à une IA — nombre de joueurs, ambiance, matériel sous la main — et demandez-lui un mini-jeu à jouer dans la minute. Lisez la règle générée à voix haute, jouez-la telle quelle sans négocier, puis relancez-en une nouvelle. Le sel du jeu tient à l'obligation d'accepter tout ce que l'IA propose.",
    minPlayers: 2,
    maxPlayers: 10,
    duration: 10,
    material: ['Téléphone'],
    typeGame: ['coopératif'],
    level: 'Débutant',
    alcohol: false,
    image: '/CartemixGPT.png'
  }
];
