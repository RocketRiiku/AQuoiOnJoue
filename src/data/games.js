/**
 * Catalogue des jeux.
 *
 * Conventions (respectées par tous les jeux, la logique de filtrage en dépend) :
 *  - slug        : identifiant stable utilisé dans l'URL (?jeu=undercover).
 *                  Ne jamais le modifier ensuite : les liens partagés casseraient.
 *  - minPlayers / maxPlayers : nombres. Bornes incluses.
 *  - idealPlayersMin / idealPlayersMax : fourchette d'effectifs où le jeu est au
 *                  mieux. Toujours minPlayers ≤ idealPlayersMin ≤ idealPlayersMax
 *                  ≤ maxPlayers. Alimente le filtre « Effectif recommandé ».
 *  - durationBase / durationPerPlayer : la durée d'une partie n'est pas une
 *                  constante — elle se calcule, en minutes :
 *                      durationBase + durationPerPlayer × nbJoueurs
 *                  `durationBase` couvre ce que le nombre de joueurs ne change
 *                  pas (règles, mise en place, manches jouées en simultané) et
 *                  `durationPerPlayer` ce que chaque joueur ajoute. Une valeur
 *                  unique annonçait la même durée à 3 et à 8 joueurs.
 *                  Voir dureeJeu() dans src/utils/formatGame.js.
 *  - filRouge    : le jeu se joue en fond, sur toute la soirée, en parallèle des
 *                  autres. Il est exclu du total de la soirée et passe tous les
 *                  filtres de durée. Il ne porte **jamais** de `scoring` : sa
 *                  partie courrait en parallèle des autres kits, et le tiroir
 *                  des parties en cours n'en tient qu'une. Le décompte revient
 *                  aux joueurs, et ses règles le disent.
 *  - material    : tableau. [] = aucun matériel requis, le jeu passe donc
 *                  tous les filtres « matériel ».
 *  - typeGame    : toujours un tableau, même pour une seule valeur.
 *  - alcohol     : booléen. true = le jeu tourne autour de l'alcool.
 *  - image       : facultative. Les cartes sont dessinées à la main : un jeu peut
 *                  entrer au catalogue avant la sienne, GameThumb affiche alors
 *                  la carte au point d'interrogation.
 *
 * Le kit de jeu — trois champs facultatifs et indépendants. Le bouton « Lancer
 * le jeu » apparaît dès que **l'un des trois** est renseigné : un jeu peut avoir
 * un score sans contenu à tirer, ou un chrono sans score.
 *
 *  - kit         : modules d'interaction, cumulables.
 *                  `prompts`       tire une question / un mot / un thème
 *                  `distribution`  le téléphone tourne, chacun révèle son rôle
 *                  `equipes`       constitution des équipes + score par équipe
 *                  `regle-secrete` écran privé du meneur + tirage d'une règle
 *  - scoring     : `compteur` (+1 / −1 par joueur), `manches` (un score par
 *                  manche), `elimination` (on sort de la partie). Cette
 *                  dernière couvre deux formes : la sortie immédiate
 *                  (Undercover, Tueur en série) et le seuil qui laisse une
 *                  chance — deux avertissements pour Qui rit sort, trois pour
 *                  Sur parole. Le seuil n'est dans aucune colonne : il se lit
 *                  dans les règles et le kit le porte jeu par jeu.
 *  - chronoTour  : durée d'**un seul tour**, en **secondes**. À ne pas confondre
 *                  avec durationBase / durationPerPlayer, qui sont en minutes et
 *                  servent à estimer la soirée.
 *
 * Les trois modules qui *tirent* du contenu — prompts, distribution,
 * regle-secrete — exigent des lignes dans src/data/lancerJeu.js, et
 * réciproquement. games.test.js tient l'invariant dans les deux sens.
 *
 * Les libellés de `material`, `typeGame` et `level` alimentent directement les
 * filtres (cf. src/data/filterOptions.js) : ajouter un jeu avec un nouveau
 * libellé fait apparaître l'option, et aucune option ne peut donner 0 résultat.
 * Ils s'écrivent donc tels qu'ils doivent s'afficher, capitale comprise — les
 * pastilles de filtre les reprennent mot pour mot.
 */
export const gamesList = [
  {
    id: 1,
    title: 'Le Liars Club',
    slug: 'liars-club',
    description: 'Deux histoires fausses, une vraie. Mentez mieux que les autres.',
    rules:
      "Chacun son tour, un joueur raconte trois anecdotes sur lui : une vraie, deux inventées. Puis, les autres peuvent l'interroger pendant une minute et votent. Un point par joueur trompé pour le conteur, un point pour chaque joueur qui a démasqué la vraie. Un tour de table complet, et le meilleur menteur gagne.",
    minPlayers: 3,
    maxPlayers: 8,
    idealPlayersMin: 5,
    idealPlayersMax: 7,
    durationBase: 5,
    durationPerPlayer: 6,
    filRouge: false,
    material: [],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteLeLiarsClub.png',
    scoring: 'compteur',
    chronoTour: 60
  },
  {
    id: 2,
    title: 'Eau ou vodka ?',
    slug: 'eau-ou-vodka',
    description: "Difficile de deviner sans goûter. Avez-vous l'âme d'un détective ?",
    rules:
      "Parmi tous les verres d'eau se trouvent un seul shot de vodka. Chaque joueur en choisit un, le boit, sans rien laisser paraître. La table vote : qui était celui qui avait la vodka ? Le jeu est aussi simple que ça !",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 7,
    durationPerPlayer: 2,
    filRouge: false,
    material: ['Verres'],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Débutant',
    alcohol: true,
    image: '/CarteEauouVodka.png'
  },
  {
    id: 3,
    title: 'Le Joker',
    slug: 'le-joker',
    description: "Répondre, ou brûler son Joker. Vous n'en avez qu'un.",
    rules:
      "Chacun démarre avec un seul Joker. À son tour, on pioche une question et on répond honnêtement, sans explication. Refuser coûte le Joker et un verre cul sec. Après ça, plus d'échappatoire : il faudra répondre à tout jusqu'à la fin de la partie. A vous de définir combien de questions seront posées à chaque joueur !",
    minPlayers: 3,
    maxPlayers: 10,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 5,
    durationPerPlayer: 2.5,
    filRouge: false,
    material: [],
    typeGame: ['Chacun pour soi', 'Discussion'],
    level: 'Débutant',
    alcohol: true,
    image: '/CarteLeJoker.png',
    kit: ['prompts']
  },
  {
    id: 4,
    title: 'Undercover',
    slug: 'undercover',
    description: 'Tout le monde a le même mot. Sauf un.',
    rules:
      "Tout le monde reçoit le même mot en secret, sauf l'Undercover, qui en reçoit un très proche : « thé » contre « café ». Chacun son tour, on décrit son mot par un seul terme, sans jamais le prononcer. Assez précis pour rester crédible, assez vague pour ne pas se griller. À la fin de chaque tour, la table vote et élimine un joueur. Le groupe gagne s'il démasque l'Undercover. L'Undercover gagne s'il tient jusqu'à ce qu'il ne reste que deux joueurs.",
    minPlayers: 4,
    maxPlayers: 12,
    idealPlayersMin: 6,
    idealPlayersMax: 10,
    durationBase: 4,
    durationPerPlayer: 2.3,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Chacun pour soi', 'À traîtres', 'Bluff'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteUndercover.png'
  },
  {
    id: 5,
    title: 'Cacophonie',
    slug: 'cacophonie',
    description: 'Cinq musiques lancées en même temps. À vous de les démêler.',
    rules:
      "Un joueur arbitre et diffuse cinq morceaux simultanément. Les autres écoutent, puis proposent les titres qu'ils reconnaissent. Chaque bonne réponse rapporte un point et retire le morceau du mélange, ce qui dégage les suivants. Une erreur fait passer son tour : il faut attendre que tout le monde ait proposé pour retenter. Quand il n'en reste que deux, il faut les annoncer d'un coup. La partie se joue en deux manches. À partir de six joueurs, formez des équipes, sinon les plus rapides raflent tout.",
    minPlayers: 4,
    maxPlayers: 14,
    idealPlayersMin: 5,
    idealPlayersMax: 10,
    durationBase: 17,
    durationPerPlayer: 1,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteCacophonie.png'
  },
  {
    id: 6,
    title: 'Duo, carré ou cash ?',
    slug: 'duo-carre-ou-cash',
    description: 'Trois questions par thème : deux choix, quatre choix, puis rien du tout.',
    rules:
      "Cinq thèmes, trois questions chacun. La première propose deux réponses au choix, la deuxième quatre, la troisième aucune. Plus les questions avancent, plus ça rapporte : un point, deux, puis trois. Définissez en amont le nombre de thèmes et c'est le joueur avec le plus de points à la fin qui gagne la partie !",
    minPlayers: 2,
    maxPlayers: 16,
    idealPlayersMin: 5,
    idealPlayersMax: 12,
    durationBase: 24,
    durationPerPlayer: 0.75,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Débutant',
    alcohol: false,
    image: '/CarteDuoCarreCash.png'
  },
  {
    id: 7,
    title: 'Pyramide',
    slug: 'pyramide',
    description: 'Faites deviner un maximum de mots à votre coéquipier, un indice à la fois.',
    rules:
      "Les équipes passent à tour de rôle, face au reste de la table. L'un des deux coéquipiers voit les mots, piochés un par un dans la liste, et les fait deviner par association : pour « lait », il dira « vache ». Si son partenaire se trompe, il enchaîne avec un autre indice, ou passe le mot. Deux minutes par équipe, deux tours de jeu. En cas d'égalité, l'équipe qui a donné le moins d'indices l'emporte.",
    minPlayers: 4,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 8,
    durationPerPlayer: 2,
    filRouge: false,
    material: [],
    typeGame: ['Par équipe'],
    level: 'Débutant',
    alcohol: false,
    image: '/CartePyramide.png'
  },
  {
    id: 8,
    title: 'Sorry mon french',
    slug: 'sorry-mon-french',
    description: 'Google Traduction est passé sur les paroles. Bon courage !',
    rules:
      "Un joueur lit des paroles de chansons connues passées à la moulinette d'une traduction automatique, sans chanter. Il pioche dans la liste, ou lit sa propre sélection s'il en a préparé une. Les autres cherchent le titre, l'artiste, ou les deux. Le premier à répondre juste marque un point, deux s'il donne les deux. En équipe, on se concerte avant d'annoncer : si quelqu'un fait une proposition fausse, c'est à l'autre équipe de jouer.",
    minPlayers: 4,
    maxPlayers: 14,
    idealPlayersMin: 5,
    idealPlayersMax: 10,
    durationBase: 16,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false,
    image: '/CarteSorrymonfrench.png'
  },
  {
    id: 9,
    title: 'Lost in translation',
    slug: 'lost-in-translation',
    description: "Au Québec, Very Bad Trip s'appelle Lendemain de veille. À vous de faire le chemin inverse à chaque fois.",
    rules:
      "Au Québec, on francise tout, et les titres d'œuvres y changent souvent. Un joueur annonce le titre québécois, « Folie de graduation » ou « Danse lascive », et les autres cherchent le titre connu en France. Le premier qui trouve marque le point. En équipe, on annonce chacun son tour et une erreur passe la main.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 10,
    title: 'Tueur en série',
    slug: 'tueur-en-serie',
    description: 'Une question sur les séries, trente secondes pour aligner un maximum de réponses.',
    rules:
      "Un joueur pose des questions ouvertes sur les séries télé : par exemple « une série avec une couleur dans le titre ». Chacun doit énoncer une série à son tour, en trente secondes maximum. Le joueur qui ne trouve pas est éliminé. Le joueur suivant l'éliminé donne le prochain thème. Le jeu s'arrête quand il n'en reste qu'un.",
    minPlayers: 2,
    maxPlayers: 10,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 6,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: [],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 11,
    title: 'Best-sold',
    slug: 'best-sold',
    description: "Back in Black s'est vendu à 50 millions d'exemplaires. Et les quatre autres ?",
    rules:
      "Cinq œuvres annoncées : albums, films ou livres. Chacun les classe par nombre de ventes, de la moins vendue à la plus vendue. On révèle tous les classements d'un coup. Une œuvre bien placée vaut un point, et un classement parfait en rapporte deux de plus.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 12,
    title: 'Qui vient avant ?',
    slug: 'qui-vient-avant',
    description: 'Watchmen ou Dragon Ball, lequel est sorti en premier ?',
    rules:
      "Cinq œuvres annoncées. Chacun les remet dans l'ordre de sortie, de la plus ancienne à la plus récente. On révèle tous les classements en même temps : un point par œuvre bien placée, deux de plus pour un classement parfait.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 13,
    title: 'Pitch de ouf',
    slug: 'pitch-de-ouf',
    description: 'Pitchez une œuvre en plaçant trois mots imposés, sans vous faire repérer.',
    rules:
      "Un joueur pitche pendant deux minutes une œuvre annoncée à toute la table. Avant de commencer, il reçoit en secret trois mots à glisser dans son discours. Chaque mot placé sans se faire repérer lui rapporte un point. Les autres écoutent et peuvent l'interrompre une fois chacun pour demander si tel mot fait partie de la liste. S'ils tombent juste, le point saute.",
    minPlayers: 3,
    maxPlayers: 8,
    idealPlayersMin: 4,
    idealPlayersMax: 7,
    durationBase: 4,
    durationPerPlayer: 3.5,
    filRouge: false,
    material: [],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Expert',
    alcohol: false
  },
  {
    id: 14,
    title: 'Le Fitch',
    slug: 'le-fitch',
    description: 'Un pitch, cinq détails falsifiés. Trouvez-les.',
    rules:
      "Un joueur lit le résumé d'une œuvre connue. Cinq détails y sont faux : un prénom changé, une date décalée, un objet remplacé. Il pioche un résumé tout prêt, ou en falsifie un lui-même avant la partie. Les autres notent les erreurs qu'ils croient repérer. Un point par erreur trouvée, un point retiré par détail exact signalé à tort.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 17,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 15,
    title: 'Plan pas plan plan',
    slug: 'plan-pas-plan-plan',
    description: "Un seul plan à l'écran pour nommer le film.",
    rules:
      "Un joueur montre un seul plan tiré d'un film, reconnaissable sans être évident : un décor, une lumière. Les autres identifient l'œuvre. Le premier à trouver marque le point, une mauvaise réponse fait passer son tour. En équipe, une seule proposition par plan.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 16,
    title: 'Le souffleur',
    slug: 'le-souffleur',
    description: "« Rien n'est vrai, tout est permis ». Vous voyez d'où ça sort ?",
    rules:
      "Un joueur lit ou fait écouter une réplique culte, tirée d'un film, d'une série ou d'un jeu vidéo. Les autres cherchent l'œuvre d'origine : le premier à répondre juste marque le point, une mauvaise réponse fait passer son tour. En équipe, une seule proposition par réplique.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 17,
    title: 'Harry Cover',
    slug: 'harry-cover',
    description: "La pochette est là, sous vos yeux. Il manque juste 95 % de l'image.",
    rules:
      "Une pochette d'album s'affiche zoomée à l'extrême, réduite à quelques pixels de détail. Elle vaut cinq points. Chacun peut proposer un titre. À chaque échec, l'animateur dézoome d'un cran et la pochette perd un point. Le premier à trouver empoche ce qui reste.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 18,
    title: 'Emo’Quiz',
    slug: 'emo-quiz',
    description: 'Une œuvre entière résumée en cinq emojis.',
    rules:
      "Un joueur affiche un premier emoji, puis en révèle un de plus chaque fois que personne ne trouve. L'énigme vaut cinq points au départ et en perd un à chaque emoji supplémentaire. Chacun propose un titre quand il veut : film, série, chanson ou jeu vidéo. Le premier à trouver empoche ce qui reste. En équipe, une seule proposition par énigme.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 19,
    title: 'Soyez logique',
    slug: 'soyez-logique',
    description: 'Des énigmes de logique, une minute chacune.',
    rules:
      'Un joueur lit les énigmes une par une, une minute par énigme. Un point par énigme résolue.',
    minPlayers: 2,
    maxPlayers: 10,
    idealPlayersMin: 2,
    idealPlayersMax: 6,
    durationBase: 18,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi'],
    level: 'Expert',
    alcohol: false
  },
  {
    id: 20,
    title: 'Le juste chiffre',
    slug: 'le-juste-chiffre',
    description: 'Estimez la valeur exacte sans jamais la dépasser.',
    rules:
      'Chacun estime la réponse chiffrée à une question de culture générale : combien de taxis circulent à New York ? Tout le monde annonce en même temps. Le plus proche marque le point, mais toute estimation supérieure à la vraie valeur saute, aussi précise soit-elle. Cinq questions au total.',
    minPlayers: 2,
    maxPlayers: 16,
    idealPlayersMin: 4,
    idealPlayersMax: 12,
    durationBase: 16,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 21,
    title: 'ETSY c’était ça ?!',
    slug: 'etsy-c-etait-ca',
    description: "Quelqu'un vend ça sur Etsy. Mais qu'est-ce que c'est ?",
    rules:
      "Un joueur a repéré à l'avance des objets insolites en vente sur Etsy ou Leboncoin, chacun renvoyant à une œuvre célèbre. Il les présente un par un, avec le thème général pour seul indice. Chaque personne peut poser des questions fermées, mais prend le risque de donner des indices aux autres. Un point par objet bien rattaché.",
    minPlayers: 4,
    maxPlayers: 16,
    idealPlayersMin: 6,
    idealPlayersMax: 12,
    durationBase: 26,
    durationPerPlayer: 0.4,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 22,
    title: 'Le blindlo-fi',
    slug: 'le-blindlo-fi',
    description: 'Le tube que vous connaissez par cœur, ralenti et noyé sous la reverb.',
    rules:
      "Un joueur diffuse des morceaux connus réarrangés en lo-fi : tempo ralenti, mélodie noyée sous la reverb. Les autres cherchent le titre original. Un point pour le titre, deux avec l'artiste. En équipe, une seule proposition possible.",
    minPlayers: 2,
    maxPlayers: 12,
    idealPlayersMin: 3,
    idealPlayersMax: 8,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 23,
    title: 'Avez-vous confiance ?',
    slug: 'avez-vous-confiance',
    description: 'Six points, deux joueurs dos à dos, une décision : coopérer ou trahir.',
    rules:
      "Chacun se fabrique deux étiquettes, CONFIANCE et TRAHIR, et les garde en main toute la partie. Deux joueurs tirés au sort se placent dos à dos, six points en jeu entre eux. Au signal, chacun pose son étiquette face cachée, puis on retourne les deux ensemble. Deux CONFIANCE : trois points chacun. Une seule trahison : le traître rafle tout. Deux trahisons : les six points sont perdus. On enchaîne les duels jusqu'à ce que chacun soit passé au moins une fois. Rien n'interdit de promettre à voix haute ce qu'on ne compte pas tenir.",
    minPlayers: 4,
    maxPlayers: 16,
    idealPlayersMin: 4,
    idealPlayersMax: 12,
    durationBase: 8,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Débutant',
    alcohol: false,
    scoring: 'compteur'
  },
  {
    id: 24,
    title: 'La blessure critique',
    slug: 'la-blessure-critique',
    description: 'Que se passerait-il si vous lanciez un dé à 20 faces pour décider de votre sort ?',
    rules:
      "À son tour, un joueur lance un dé à vingt faces et subit l'effet correspondant : un gage immédiat, une contrainte pour le reste de la soirée, un verre à boire, parfois rien du tout. Les contraintes s'empilent au fil des tours, et chaque oubli coûte une gorgée. Le 20 sauve. Le 1 fait finir son verre.",
    minPlayers: 3,
    maxPlayers: 10,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 6,
    durationPerPlayer: 4,
    filRouge: true,
    material: ['Dé classique', 'Verres'],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: true,
    kit: ['prompts']
  },
  {
    id: 25,
    title: 'La Murder party',
    slug: 'la-murder-party',
    description: 'Une mission secrète par joueur, à accomplir discrètement au fil de la soirée.',
    rules:
      "Chaque joueur reçoit en secret une mission à accomplir sur quelqu'un d'autre au cours de la soirée : lui faire répéter une phrase, glisser une carte dans sa poche. La cible ne doit jamais comprendre qu'elle est visée. Si elle pose la question franchement, la tentative est perdue. Mission réussie, le joueur récupère la mission de sa victime et hérite de sa mission. Le plus de missions réussies en fin de soirée l'emporte : les papiers gardés en main font le compte.",
    minPlayers: 5,
    maxPlayers: 15,
    idealPlayersMin: 6,
    idealPlayersMax: 15,
    durationBase: 0,
    durationPerPlayer: 0,
    filRouge: true,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi', 'À traîtres'],
    level: 'Expert',
    alcohol: false
  },
  {
    id: 26,
    title: '30 secondes chrono',
    slug: '30-secondes-chrono',
    description: 'Un thème, trente secondes, autant de réponses que possible.',
    rules:
      "À tour de rôle, un joueur choisit un thème parmi ceux proposés : les capitales du monde, les expressions françaises, les séries Netflix, etc. Trente secondes pour citer un maximum d'éléments, sans répétition ni approximation. Un point par proposition valable. Le dernier au score choisit son thème en premier. En équipe, un seul joueur parle et les autres lui soufflent des idées.",
    minPlayers: 4,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 10,
    durationBase: 4,
    durationPerPlayer: 2,
    filRouge: false,
    material: [],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 27,
    title: 'La pieuvre',
    slug: 'la-pieuvre',
    description: "Tous les regards se lèvent en même temps. Croisez celui de quelqu'un et vous buvez.",
    rules:
      "Tout le monde autour de la table, tête baissée vers ses pieds. On compte jusqu'à trois. Au top, chacun relève la tête en fixant un joueur de son choix. Deux regards qui se croisent, c'est perdu pour les deux : un shot chacun. On recommence aussitôt, sans temps mort.",
    minPlayers: 3,
    maxPlayers: 16,
    idealPlayersMin: 5,
    idealPlayersMax: 12,
    durationBase: 6,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: ['Verres'],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: true
  },
  {
    id: 28,
    title: 'Oui ou non ?',
    slug: 'oui-ou-non',
    description: 'Répondez par oui ou par non, sans rien justifier.',
    rules:
      "Un joueur lit une proposition à voix haute, parfois anodine mais surtout embarrassante. Les autres répondent en même temps, à main levée, par oui ou par non, sans jamais justifier ni nuancer. On enchaîne (tant que l'ambiance le permet).",
    minPlayers: 3,
    maxPlayers: 14,
    idealPlayersMin: 4,
    idealPlayersMax: 10,
    durationBase: 12,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Discussion'],
    level: 'Débutant',
    alcohol: false,
    kit: ['prompts']
  },
  {
    id: 29,
    title: 'Trois fois rien',
    slug: 'trois-fois-rien',
    description: 'Trois manches avec les mêmes mots, et de moins en moins de dialogue.',
    rules:
      "Deux équipes minimum. On remplit un pot de personnalités, de personnages et d'objets : cinq papiers pliés par joueur, piochés dans la liste ou écrits à la main. Première manche : faire deviner un maximum de mots en trente secondes, en parlant librement, sans jamais prononcer le mot. Deuxième manche : les mêmes mots mais un seul mot d'indice. Troisième : mime uniquement. L'équipe qui totalise le plus de papiers l'emporte.",
    minPlayers: 4,
    maxPlayers: 16,
    idealPlayersMin: 6,
    idealPlayersMax: 12,
    durationBase: 6,
    durationPerPlayer: 3,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Par équipe'],
    level: 'Débutant',
    alcohol: false,
    kit: ['prompts', 'equipes'],
    scoring: 'manches',
    chronoTour: 30
  },
  {
    id: 30,
    title: 'Le Petit Menteur',
    slug: 'le-petit-menteur',
    description: "Inventez la définition d'un mot que personne ne connaît pour berner les autres.",
    rules:
      "Le meneur cherche un mot que potentiellement personne ne connaît autour de la table, dans la liste ou dans un vrai dictionnaire, et l'annonce. Chacun rédige alors en secret une définition inventée, la plus crédible possible, pendant que le meneur recopie la vraie. Il lit ensuite toutes les définitions dans le désordre, sans se trahir. Chacun vote pour celle qu'il croit authentique. Un point par joueur trompé par votre définition, deux points pour qui a trouvé la vraie. Le meneur change à chaque tour. Si vous connaissez la définition du mot : n'écrivez pas la vraie, il faut berner les autres.",
    minPlayers: 3,
    maxPlayers: 8,
    idealPlayersMin: 4,
    idealPlayersMax: 7,
    durationBase: 3,
    durationPerPlayer: 4.5,
    filRouge: false,
    material: ['Papier & stylo', 'Téléphone'],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 31,
    title: "Tête d'affiche",
    slug: 'tete-d-affiche',
    description: 'Le célèbre jeu du post-it sur votre front, où vous devez deviner qui vous êtes.',
    rules:
      "Chacun écrit un nom de personnage, réel ou fictif, et le colle sur le front de son voisin de gauche sans le lui montrer. Tout le monde voit donc tous les noms sauf le sien. À tour de rôle, on pose au groupe une question fermée : est-ce que je suis vivant ? est-ce que je joue dans un film ? Un oui donne droit à une question de plus, un non passe la main. Le premier à deviner son identité l'emporte.",
    minPlayers: 3,
    maxPlayers: 10,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 5,
    durationPerPlayer: 2.5,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 32,
    title: 'Tu préfères ?',
    slug: 'tu-preferes',
    description: 'Vous avez le choix entre deux options. Laquelle choisir ?',
    rules:
      "Un joueur lit un dilemme à voix haute : deux options aussi désagréables l'une que l'autre, ou aussi tentantes. Tout le monde répond en même temps, à main levée. Pas d'abstention, pas de demande de précision.",
    minPlayers: 2,
    maxPlayers: 14,
    idealPlayersMin: 3,
    idealPlayersMax: 10,
    durationBase: 10,
    durationPerPlayer: 0.75,
    filRouge: false,
    material: [],
    typeGame: ['Discussion'],
    level: 'Débutant',
    alcohol: false,
    kit: ['prompts'],
    chronoTour: 60
  },
  {
    id: 33,
    title: 'Ban word',
    slug: 'ban-word',
    description: 'Trois mots bannis pour toute la soirée. Piégez les autres et ne vous faites pas prendre.',
    rules:
      "En début de soirée, le groupe bannit ensemble trois ou quatre mots courants : « oui », « jeu », un prénom fréquent. Dès qu'un joueur lâche un mot interdit et qu'un autre le relève dans la seconde, celui qui a relevé marque un point. Tout l'art consiste à faire prononcer le mot aux autres sans le dire soi-même. Le jeu tourne en fond toute la soirée, en parallèle des autres : à chacun de garder ses points en tête. Le plus gros total l'emporte.",
    minPlayers: 3,
    maxPlayers: 20,
    idealPlayersMin: 5,
    idealPlayersMax: 15,
    durationBase: 0,
    durationPerPlayer: 0,
    filRouge: true,
    material: [],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 34,
    title: 'Cow-boy',
    slug: 'cow-boy',
    description: "Un tueur élimine d'un clin d'œil. Démasquez-le avant d'y passer.",
    rules:
      "Tout le monde ferme les yeux. Le meneur tape sur l'épaule d'un joueur : ce sera le tueur (vous pouvez aussi utiliser le site comme meneur !). On rouvre les yeux et le groupe discute normalement, assis en cercle ou en circulant. Le tueur élimine d'un clin d'œil discret. Sa victime attend quelques secondes, puis meurt le plus théâtralement possible. On peut accuser quelqu'un, à condition de trouver un joueur pour appuyer l'accusation. Accusation juste, le groupe gagne. Accusation fausse, les deux accusateurs sautent sur-le-champ.",
    minPlayers: 6,
    maxPlayers: 16,
    idealPlayersMin: 8,
    idealPlayersMax: 12,
    durationBase: 5,
    durationPerPlayer: 1.25,
    filRouge: false,
    material: [],
    typeGame: ['Coopératif', 'À traîtres'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 35,
    title: 'Petit Bac',
    slug: 'petit-bac',
    description: 'Une lettre, six catégories, et le premier qui finit stoppe tout le monde.',
    rules:
      "Six catégories en colonnes sur chaque feuille : pays, prénom, métier, animal, film, marque. On les tire au sort, ou le groupe compose sa propre grille. Pour la lettre, un tirage ou méthode classique : un joueur récite l'alphabet dans sa tête jusqu'à ce qu'on lui dise stop. Remplissez toutes les colonnes avec des mots commençant par cette lettre, le plus vite possible. Le premier qui termine annonce stop : tout le monde pose son stylo. Deux points par réponse unique, un point si quelqu'un d'autre l'a trouvée, rien pour une case vide.",
    minPlayers: 2,
    maxPlayers: 14,
    idealPlayersMin: 3,
    idealPlayersMax: 10,
    durationBase: 14,
    durationPerPlayer: 1,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 36,
    title: "Du Coq à l'Âne",
    slug: 'du-coq-a-l-ane',
    description: 'Une phrase, un dessin, une phrase, un dessin… Ça donne quoi au final ?',
    rules:
      "Chacun écrit une phrase absurde en haut d'une feuille, la sienne ou celle qu'il a tirée, puis passe à son voisin de gauche. Celui-ci la dessine, replie le papier, et ne laisse voir que le dessin. Le suivant écrit la phrase que ce dessin lui inspire, replie à son tour, et ainsi de suite jusqu'à ce que chaque feuille revienne à son auteur. On déplie et on lit tout à voix haute. Personne ne gagne.",
    minPlayers: 5,
    maxPlayers: 12,
    idealPlayersMin: 6,
    idealPlayersMax: 10,
    durationBase: 5,
    durationPerPlayer: 2.5,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Coopératif'],
    level: 'Débutant',
    alcohol: false,
    kit: ['prompts']
  },
  {
    id: 37,
    title: 'Je n’ai jamais',
    slug: 'je-n-ai-jamais',
    description: "Il est temps d'avouer tout ce que vous avez fait.",
    rules:
      "À tour de rôle, un joueur annonce quelque chose qu'il n'a jamais fait : « je n'ai jamais menti à mon patron ». Tous ceux qui l'ont fait boivent une gorgée, sans avoir à s'expliquer. Si un seul boit : il doit raconter l'histoire. Personne ne boit ? C'est l'annonceur qui trinque. Viser une seule personne autour de la table reste autorisé, et franchement recommandé.",
    minPlayers: 3,
    maxPlayers: 15,
    idealPlayersMin: 4,
    idealPlayersMax: 12,
    durationBase: 8,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: ['Verres'],
    typeGame: ['Discussion'],
    level: 'Débutant',
    alcohol: true
  },
  {
    id: 38,
    title: 'Chef d’orchestre',
    slug: 'chef-d-orchestre',
    description: 'Tout le groupe imite un meneur secret. Trouvez qui donne le tempo.',
    rules:
      "Un joueur sort de la pièce. Les autres désignent un chef d'orchestre, qui lance un geste répétitif que tout le monde reproduit aussitôt : taper des mains, hocher la tête. Le joueur revient au centre du cercle. Le chef change de geste régulièrement, et le groupe suit sans jamais le regarder en face. Trois tentatives pour le démasquer (à adapter en fonction du nombre de joueurs). En cas d'échec, on recommence avec un nouveau chef.",
    minPlayers: 5,
    maxPlayers: 16,
    idealPlayersMin: 6,
    idealPlayersMax: 12,
    durationBase: 6,
    durationPerPlayer: 0.5,
    filRouge: false,
    material: [],
    typeGame: ['Coopératif', 'À traîtres'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 39,
    title: 'Psycho',
    slug: 'psycho',
    description: 'Vous interrogez le groupe pour cerner sa névrose collective.',
    rules:
      "Un joueur sort. Pendant son absence, les autres se mettent d'accord sur une règle, qu'ils gardent secrète (un geste, une manière de répondre, etc.). Il revient, s'installe au centre du cercle et interroge les joueurs un par un. Chacun répond selon la règle, ce qui produit des incohérences déroutantes. Pour gagner, il doit énoncer la règle exacte. Prévoyez du temps, et glissez des indices si c'est trop long.",
    minPlayers: 5,
    maxPlayers: 15,
    idealPlayersMin: 6,
    idealPlayersMax: 12,
    durationBase: 10,
    durationPerPlayer: 1.25,
    filRouge: false,
    material: [],
    typeGame: ['Règle cachée'],
    level: 'Expert',
    alcohol: false
  },
  {
    id: 40,
    title: 'Qui de nous ?',
    slug: 'qui-de-nous',
    description: "Avec un style de caractère, vous pensez directement à quelqu'un. C'est tout le principe !",
    rules:
      "À tour de rôle, un joueur pose une question qui commence par « qui de nous » : qui mentirait le mieux à la police, qui est le plus mauvais joueur etc. Au signal, tout le monde pointe quelqu'un du doigt, sans réfléchir et sans discuter.",
    minPlayers: 3,
    maxPlayers: 16,
    idealPlayersMin: 5,
    idealPlayersMax: 12,
    durationBase: 7,
    durationPerPlayer: 1,
    filRouge: false,
    material: [],
    typeGame: ['Discussion'],
    level: 'Débutant',
    alcohol: false,
    kit: ['prompts']
  },
  {
    id: 41,
    title: 'Le 21',
    slug: 'le-21',
    description: "Comptez jusqu'à 21. Chaque manche ajoute une règle, et le compte devient impossible.",
    rules:
      'Les joueurs comptent à voix haute. Chacun annonce un, deux ou trois nombres consécutifs, puis désigne qui poursuit, à sa gauche ou à sa droite. Celui qui tombe sur 21 boit. Il invente ensuite une règle valable pour toutes les manches suivantes : remplacer un nombre par un mot, inverser deux nombres, ajouter un geste. On repart de un, avec les règles cumulées. Chaque erreur et chaque hésitation coûtent une gorgée.',
    minPlayers: 4,
    maxPlayers: 12,
    idealPlayersMin: 5,
    idealPlayersMax: 10,
    durationBase: 6,
    durationPerPlayer: 1.75,
    filRouge: false,
    material: ['Verres'],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: true
  },
  {
    id: 42,
    title: 'Qui rit sort',
    slug: 'qui-rit-sort',
    description: 'Faites rire les autres sans jamais rire vous-même.',
    rules:
      'Tout le monde dans la même pièce, une seule consigne : faire rire les autres sans jamais rire soi-même. Grimaces, imitations, provocations, tout passe. Un sourire repéré vaut un avertissement. Au deuxième, le joueur est éliminé et rejoint le "public", d\'où il peut continuer à saboter les survivants. Le dernier impassible l\'emporte.',
    minPlayers: 3,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 10,
    durationBase: 8,
    durationPerPlayer: 3.5,
    filRouge: false,
    material: [],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: false,
    scoring: 'elimination'
  },
  {
    id: 43,
    title: 'On connaît la chanson',
    slug: 'on-connait-la-chanson',
    description: 'Un mot, et il faut chanter. Le premier à sécher a perdu.',
    rules:
      "Le groupe choisit un mot qui traîne dans beaucoup de chansons : soleil, amour, nuit, etc. N'importe quel joueur peut chanter quelques secondes un titre contenant ce mot, dans n'importe quelle langue à condition de traduire. Fredonner ne compte pas : le mot doit être prononcé. Dans le cas où la chanson est validée, le joueur gagne un point.",
    minPlayers: 3,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 10,
    durationBase: 6,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: [],
    typeGame: ['Chacun pour soi'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 44,
    title: 'Best Friends Forever',
    slug: 'best-friends-forever',
    description: 'Vous êtes convaincus de vous connaître par cœur ? Vérifions ça.',
    rules:
      "Le groupe forme des binômes de gens qui se connaissent bien : couples, colocataires, vieux amis. On leur pose une question, ils répondent en même temps, sans se concerter ni se regarder. Le lieu de leur rencontre, le plat que l'autre déteste, le film qu'ils ont le plus vu ensemble. Deux réponses identiques, un point. La table arbitre les formulations approchantes, et le meilleur total l'emporte.",
    minPlayers: 4,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 10,
    durationBase: 6,
    durationPerPlayer: 2.25,
    filRouge: false,
    material: [],
    typeGame: ['Par équipe'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 45,
    title: 'Carte blanche',
    slug: 'carte-blanche',
    description: 'Votre top 3 des plus belles célébrités, mélangé à celui des autres.',
    rules:
      "Chacun note son top 3 des plus belles célébrités en secret. Le meneur ramasse les listes, les mélange, et lit chaque proposition à voix haute. À tour de rôle, on tente d'attribuer collectivement chaque nom à son auteur. Evidemment, le joueur concerné doit mentir. Une fois tous les noms attribués, on vérifie. Variante : le jeu peut se jouer avec d'autres thèmes : vos qualités, vos défauts, etc.",
    minPlayers: 3,
    maxPlayers: 12,
    idealPlayersMin: 4,
    idealPlayersMax: 10,
    durationBase: 6,
    durationPerPlayer: 2,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi', 'Discussion'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 46,
    title: 'Histoires secrètes',
    slug: 'histoires-secretes',
    description: "Chaque personne a un secret. Il est temps d'en parler !",
    rules:
      "En début de soirée, chacun écrit un secret ou une anecdote sur lui, vrai et jamais raconté ici. On plie les papiers et on les jette dans un bol. Entre deux jeux, on en tire un au hasard et on le lit à voix haute, sans commentaire. Chacun désigne à main levée celui qu'il croit être l'auteur. Un point par joueur qui vise juste, deux à l'auteur s'il passe inaperçu — à chacun de garder son total en tête, le jeu court toute la soirée. Il raconte la suite, ou pas !",
    minPlayers: 3,
    maxPlayers: 15,
    idealPlayersMin: 5,
    idealPlayersMax: 12,
    durationBase: 0,
    durationPerPlayer: 0,
    filRouge: true,
    material: ['Papier & stylo'],
    typeGame: ['Chacun pour soi', 'Discussion'],
    level: 'Débutant',
    alcohol: false
  },
  {
    id: 47,
    title: 'Tudum',
    slug: 'tudum',
    description: 'Imaginez un son que tous les autres doivent connaître.',
    rules:
      "Chacun cherche en secret un son que tout le monde a déjà entendu : un générique de plateforme, un jingle de pub, un bruitage de jeu vidéo. À son tour, un joueur l'imite à la voix. Les autres écrivent leur réponse sans rien dire, et on révèle ensemble. Un point par joueur qui identifie le son. Le proposeur marque deux points si au moins la moitié de la table trouve, trois si tout le monde trouve. Faites au moins deux tours de table.",
    minPlayers: 3,
    maxPlayers: 10,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 5,
    durationPerPlayer: 2,
    filRouge: false,
    material: ['Papier & stylo'],
    typeGame: ['Quiz', 'Chacun pour soi'],
    level: 'Débutant',
    alcohol: false,
    scoring: 'compteur'
  },
  {
    id: 48,
    title: 'Insider',
    slug: 'insider',
    description: 'Un joueur doit faire deviner un mot aux autres. Mais un traître se cache parmi eux !',
    rules:
      "Par tirage au sort, un meneur et un Insider sont choisis. Tous les joueurs ferment les yeux. Le meneur tire un mot secret, puis le pose face visible sur la table. l'Insider ouvre les yeux, voit le mot et le repose face caché. Personne d'autre ne sait qui c'est. La table a cinq minutes pour trouver le mot, en posant des questions fermées : le meneur répond oui, non, ou peu importe. L'Insider connaît la réponse depuis le début. À lui d'orienter le groupe sans se faire remarquer. Mot non trouvé, tout le monde perd, Insider compris. Mot trouvé, la table débat et vote pour le démasquer : elle vise juste, le groupe gagne ; elle se trompe, il gagne seul.",
    minPlayers: 4,
    maxPlayers: 10,
    idealPlayersMin: 5,
    idealPlayersMax: 8,
    durationBase: 8,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: ['Téléphone'],
    typeGame: ['Coopératif', 'À traîtres'],
    level: 'Intermédiaire',
    alcohol: false
  },
  {
    id: 49,
    title: 'Sang bleu',
    slug: 'sang-bleu',
    description: 'Une carte sur le front, une place dans la hiérarchie. Reste à deviner laquelle.',
    rules:
      "On distribue une carte face cachée à chacun, qui la plaque sur son front sans la regarder. L'As vaut 1, le Roi vaut 13. Tout le monde voit donc le rang des autres, jamais le sien. Le groupe tire un sujet et en débat cinq minutes, en traitant chacun exactement comme sa carte l'exige. On courtise les Rois, on coupe la parole aux petites cartes, et personne ne commente jamais une valeur à voix haute. Au signal, tout le monde s'aligne du plus faible au plus fort, selon la place qu'il croit occuper.",
    minPlayers: 4,
    maxPlayers: 13,
    idealPlayersMin: 5,
    idealPlayersMax: 10,
    durationBase: 6,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: ['Cartes à jouer'],
    typeGame: ['Chacun pour soi', 'Discussion'],
    level: 'Intermédiaire',
    alcohol: false,
    kit: ['prompts'],
    chronoTour: 300
  },
  {
    id: 50,
    title: 'Sur parole',
    slug: 'sur-parole',
    description: "Annoncez la valeur de votre main. Peut-être qu'on vous a menti.",
    rules:
      "Chacun reçoit trois cartes face cachée et les regarde sans rien montrer : l'As vaut 11, les figures valent 10 (le total maximum est 33). Le premier joueur annonce un total, vrai ou faux, comme il veut. Son voisin doit annoncer un total strictement supérieur, ou exiger de voir la main précédente. Dans ce cas, on retourne les trois cartes. Si le total tient, le sceptique prend un avertissement. Sinon, c'est le menteur. Au troisième, on sort. Le dernier debout gagne.",
    minPlayers: 3,
    maxPlayers: 10,
    idealPlayersMin: 4,
    idealPlayersMax: 8,
    durationBase: 5,
    durationPerPlayer: 1.5,
    filRouge: false,
    material: ['Cartes à jouer'],
    typeGame: ['Chacun pour soi', 'Bluff'],
    level: 'Débutant',
    alcohol: false,
    scoring: 'elimination'
  }
];
