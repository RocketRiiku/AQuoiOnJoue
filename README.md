# À quoi on joue

Trouver un jeu d'ambiance à sortir en soirée : on filtre par nombre de joueurs
et durée, on compose le programme, puis on le déroule jeu après jeu, les règles
affichées en grand.

En ligne : <https://aquoionjoue.nathanboumadjer.workers.dev/> (non référencé,
voir [Confidentialité](#confidentialité)).

---

## Démarrer

Node 20 requis.

```bash
npm install
npm run dev
```

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le build de production |
| `npm run lint` | ESLint |
| `npm test -- --run` | la suite de tests, une passe |
| `npm run build:fonts` | régénère les polices (voir [Polices](#polices)) |

Lint, tests et build tournent sur chaque push et chaque pull request via
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## La pile

React 19, Vite 6, Tailwind 3, Vitest. Trois dépendances d'exécution seulement :
`react`, `react-dom`, `@radix-ui/react-slider` (le curseur de durée) et
`lucide-react` (les icônes).

Deux absences volontaires :

- **pas de routeur** — la navigation tient dans un hook de 200 lignes qui écrit
  des paramètres d'URL, voir [Navigation](#navigation) ;
- **pas de bibliothèque d'animation** — voir [Animations](#animations).

## Où se trouve quoi

```
src/
  App.jsx                  aiguillage des vues + vue liste
  main.jsx                 point d'entrée, ErrorBoundary
  index.css                polices, animations CSS, réglages globaux
  components/
    Bouton.jsx             ← tous les boutons passent par là
    Pastille.jsx           contrôle à cocher : filtres et tri
    BoutonTirage.jsx       « Surprends-moi ! » et son mélange de cartes
    Tuile.jsx              entrée vers une section (« Ma soirée »)
    Infobulle.jsx          infobulle au survol et au focus
    Dialogue.jsx           coquille de modale : voile, panneau, piège à focus
    Header.jsx             les filtres (deux niveaux)
    TriJeux.jsx            l’ordre de la liste
    GameCard.jsx           une carte de la liste
    GameDetail.jsx         la fiche d'un jeu
    GameThumb.jsx          vignette, avec repli si pas d'illustration
    SoireePage.jsx         le programme de la soirée
    SoireeLancement.jsx    le déroulé jeu par jeu
    Introduction.jsx       l'explication de première visite
    ShareButton.jsx        partage natif, repli presse-papier
    PiedDePage.jsx         l'encart de bas de page (trois entrées)
    Suggestions.jsx        proposer un jeu au catalogue
    MentionsLegales.jsx    mentions légales
    ErrorBoundary.jsx      filet contre l'écran blanc
    kit/                   les kits de jeu, voir plus bas
  data/
    games.js               ← le catalogue
    lancerJeu.js           le contenu tiré par les kits
    filterOptions.js       options de filtre déduites du catalogue
  utils/
    useNavigation.js       ← URL, vues et sélection de soirée
    useIntroduction.js     affichage de l'explication
    filterGames.js         moteur de filtrage
    trierJeux.js           les quatre ordres de la liste
    formatGame.js          libellés partagés, et le calcul des durées
    soiree.js              programme et fils rouges : affichage et déroulé
    partieEnCours.js       la partie de kit conservée entre deux visites
    kit.js                 affichage du bouton « Lancer le jeu », invariants
    pioche.js              mélanger une liste, sans appartenir à un jeu
    troisFoisRien.js       le déroulé de ce jeu, en réducteur pur
    defileur.js            le déroulé des six jeux « tirer et montrer »
    blessureCritique.js    le jet de dé, tirage avec remise
    sonKit.js              tic-tac et vibration des dernières secondes
    mouvement.js           lecture de « réduire les animations »
    contact.js             adresse de contact, liens mailto et signalements
    asset.js               chemins de public/ depuis le JS
docs/boutons.md            ← le système de boutons
scripts/build-fonts.py     génération des .woff2
assets-source/fonts/       polices sources (non servies)
```

## À lire avant de toucher à l'interface

**[`docs/boutons.md`](docs/boutons.md)**. Toute action passe par
[`Bouton.jsx`](src/components/Bouton.jsx) : cinq niveaux d'emphase, quatre
emplacements fixes, et une règle qui tranche les cas ambigus — *c'est le rôle de
l'action qui décide de sa forme, jamais la place disponible*.

Ce document existe parce que l'incohérence s'était installée sans qu'on la voie :
« Partager » était une icône ici et une pastille pleine là. N'écrivez pas de
`<button>` avec ses propres classes.

## Le catalogue

Tout tient dans [`src/data/games.js`](src/data/games.js) :

```js
{
  id: 7,                          // unique
  title: 'Nom du jeu',
  slug: 'nom-du-jeu',             // identifiant d'URL, stable : ne plus le changer
  description: 'Une phrase d’accroche, affichée sur la carte.',
  rules: 'Comment on joue, en quelques phrases. Affiché sur la fiche.',
  minPlayers: 3,                  // nombres, bornes incluses
  maxPlayers: 8,
  idealPlayersMin: 4,             // fourchette où le jeu est vraiment au mieux
  idealPlayersMax: 7,
  durationBase: 4,                // minutes fixes
  durationPerPlayer: 3.5,         // minutes ajoutées par joueur
  filRouge: false,                // true = se joue en fond toute la soirée
  material: ['Cartes à jouer'],   // [] si aucun matériel n’est requis
  typeGame: ['Bluff'],            // toujours un tableau, libellés affichés tels quels
  level: 'Débutant',              // Débutant | Intermédiaire | Expert
  alcohol: false,
  image: '/MaCarte.png'           // facultatif — fichier déposé dans public/
}
```

Le catalogue est saisi dans un tableur — `AQuoiOnJoue_jeux.xlsx`, hors dépôt,
documenté par `AQuoiOnJoue_Reference.md` — puis converti en JavaScript. Les
libellés de `typeGame` sont capitalisés au passage, et les cinq slugs déjà
publiés sont préservés tels quels — un test les verrouille.

**L'import est partiel, et volontairement.** Les champs de kit d'un jeu
(`kit`, `scoring`, `chronoTour`) et ses lignes de contenu n'arrivent qu'avec son
kit : sans quoi le bouton « Lancer le jeu » surgirait avant l'écran qui va avec.
Un jeu du tableur qui déclare `prompts` mais n'a pas encore son kit n'a donc
aucun de ces champs ici, et c'est un état normal.

**En cas de contradiction, l'ordre est : le site, puis le tableur, puis la
documentation.** Le code et le tableur sont les deux sources vivantes ; ce
README et le document de référence sont ce qui vieillit — décomptes, listes de
jeux, dettes déjà réglées. Une doc qui contredit les données se corrige. Une
donnée qui doit changer part du tableur, et `Title` y est la **clé de jointure**
entre les deux onglets : la renommer d'un seul côté casse le lien en silence.

### La durée se calcule, elle ne se lit pas

Il n'y a **pas de champ `duration`**. Une durée unique annonçait la même chose à
3 et à 8 joueurs, alors qu'un tour de table s'allonge avec la table :

```
durée = round(durationBase + durationPerPlayer × nbJoueurs)
```

`durationBase` couvre ce que l'effectif ne change pas (règles, mise en place,
manches jouées en simultané), `durationPerPlayer` ce que chaque joueur ajoute.
L'ordre de grandeur du second dit à lui seul de quelle famille relève le jeu :
`0` pour un fil rouge, `0,4` à `1` pour un quiz joué en simultané, `1` à `2,5`
pour un tour de table rapide, au-delà quand chacun passe longuement sur le
devant de la scène.

**L'effectif se saisit une seule fois**, dans le filtre « Joueurs », et suit
jusque dans le déroulé de la soirée : c'est le nombre de personnes autour de la
table, il ne change pas d'un jeu à l'autre. Tant qu'il n'est pas renseigné,
chaque durée s'affiche **en fourchette**, encadrée par `idealPlayersMin` et
`idealPlayersMax` — et le filtre durée compare cette même fourchette, sans quoi
il exclurait un jeu dont la carte annonce qu'il rentrait dans les clous. Tout
passe par [`formatGame.js`](src/utils/formatGame.js) : `dureeJeu`, `plageDuree`,
`plageDureeSoiree`.

### Les fils rouges

`filRouge: true` signale un jeu qui tourne **en fond, en parallèle des autres**,
sur toute la soirée. Il n'entre pas dans le total du programme, il passe tous les
filtres de durée, et sa carte annonce « toute la soirée » au lieu d'un nombre de
minutes. Sa fiche le dit explicitement sous « Format », sans quoi la mention
resterait énigmatique.

**Un fil rouge ne porte jamais de `scoring`.** Sa partie ne se joue pas d'un
bloc : elle court du début à la fin de la soirée, pendant que les autres jeux
s'enchaînent. Le kit ne peut donc pas la tenir — le tiroir des parties en cours
n'en garde qu'une, et lancer n'importe quel autre kit l'écraserait au milieu de
la soirée. Le décompte revient aux joueurs, et les règles le disent (« à chacun
de garder ses points en tête »). Cette contrainte a retiré `compteur` à *Ban
word*, *Histoires secrètes* et *La Murder party*. Un fil rouge garde en revanche
son bouton s'il a autre chose à offrir : *La Murder party* distribue ses
missions, *La blessure critique* tire ses effets de dé.

Quatre fils rouges au catalogue. Trois sont à `0 + 0`, mais la réciproque ne
tient pas : *La blessure critique* garde une durée propre, parce qu'elle se
sort aussi comme un jeu à part entière — ces minutes ne sont alors jamais lues.

### L'illustration

`image` est **facultative** : les cartes étant dessinées à la main, un jeu peut
entrer au catalogue avant la sienne. `GameThumb` affiche alors la carte au point
d'interrogation — déjà l'emblème du site, à côté du titre. Inutile d'attendre le
visuel pour saisir un jeu ; les jeux sans carte se repèrent à l'absence du champ.

[`games.test.js`](src/data/games.test.js) verrouille ces conventions : unicité
des identifiants et des slugs, `minPlayers ≤ idealPlayersMin ≤ idealPlayersMax ≤
maxPlayers`, durée non nulle pour tout jeu qui n'est pas un fil rouge, format de
chaque champ, et absence de règles dupliquées entre deux jeux.

### Les filtres

Les **options sont déduites du catalogue**
([`filterOptions.js`](src/data/filterOptions.js)) : ajouter un jeu avec un
nouveau libellé de `material` ou de `typeGame` fait apparaître l'option, et
aucune option ne peut être proposée sans qu'au moins un jeu y réponde. Un test
le vérifie.

Deux niveaux. **Joueurs** et **Durée** restent visibles — ce sont les critères
qui répondent à la vraie question (« on est six, on a vingt minutes »). Le reste
est replié derrière « Plus de filtres », en pastilles, avec un compteur.

La raison est mesurable : les sept cartes d'origine occupaient 384 px sur
ordinateur et 736 px sur mobile, repoussant le premier jeu à 835 px et 1 196 px
du haut — soit une page et demie de défilement sur téléphone avant d'apercevoir
un jeu. Le bloc fait maintenant 248 px dans les deux cas. Et comme les options
sont dérivées des données, chaque nouveau libellé atterrit dans la zone
dépliable : l'empreinte permanente ne grandira plus avec le catalogue.

Sémantique de « Matériel sous la main » : les pastilles décrivent ce dont **on
dispose**, pas ce que le jeu exige. Un jeu sans matériel requis reste donc
toujours proposé.

« Niveau des règles », et non « des joueurs » : la donnée mesure la complexité
des règles à expliquer, pas l'expérience de la table.

Chaque groupe est une **grille à deux colonnes**, l'intitulé seul à gauche. En
`flex-wrap`, il occupait la première place d'une rangée partagée avec les
pastilles, et celles-ci repassaient sous lui dès qu'elles étaient nombreuses —
« Type de jeu » en compte huit.

Le compteur de joueurs **boucle aux deux bouts** : un cran au-delà du maximum
efface la valeur, comme un cran sous le minimum le faisait déjà. Buter contre la
borne obligeait à dix-huit clics en sens inverse pour retrouver le catalogue
entier.

### Trier

Quatre ordres, sous un bouton discret posé au-dessus de la liste
([`TriJeux.jsx`](src/components/TriJeux.jsx), logique dans
[`trierJeux.js`](src/utils/trierJeux.js)) : conseillés d'abord (défaut), A → Z,
les plus courts, jeux de fond d'abord.

**Le tri garde son propre bouton, hors du panneau de filtres.** Filtrer retire
des jeux, trier les réordonne : ce ne sont pas les mêmes gestes.

**Le bouton porte l'ordre en cours** — « Trier : A → Z », et non « Trier par ».
C'est ce qui rend le repli acceptable : un déclencheur muet laisse le visiteur
incapable de dire comment la liste est rangée, et le tri devient alors
introuvable. Les quatre pastilles dépliées en permanence occupaient, elles, une
rangée entière entre les filtres et les jeux pour un réglage que presque
personne ne touche. Le choix s'applique aussitôt et referme le panneau.

Chaque comparateur n'exprime qu'un seul départage : `sort` étant stable, l'ordre
du catalogue tient à critère égal, sans avoir à le rejouer derrière. « Les plus
courts » range sur la borne basse de la fourchette de durée, donc **suit
l'effectif** — un jeu long à huit joueurs peut être court à trois — et renvoie
les fils rouges en fin de liste, faute de durée propre.

Une clé de tri inconnue rend la liste telle quelle plutôt que de lever : l'ordre
du catalogue est toujours une réponse acceptable.

### L'effectif recommandé n'est pas un filtre

Quand un nombre de joueurs est saisi, les jeux dont c'est la fourchette idéale
portent une **étoile** et **remontent en tête de liste** ; une légende sous le
compteur de résultats dit ce que l'étoile signifie. Rien n'est masqué : la
fourchette idéale est un conseil, pas une condition, et un filtre aurait caché
quarante-neuf jeux jouables pour en montrer un.

L'étoile est décorative au sens strict — c'est `describeGame` qui porte
l'information au lecteur d'écran (« Idéal à 6 joueurs »).

Le nombre de joueurs se saisit aussi au clavier. Le champ n'est borné que par le
haut : borner aussi par le bas empêcherait de taper « 10 », le « 1 »
intermédiaire étant réécrit en « 2 ».

## Les kits de jeu

Certains jeux ne se contentent pas de règles à lire : il faut tirer des mots,
tenir un chrono, compter les points. C'est le rôle du kit, ouvert par le bouton
**« Lancer le jeu »** de la fiche et du déroulé de soirée.

**Treize jeux ont leur kit écrit**, portés par quatre orchestrateurs. Le bouton
est attendu par 41 jeux du catalogue : 36 déclarent un module de `kit`, cinq
n'ont qu'un score ou un chrono. Le premier kit écrit fut celui de *Trois fois rien*,
choisi comme banc d'essai parce que c'est le plus exigeant du catalogue :
équipes, pioche, score par manche, chrono, et surtout les mêmes mots rejoués
trois fois de suite.

Les suivants arrivent **par famille de mécanique**, pas jeu par jeu — voir
[Un registre, pas un moteur unique](#un-registre-pas-un-moteur-unique).

### Où vit quoi

```
src/data/lancerJeu.js              le contenu tiré (l'onglet « LancerJeu »)
src/utils/kit.js                   règles d'affichage et invariants, sans JSX
src/utils/pioche.js                le mélange, commun à tous les kits
src/utils/troisFoisRien.js         le déroulé d'un jeu, en réducteur pur
src/utils/defileur.js              le déroulé de six jeux, en réducteur pur
src/utils/feuilleDeMatch.js        le décompte de cinq jeux, en réducteur pur
src/utils/blessureCritique.js      le jet de dé, en réducteur pur
src/utils/sonKit.js                tic-tac et vibration, sans fichier son
src/utils/partieEnCours.js         la partie conservée entre deux visites
src/components/kit/DialoguePot.jsx l'édition des mots, en modale
src/components/kit/
  registre.js                      slug → composant, et « ce kit est-il prêt ? »
  KitJeu.jsx                       aiguillage + repli si le kit manque
  CarteTiree.jsx                   brique : le papier qu'on vient de tirer
  Chrono.jsx                       brique : décompte d'un tour, avec pause
  Compteur.jsx                     brique : réglage d'un nombre, comme le filtre
  EcranTour.jsx                    brique : l'écran de jeu (carte + réponses)
  PhaseChronometree.jsx            brique : une phase de tour, plein écran
  Progression.jsx                  brique : « TOUR 3 SUR 5 », et les phases
  TableauScores.jsx                brique : grille lignes × colonnes, corrigeable
  BandeauScores.jsx                brique : les scores en une ligne, dépliables
  LigneJoueur.jsx                  brique : la ligne pleine largeur d'un joueur
  FeuilleDeMatch.jsx               brique : la feuille dont la ligne est la cible
  MenuPartie.jsx                   quitter ou abandonner, hors de portée du pouce
  KitTroisFoisRien.jsx             l'orchestrateur de ce jeu
  KitDefileur.jsx                  l'orchestrateur des six « tirer et montrer »
  KitFeuilleDeMatch.jsx            l'orchestrateur des cinq « rien qu'un score »
  KitBlessureCritique.jsx          l'orchestrateur du jet de dé
```

### Ce que l'écran de tour doit au genre

Celui de *Trois fois rien*, et de tout jeu chronométré qui suivra. La première
version affichait un formulaire : des lignes de texte, deux boutons
de panneau, un chrono discret. Le tour se pilote autrement — voir
[`docs/boutons.md`](docs/boutons.md#pendant-un-tour-lécran-nest-plus-un-panneau)
pour les règles, et ce qui les motive :

- **un décompte de trois secondes** avant que le chrono ne parte. Sans lui, les
  premières secondes s'écoulent pendant qu'on lève encore le téléphone ;
- **le mot sur une carte**, en très grand, seul au milieu de l'écran ;
- **deux chiffres qui se font face** : le temps qui descend, les mots trouvés qui
  montent. C'est la tension qu'on vient chercher dans un Time's Up, et elle ne se
  lit pas dans une phrase ;
- **les dix dernières secondes montent en pression** — le compteur passe au
  brique, pulse, et se fait entendre : un tic-tac de deux hauteurs alternées,
  puis une vibration sur les trois dernières. Le son se coupe depuis la pause ;
- **deux surfaces de réponse pleine largeur en bas**, la réussite en vert, plus
  le **glissement de la carte** (droite = trouvé, gauche = passer), qui va plus
  vite que viser un bouton quand ça s'emballe ;
- **« Annuler » pendant deux secondes et demie** après chaque geste. Les deux
  surfaces sont larges et collées, on tape vite : un « Trouvé » de travers vole
  un point *et* retire un mot du pot. Le réducteur mémorise le dernier geste
  pour pouvoir le défaire — jamais plus d'un, et jamais au-delà du tour ;
- **une pause atteignable à tout moment**, qui gèle le chrono sans rien perdre —
  le temps restant est conservé, pas remis à la durée pleine. Son voile est
  opaque : le mot en cours ne doit pas se lire à travers ;
- **un tableau des scores corrigeable** : `−` et `+` sur la manche en cours,
  remise à zéro par équipe, et « Recommencer la partie » depuis la pause.

Deux barres de même épaisseur et de même teinte, à cent pixels l'une de l'autre,
demandaient un temps d'arrêt pour savoir laquelle disait quoi. **L'orange plein
est réservé au chrono**, seule information vivante de l'écran ; les trois manches
sont de courts segments gris.

**Le déroulé d'un jeu est un réducteur pur, séparé de son écran.** C'est ce qui
rend testable la mécanique délicate — le pot qui se vide met fin à la manche
même s'il reste du temps, un mot passé repart au fond, l'équipe qui n'a pas fini
ouvre la manche suivante. Vingt-quatre tests couvrent ces règles sans monter une
seule ligne de DOM. La règle vaut pour les quatre kits :
[`troisFoisRien.js`](src/utils/troisFoisRien.js),
[`defileur.js`](src/utils/defileur.js),
[`feuilleDeMatch.js`](src/utils/feuilleDeMatch.js) et
[`blessureCritique.js`](src/utils/blessureCritique.js) ne contiennent pas une
ligne de rendu. Le dernier va plus loin : ses cinq **barèmes** y sont des
fonctions pures, si bien que « le conteur marque ce qu'il a trompé » se vérifie
sans écran.

**Le chrono lit des minutes au-delà de cent secondes.** Un tour de trente
secondes s'annonce « 30 s » ; les cinq minutes de débat de *Sang bleu*
s'annonceraient « 300 s », qu'aucune table ne convertit de tête. Le seuil porte
sur la durée totale et non sur le temps restant, sans quoi le même décompte
changerait de notation en cours de route.

### Un registre, pas un moteur unique

Les briques sont communes, l'enchaînement appartient au jeu : *Trois fois rien*
rejoue son pot trois fois, Undercover distribue des rôles, Petit Bac tire deux
pioches à la fois. Vouloir un moteur unique reviendrait à plier cinquante cas
particuliers dans une même boucle.

**Le registre grandit par familles, pas par jeux.** Six entrées y pointent vers
le même `KitDefileur` — Le Joker, Oui ou non ?, Tu préfères ?, Du Coq à l'Âne,
Qui de nous ?, Sang bleu. Ces jeux ne demandent au téléphone qu'une carte à lire
à voix haute : ni score, ni réponse à révéler, ni équipes. Leur **mécanique est
déduite du catalogue** — le `type` de leur contenu donne le mot du bouton
(« Dilemme suivant », « Sujet suivant »), `chronoTour` décide s'il y a un
décompte. Un septième jeu de cette forme ne coûterait qu'une ligne. Cinq autres
entrées pointent vers `KitFeuilleDeMatch`, à l'exact opposé : celles-là ne tirent
rien du tout, elles comptent (voir
[Le tableau de scores seul](#le-tableau-de-scores-seul)).

Une seule chose s'y écrit jeu par jeu : le **rappel d'avant-partie**
(`RAPPELS` dans [`defileur.js`](src/utils/defileur.js)). Un écran, une phrase, un
bouton — ce n'est pas un réglage, il n'y a rien à régler, mais ce qui se perd
entre la lecture des règles sur la fiche et la première carte : la contrainte qui
fait le jeu (« ni justification, ni nuance »), ou le matériel à sortir avant de
commencer. Une phrase d'accroche ne se déduit d'aucune donnée. Un jeu sans entrée
ouvre directement sur sa première carte : le rappel est une aide, pas un péage.

*La blessure critique* est de la même famille et garde pourtant son écran : son
tirage est un **jet de dé**, donc avec remise. Le défileur, lui, parcourt sa pile
sans répétition — revoir la même proposition à vingt minutes d'intervalle casse
le jeu plus sûrement que d'arriver au bout d'une liste de cinquante. Une option
de plus sur un composant partagé, pour une mécanique aussi différente, aurait
coûté plus cher que vingt lignes à part.

**La barre du bas ne garde que ce qui sert à chaque tour**, dans les quatre kits.
« Proposition suivante » voisinait avec « Retour à la fiche » tandis que
« Proposition précédente » vivait une rangée plus bas : reculer et avancer forment
une paire, et sont désormais collés, retour à gauche. Remélanger, couper le son,
quitter et abandonner sont partis dans le menu `⋯` de l'en-tête — voir
[`docs/boutons.md`](docs/boutons.md#une-partie-prend-lécran-et-na-quune-sortie)
pour le critère, qui est la fréquence d'usage et non l'encombrement. Le compteur
du haut disait par ailleurs déjà ce que répétait le bas : « Proposition 1 sur 50 »
et « Encore 49 propositions dans la pile » sont la même phrase.

Le défileur **n'écrit rien dans le stockage local**, contrairement à *Trois fois
rien*. Il n'y a pas de partie à perdre : ni score, ni pot, ni équipes, seulement
une place dans une liste mélangée. Le tiroir des parties en cours n'en compte
qu'un, et il vaut mieux le garder pour une soirée qui coûte quelque chose.

Le bouton n'apparaît que si **deux conditions** sont réunies : le catalogue
déclare un kit, *et* le composant existe (`registre.js`). La seconde est
transitoire — sans elle, le bouton surgirait dès l'import des données, avant
l'écran qui va avec.

### Le jet de dé

*La blessure critique* est le seul écran à ne rien afficher tant qu'on ne lui a
rien demandé. Trois choses le tiennent :

- **le dé est un icosaèdre dessiné**, pas un carré arrondi — celui-ci aurait
  annoncé six faces là où le jeu en promet vingt. La valeur est posée au centre
  de gravité de sa face du dessus, remplie pour la dégager des arêtes ;
- **la face définitive est tirée au premier geste**, et le roulement ne fait que
  la retarder — jamais l'inverse. Même règle que « Surprends-moi ! » : une
  minuterie perdue emporterait sinon le résultat avec elle. Le bouton se
  verrouille dans le geste même du clic, et le réglage « réduire les animations »
  saute l'attente au lieu de la raccourcir ;
- **le roulement se compte en battements**, et non en `setTimeout`. Simuler
  celui-ci dans un test fige aussi l'ordonnanceur de React — le piège déjà
  rencontré sur le décompte d'entrée d'`EcranTour`.

Le dé garde sa place et sa taille pendant tout le roulement : le chiffre change
douze fois, la silhouette ne bouge pas. Un dé qui grandirait en s'arrêtant ferait
sauter le gage qu'on lit juste dessous.

Une seule région live sur l'écran, et elle ne s'ouvre qu'une fois le dé posé :
les douze faces du roulement seraient annoncées une à une, et la seule qui compte
se perdrait dedans.

### Le tableau de scores seul

Cinq jeux ont un bouton **sans aucun module de `kit`** : Le Liars Club,
Avez-vous confiance ?, Tudum, Qui rit sort, Sur parole. Rien à tirer, aucune
ligne dans `lancerJeu.js` — et l'invariant du catalogue interdit de leur en
écrire. L'écran ne fait que compter.

**Ils partagent tout sauf la façon dont un point s'attribue** : l'effectif, les
noms, les scores, le seuil, l'annulation, la persistance, le classement. D'où un
seul orchestrateur et trois panneaux, plutôt que trois écrans qui recopieraient
la même feuille :

| Forme | Jeux | Le geste |
| --- | --- | --- |
| `auFil` | Qui rit sort, Sur parole | l'événement tombe n'importe quand, on tape la ligne |
| `parTour` | Le Liars Club, Tudum | des phases successives, puis un vote qui résout le tour |
| `duel` | Avez-vous confiance ? | deux joueurs tirés au sort, une matrice 2×2 de gains |

**Un tour se joue en écrans successifs, pas en empilement.** L'écran du Liars
Club présentait le vote, puis le chrono, puis les scores — l'ordre inverse de
celui de la table, qui joue le récit, puis les questions, puis le vote. Chaque
phase prend donc l'écran entier, avec son nom, sa consigne, son chrono et un seul
bouton. **Le rôle du joueur suit la phase** : « Joueur 1 raconte », puis
« Joueur 1 répond ». L'écran annonçait qu'il racontait sous le titre « LES
QUESTIONS », où il ne raconte plus.

La progression n'affiche **qu'une échelle**. « Tour 1 sur 5 » surmontait trois
segments dont deux remplis, qui comptaient en fait les phases : deux comptes
superposés sans qu'on sache lequel on lisait. Les segments comptent désormais les
tours, ce que dit le libellé ; les phases se nomment juste en dessous, et n'ont pas
besoin de barre. Les phases se déclarent par jeu (`etapes` dans
[`feuilleDeMatch.js`](src/utils/feuilleDeMatch.js)) et vivent dans l'état, pour
qu'une partie reprise reparte du début d'un tour plutôt qu'au milieu d'un chrono.
Tudum n'en déclare aucune : on imite, on écrit, on révèle dans le même souffle, et
un écran d'attente de plus ferait poser le téléphone.
[`PhaseChronometree`](src/components/kit/PhaseChronometree.jsx) porte le gabarit,
et attend la famille « tour de table chronométré » qui en fera le même usage.

**Le barème s'affiche avant qu'on le déclenche.** Rien ne disait ce que
« Compter les points » allait faire, ni si le conteur marquait quand personne ne
le démasque — justement le calcul qu'on avait retiré à la table. L'aperçu suit la
sélection : « Joueur 1 +2 · Joueur 3 et Joueur 4 +1 ». Quand personne n'est
désigné, il dit ce que ça vaut au conteur, ce qui est l'information utile à ce
moment-là.

**Les scores tiennent en une ligne.** Le tableau occupait la moitié de l'écran en
permanence — cinq lignes, trois commandes chacune — pour une correction qui sert
une fois sur vingt. [`BandeauScores`](src/components/kit/BandeauScores.jsx) le
replie derrière « Voir les scores », et la correction devient un mode qu'on
demande depuis le menu. La ligne du bandeau est composée **par le jeu**, parce que
le sens de la victoire lui appartient : un jeu à points annonce qui mène, un jeu à
élimination annonce qui est le plus près de sortir. Annoncer le meneur y donnait
« Égalité, 0 avertissement », qui n'informe de rien.

Le tableau ne se déplie que là où il apprend quelque chose. Chez un jeu « au fil
de l'eau », la feuille de match **est** le tableau des scores : tous les joueurs y
sont avec leurs avertissements, et le rouvrir en modale montrait deux fois la même
chose. *Qui rit sort* n'a donc aucun bouton en bas de son écran — les quatre
lignes de joueurs sont l'interface.

**La ligne est la cible**, pour la forme `auFil`
([`FeuilleDeMatch.jsx`](src/components/kit/FeuilleDeMatch.jsx)). C'est le geste
du jeu, répété cent fois dans la soirée, pas une correction d'après-coup : une
surface de jeu au même titre que la carte du catalogue et les zones de réponse
d'`EcranTour`, et non un bouton de panneau. Elle est doublée d'un « Annuler »
offert deux secondes et demie — vingt lignes identiques et collées, viser la
mauvaise est l'accident prévisible du genre. Les deux autres formes affichent
`TableauScores` avec ses commandes de correction : chez elles, la table ne
désigne pas un coupable au vol, elle valide une manche.

**Le barème disparaît de la table.** Le Liars Club veut « autant de points au
conteur qu'il a trompé de monde », Tudum « trois points si tout le monde a
reconnu le son, deux si la moitié y est arrivée » : demander ces chiffres à qui
tient le téléphone lui ferait compter deux fois la même chose. On coche les
trouveurs, le reste se déduit — trois fonctions d'une ligne dans
[`feuilleDeMatch.js`](src/utils/feuilleDeMatch.js). C'est la brique que le quiz
d'animateur réutilisera, dégénérée à un seul trouveur.

**`elimination` n'est pas une primitive à part** : c'est un `compteur` doublé
d'un seuil. Qui rit sort élimine au deuxième avertissement, Sur parole au
troisième, et le sens de la victoire suit — le plus gros total sans seuil, le
dernier debout avec. Un joueur sorti **reste affiché**, barré : chez Qui rit
sort, il rejoint le public et continue à saboter les survivants.

Ce qui ne se déduit d'aucune colonne s'écrit jeu par jeu, comme les `RAPPELS` du
défileur : la forme, le seuil, le barème, et la phrase d'avant-partie. Le reste
vient du catalogue — `scoring` donne le mot du point (« point » ou
« avertissement »), `chronoTour` la minute d'interrogation du Liars Club,
`minPlayers` et `maxPlayers` les bornes de l'effectif.

**Les joueurs se renomment.** Les équipes de *Trois fois rien* sont numérotées et
c'est assez, elles sont deux à quatre ; une feuille de match en compte jusqu'à
seize, où « Joueur 11 » ne désigne plus personne et où un score qu'on ne sait pas
s'attribuer ne sert à rien. Les champs sont donc offerts sous « Paramètres
avancés », vides, avec repli sur « Joueur n ». Aucun prénom n'est *demandé*, et
rien ne quitte l'appareil : les mentions légales n'ont rien de plus à déclarer.

Faute de seuil, **aucune règle ne dit quand s'arrêter** : la table tranche. Le
bouton passe de `discret` à `secondaire` une fois le tour de table complet, ce
que trois de ces jeux demandent explicitement (« jusqu'à ce que chacun soit passé
au moins une fois »).

#### Le duel se joue sur une matrice, et son barème a été corrigé

*Avez-vous confiance ?* est un dilemme du prisonnier, et son barème n'en était
pas un. Le jeu n'existe que si deux conditions tiennent, `T > R > P > S` et
`2R > T + S` ([Dilemma Game, ScienceDirect](https://www.sciencedirect.com/topics/engineering/dilemma-game)).
Avec 3/3, 6/0 et 0/0, la mise d'origine échouait aux deux : `P = S = 0` rendait
la trahison **gratuite** — face à un traître on marquait zéro quoi qu'on fasse,
face à un joueur loyal on gagnait trois. Tout le monde trahissait, personne ne
marquait, et la partie mourait au deuxième duel.

3/3, 5/0 et 1/1 rétablissent les deux conditions. Le total distribué descend de
six à cinq puis à deux : plus on se méfie, plus le pot brûle, ce qui se raconte
mieux à table que « les six points sont perdus ».
[`feuilleDeMatch.test.js`](src/utils/feuilleDeMatch.test.js) verrouille les deux
inégalités — c'est le seul endroit qui rappellera la règle à qui retouchera les
chiffres.

**La matrice 2×2 est la forme canonique de ce jeu, et elle sert d'entrée** : on
tape la case qui s'est produite, une fois, et les points tombent des deux côtés.
La version d'avant listait les trois issues en boutons de prose, dont une à
dédoubler pour dire lequel des deux avait trahi. Quatre boutons et trois lignes à
lire, pour un geste unique. La matrice montre en plus ce que le texte des règles
dit mal : les quatre issues côte à côte, donc le fait que trahir seul rapporte le
plus et que se méfier à deux ne rapporte presque rien. C'est ce que la table doit
voir pour que le choix ait du sel.

#### Une partie prend la hauteur qui reste

**Le titre du site ne disparaît pas** : c'est le repère de l'endroit où l'on est,
et le seul lien vers l'accueil. Il se réduit — deux tailles de moins, sans son
sous-titre, sans son grand retrait — ce qui rend une centaine de pixels au jeu sans
faire disparaître l'ancre. Le pied de page, lui, s'efface : ses trois liens
d'éditeur n'ont rien à dire à qui joue.

**Le panneau occupe ensuite toute la place disponible.** Il s'arrêtait à la hauteur
de son contenu, si bien qu'un jeu à l'écran court — *Oui ou non ?* et sa seule
carte — laissait la moitié du décor à nu en dessous. Il fait maintenant 88 % de la
hauteur d'un écran de 812 px, sans un pixel de défilement, et chaque kit décide où
poser sa scène dedans : la carte du défileur se centre dans la place libre, les
boutons tombent en bas.

Pas de hauteur minimale en plus de `flex-1` : les deux s'additionnaient à
l'en-tête et dépassaient l'écran de 28 px. C'est `flex-1` qui donne exactement la
place restante.

Le nom du joueur qui parle atteint ainsi 72 px, soit 18 % de la hauteur d'écran —
au-dessus du seuil à partir duquel on peut poser le téléphone au milieu de la
table. Les sorties passent par le menu `⋯`, qui demande confirmation au lieu de
tout perdre sur un clic : voir
[`docs/boutons.md`](docs/boutons.md#une-partie-prend-lécran-et-na-quune-sortie).

**La scène se centre dans la place libre, et ce qui peut grandir grandit.** Tout
était calé en haut du panneau : la carte du défileur restait à 144 px au milieu de
400 px de vide, et l'écran de rappel laissait quatre cents pixels sous ses deux
boutons. La carte monte à 422 px sur un écran de 812, le vide se répartit de part
et d'autre au lieu de s'accumuler dessous, et les écrans courts se centrent en
entier.

**Les quatre kits suivent la même charpente**, y compris `EcranTour` : sa racine ne
remplissait pas le panneau, si bien que le `flex-1` de sa carte n'avait rien où
grandir et que le mot à faire deviner restait petit au milieu d'un écran à moitié
vide. Il passe de 144 à 230 px sur téléphone, 394 sur ordinateur, sans toucher à ce
qui fait sa tension — les deux chiffres qui se font face en haut, les deux surfaces
de réponse en bas. Même traitement pour l'annonce d'équipe, les trois bilans, la
reprise, le jet de dé et les deux écrans du duel : une correction faite pour un jeu
se rejoue partout où elle apporte quelque chose.

**À partir de `lg`, une phase chronométrée passe à deux colonnes** : le nom du
joueur d'un côté, le décompte de l'autre. Sur 1 900 px, les empiler au centre
laissait tout le reste inoccupé ; le panneau s'élargit alors à 1 024 px, un écran
de jeu n'ayant pas de prose à lire sur une colonne étroite. Sans chrono, la scène
reste une colonne centrée.

**Le voile de pause ne garde qu'un bouton**, « Reprendre ». Recommencer, couper le
son, quitter et abandonner avaient reparu là alors qu'ils vivent dans le menu de
l'en-tête — et celui-ci reste atteignable par-dessus le voile, qui s'arrête au
titre du jeu.

#### Les règles restent à portée

Un « ? » sur la ligne du titre rouvre les règles du jeu en modale, pendant toute
la partie. On lit la fiche, on lance le jeu, et vingt minutes plus tard quelqu'un
arrive : sans lui, il faut quitter le kit — donc mettre la partie de côté — pour
relire trois phrases. Il vit dans [`App.jsx`](src/App.jsx), sur le bandeau commun
aux quatre orchestrateurs, et la coquille de la modale est celle de
[`Dialogue.jsx`](src/components/Dialogue.jsx), sortie de `DialoguePot` à cette
occasion : les quinze lignes de piège à focus n'ont pas à exister deux fois.

### Les familles qui restent

Les 28 kits restants ont été regroupés par **ce que l'écran doit savoir faire**,
pas par thème de jeu — c'est ça qui décide si deux jeux partagent un
orchestrateur. Par ordre de rendement :

| Famille | Jeux | Ce que l'écran fait |
| --- | --- | --- |
| Le quiz d'animateur | 10 | tire → « Révéler » → on désigne qui marque le point |
| La distribution secrète | 5 | le téléphone tourne, chacun révèle puis masque |
| Le classement à corriger | 3 | tous répondent, on révèle, on saisit des points variables |
| Le tour de table chronométré | 3 | un thème, le chrono part, le joueur courant marque ou saute |
| Le quiz à points dégressifs | 2 | idem quiz, plus une valeur qui descend de 5 à 1 |
| Les équipes | 2 | Pyramide (le jumeau de Trois fois rien) et Best Friends Forever |
| Les cas à part | 3 | Pitch de ouf, Petit Bac, Le Petit Menteur |

Le détail, jeu par jeu :

- **quiz d'animateur** — Sorry mon french, Lost in translation, Plan pas plan
  plan, Le souffleur, Le blindlo-fi, ETSY c'était ça ?!, Le juste chiffre, Le
  Fitch, Soyez logique, Cacophonie. C'est le défileur *plus* la brique de
  désignation du [tableau de scores seul](#le-tableau-de-scores-seul), plus une
  seule chose neuve : la révélation ;
- **distribution secrète** — Undercover, Insider, Cow-boy, La Murder party, et
  Psycho (`regle-secrete`, la même primitive en un seul écran) ;
- **classement à corriger** — Best-sold, Qui vient avant ?, Duo carré ou cash ? ;
- **tour de table chronométré** — 30 secondes chrono, Tueur en série, On connaît
  la chanson. C'est la famille qui recycle le plus d'`EcranTour` ;
- **points dégressifs** — Emo'Quiz, Harry Cover.

L'ordre conseillé fait de chaque étape une extension stricte de la précédente.
Le **tableau de scores seul** a joué ce rôle et il est écrit : il a posé le
compteur par joueur et la désignation des marqueurs sur cinq jeux sans contenu à
tirer. Le **quiz d'animateur** n'est donc plus que la composition du défileur et
de cette feuille, plus la révélation — c'est la prochaine étape, et la plus
rentable du lot.

### Ce qui reste à découpler

**`TableauScores` ne connaît plus le jeu qu'elle affiche.** Elle importait
`MANCHES`, `totalEquipe` et `vainqueurs` de `troisFoisRien.js` : une brique
annoncée comme commune, clouée à un jeu. Les colonnes sont devenues une donnée
(`colonnes`), les lignes une liste de `{ nom, cases, total, enTete, sortie }`, et
c'est l'appelant qui calcule ses totaux — parce que lui seul sait ce que
« mener » veut dire chez lui : le plus grand total ici, le dernier debout dans un
jeu à élimination. Sans colonnes, la même grille rend un simple classement — la
forme dont le [tableau de scores seul](#le-tableau-de-scores-seul) se sert deux
fois, en jeu et à l'arrivée.
[`TableauScores.test.jsx`](src/components/kit/TableauScores.test.jsx) monte la
brique **sans aucun import de jeu** : c'est ce qui empêche le couplage de
revenir. `Compteur` a suivi le même chemin, de `KitTroisFoisRien.jsx` vers
[`kit/Compteur.jsx`](src/components/kit/Compteur.jsx) — aucun kit ne peut
dessiner sa table sans demander l'effectif.

Restent deux dettes que la prochaine famille rencontrera :

- **`scoring: manches` fait deux métiers.** Au sens strict, des points variables
  *selon la manche* : Trois fois rien, Pyramide, Duo carré ou cash. Au sens
  élargi, des points variables tout court : Harry Cover et Emo'Quiz (5 → 1 selon
  les indices lâchés), Best-sold, Qui vient avant ?, Petit Bac. Les seconds ont
  besoin d'une **saisie libre de points**, pas de la grille équipes × manches.
- **Trois choses que les règles réclament et qu'aucune colonne ne porte** : le
  seuil d'élimination, le sens de la victoire qui va avec, et le **joueur
  courant** que quatre jeux demandent de désigner et de suivre — Le Liars Club,
  Tudum, Avez-vous confiance ?, Carte blanche. Le kit les porte jeu par jeu dans
  [`feuilleDeMatch.js`](src/utils/feuilleDeMatch.js), comme `RAPPELS` porte la
  phrase d'avant-partie du défileur : trois colonnes de plus au tableur pour cinq
  jeux coûteraient plus cher à tenir. **À rouvrir si les 28 kits restants en
  réclament autant** — c'est le seuil au-delà duquel la donnée doit remonter au
  tableur.

Les deux corrections attendues côté tableur ont été faites : **Tueur en série**
porte `elimination`, **Best Friends Forever** porte `compteur`.

### Les trois champs du catalogue

`kit`, `scoring` et `chronoTour` sont facultatifs et **indépendants** : le bouton
apparaît dès que l'un des trois est renseigné. Un jeu peut compter des points
sans rien avoir à tirer, ou cadencer des tours sans compter. Neuf jeux n'ont
aucun des trois : sept sont des mécaniques pures, les deux autres des fils rouges
à qui `scoring` est refusé par principe (voir [Les fils
rouges](#les-fils-rouges)).

**`scoring` en dit moins que les règles**, et il faut le savoir avant d'écrire un
kit. `elimination` couvre deux formes : la sortie immédiate (Undercover, Tueur en
série) et le **seuil** qui laisse une chance — deux avertissements chez Qui rit
sort, trois chez Sur parole, donc un `compteur` déguisé. `compteur` de son côté
dit « +1 / −1 par joueur » là où quatre jeux distribuent 2, 3 ou 6 points d'un
coup, et `manches` fait deux métiers (voir [Ce qui reste à
découpler](#ce-qui-reste-à-découpler)). Ni le seuil, ni le sens de la victoire,
ni le joueur courant ne sont dans une colonne : ils se lisent dans les règles, et
le kit les porte jeu par jeu.

L'invariant à tenir, vérifié dans les deux sens par
[`games.test.js`](src/data/games.test.js) : un module qui pioche (`prompts`,
`distribution`, `regle-secrete`) exige des lignes dans `lancerJeu.js`, et
réciproquement. Sinon le kit tire dans le vide, ou du contenu écrit reste
inatteignable — ce qui est déjà arrivé trois fois côté tableur.

### Le kit vit dans l'URL, la partie dans le stockage local

`?kit=1` se pose sur la vue courante sans effacer `jeu` ni `etape` : le quitter
ramène exactement d'où l'on venait, fiche ou déroulé, et le bouton Retour du
navigateur fait ce qu'on attend. La partie, elle, n'entre jamais dans l'URL —
une soirée ne se partage pas au milieu d'une manche.

Elle est en revanche **écrite dans le stockage local à chaque geste**
([`partieEnCours.js`](src/utils/partieEnCours.js)) — pour les kits qui ont
quelque chose à perdre, ce qui exclut le défileur. On touche la bannière du
site par erreur, on répond à un message, l'onglet est recyclé : sans mémoire,
une demi-heure de jeu disparaît sur un geste involontaire. Trois conséquences :

- **la liste signale la partie en attente**, par une tuile qui passe devant
  « Ma soirée » — c'est la seule chose de cette page qui attend qu'on y revienne ;
- **« Lancer le jeu » demande alors quoi faire** : reprendre, ou repartir de
  zéro. Trancher d'office empêcherait l'un ou effacerait l'autre sans prévenir ;
- **la pause permet d'abandonner** : quitter met la partie de côté, abandonner
  la supprime et ramène à la liste. Deux gestes différents, deux boutons ;
- **un tour interrompu ne reprend jamais en plein chrono.** `reprendre()` ramène
  la partie à l'écran d'annonce de l'équipe, pot et scores intacts. Reprendre à
  dix-sept secondes d'un tour quitté il y a une heure n'aurait aucun sens.

La clé est distincte de celle du programme de soirée, et son propriétaire aussi :
`useNavigation` reste seul maître de l'URL et de la sélection de jeux. Ce qui
interdisait deux hooks sur l'historique n'interdit pas deux tiroirs. Une partie
dort douze heures, puis se périme — personne ne reprend une soirée d'avant-hier.

### Personnaliser une partie

L'écran de réglage pose deux questions — combien de joueurs, combien d'équipes —
réglées **par le même contrôle**, celui du filtre « Joueurs » de la liste : deux
réglages de même nature se règlent du même geste. Chacun dit sa conséquence à
côté : « soit 30 mots dans le pot », « soit 3 joueurs par équipe ».

Le maximum d'équipes **suit l'effectif** plutôt que d'être fixe : à quatre
joueurs, quatre équipes laisseraient chacun seul à faire deviner à personne.
Redescendre l'effectif ramène le nombre d'équipes dans les clous sans écraser le
choix — remonter les joueurs le restitue.

Le reste se replie derrière **« Paramètres avancés »** : durée d'un tour, papiers
par joueur, noms des équipes. Même motif que « Plus de filtres » et « Trier ».

Replié par défaut, parce que les valeurs du catalogue conviennent presque
toujours et qu'une page de formulaire entre l'envie de jouer et la première carte
est le meilleur moyen de faire reposer le téléphone. Un nom d'équipe laissé vide
retombe sur « Équipe n » : mieux vaut générique que sans en-tête.

**Les mots du pot s'éditent** depuis ce panneau, dans une modale
([`DialoguePot.jsx`](src/components/kit/DialoguePot.jsx)) : une pastille par mot,
sa croix pour le retirer, un champ pour en ajouter. C'est le motif établi pour un
ensemble de chaînes courtes ([Material 3](https://m3.material.io/components/chips/guidelines)),
et la modale s'impose parce que quarante mots à relire demandent l'écran entier —
dépliés sous les réglages, ils enterreraient « Remplir le pot ».

Changer l'effectif ou le nombre de papiers **annule la personnalisation** : garder
une liste taillée pour six joueurs alors qu'on vient d'en annoncer douze
tromperait sur ce qui va être joué.

La modale est écrite à la main plutôt qu'avec `<dialog>` : jsdom n'implémente pas
`showModal`, et un dialogue que la suite de tests ne peut pas ouvrir n'est pas
testable. Le piège à focus tient en quinze lignes, et vit désormais dans
[`Dialogue.jsx`](src/components/Dialogue.jsx) — partagé avec les règles qu'on
rouvre en cours de partie.

### Ce qu'il ne fait pas

- **Aucun prénom n'est demandé.** Taper huit prénoms sur un téléphone en pleine
  soirée coûte plus cher que ça ne rapporte, et les mentions légales n'ont alors
  rien de plus à déclarer. Les équipes de *Trois fois rien* sont donc numérotées,
  et elles le restent : renommer y est un champ des paramètres avancés, jamais
  une étape. La [feuille de match](#le-tableau-de-scores-seul) offre les mêmes
  champs, pour la raison inverse — à seize lignes, « Joueur 11 » ne désigne plus
  personne. Dans les deux cas c'est facultatif, vide par défaut, et rien ne quitte
  l'appareil.
- **Le temps restant ne se reporte pas** d'une manche à l'autre quand le pot se
  vide en plein tour. La règle officielle du jeu le prévoit ; les règles de la
  fiche n'en parlent pas.

## Navigation

Tout passe par l'URL, via [`useNavigation.js`](src/utils/useNavigation.js) — un
hook unique, seul propriétaire de l'URL *et* du stockage local (deux hooks
écrivant dans l'historique finissent par se marcher dessus).

| URL | Vue |
| --- | --- |
| `/` | la liste des jeux |
| `/?jeu=undercover` | la fiche d'un jeu |
| `/?soiree=liars-club,undercover` | le programme de la soirée |
| `/?soiree=...&etape=2` | le déroulé, 2ᵉ jeu |
| `/?jeu=trois-fois-rien&kit=1` | le kit du jeu, depuis sa fiche |
| `/?soiree=...&etape=2&kit=1` | le kit du jeu en cours de soirée |
| `/?page=suggestions` | proposer un jeu |
| `/?page=mentions-legales` | les mentions légales |

Le **titre du site ramène à la liste**, d'où que l'on vienne. C'est un vrai lien
et non un bouton — Ctrl+clic doit pouvoir l'ouvrir dans un onglet, et l'adresse
se copier — dont le clic simple est intercepté pour rester dans l'application.

Chaque vue est donc partageable, et le bouton Retour du navigateur fait ce qu'on
attend au lieu de quitter le site.

Le `slug` est **stable** : le modifier casse les liens déjà partagés. Un slug
inconnu est ignoré silencieusement, une étape hors limites ramenée dans
l'intervalle. Un `page` inconnu l'est aussi.

`page` **prime sur les autres paramètres** : on y arrive depuis le pied de page,
quelle que soit la vue quittée. En contrepartie, toute navigation de jeu doit
l'effacer — sans quoi l'écran resterait figé sur les mentions légales.

Paramètre de requête plutôt que chemin (`/jeu/...`) : aucune réécriture d'URL à
configurer côté hébergeur statique.

## La soirée

On compose depuis la liste (bouton `+` des cartes), puis on réordonne, on
partage, on déroule.

**Les fils rouges vivent hors du programme.** Ils ont leur bloc, sous la file
numérotée, sans numéro d'ordre ni boutons monter/descendre — ils courent en
fond, ils n'ont pas de place dans une file d'attente. Ils sont exclus du total
de durée, et **ouvrent le déroulé** : c'est au début de soirée qu'on bannit les
mots ou qu'on distribue les missions.

Trois conséquences dans le code, à ne pas défaire séparément :

- [`useNavigation`](src/utils/useNavigation.js) **range les fils rouges en fin
  de sélection**. L'index d'un jeu du programme y est alors sa place affichée,
  ce dont dépendent monter/descendre. Sans cela, échanger deux jeux séparés par
  un fil rouge dans la liste brute ne changeait rien à l'écran ;
- [`soiree.js`](src/utils/soiree.js) porte les deux lectures — `partitionner`
  pour l'affichage, `ordreDeroule` pour le lancement, fils rouges d'abord ;
- l'étape de l'URL indexe **l'ordre du déroulé**, pas la sélection.

**La durée totale** additionne les durées calculées pour l'effectif courant.

**Où vit la sélection.** Le paramètre `soiree` de l'URL prime s'il est présent —
c'est le cas d'un lien reçu d'un ami, et le programme partagé doit gagner ;
sinon on lit le stockage local. Les deux sont alimentés à chaque modification,
si bien qu'un programme reçu par lien survit à un rechargement.

Le stockage local est un confort, jamais une dépendance : indisponible
(navigation privée, cookies bloqués), le site fonctionne, la sélection ne
survit simplement pas à la fermeture de l'onglet. Sans compte, elle reste propre
à l'appareil — le partage par lien est le moyen prévu de la faire circuler.

**Partage.** `navigator.share` ouvre la feuille native — WhatsApp, Messages —
qui est l'usage réel sur téléphone. `canShare` filtre d'abord les navigateurs
qui exposent l'API mais refusent les données : sans lui, l'appel échouait et le
partage était perdu au lieu de retomber sur la copie. Le repli copie **le
message entier, pas la seule adresse** : un lien nu collé dans une conversation
n'annonce pas ce qu'il y a au bout. Le texte pré-rempli est le même partout —
`messagePartage` et `messagePartageSoiree` dans
[`formatGame.js`](src/utils/formatGame.js).

**Réordonnancement** par boutons monter/descendre plutôt que glisser-déposer :
utilisable au clavier, annoncé aux lecteurs d'écran, fiable au doigt. Ils
utilisent `replaceState` pour ne pas remplir l'historique.

## Première visite

Le principe du site n'est pas évident. Une explication en trois étapes
(trouver, composer, jouer) est dépliée à la première visite, puis repliée une
fois fermée — mémorisée localement. Un lien « Comment ça marche ? » la rouvre.

Volontairement une section au-dessus du catalogue, pas une page d'introduction :
celle-ci s'interposerait entre le visiteur et les jeux, et imposerait un passage
inutile aux habitués.

## Le pied de page

Une bande pleine largeur plaquée au bas de la page : **Suggestions**,
**Contact**, **Mentions légales**. Elles portent sur le site entier et non sur
l'écran affiché : elles prennent donc l'emphase la plus basse du système, du
texte crème sans cadre, sur un vert repris de l'herbe du décor
(cf. [`docs/boutons.md`](docs/boutons.md)).

Au bas de la **page**, non de l'écran : le site se lit sur téléphone en pleine
soirée, et rien ne doit recouvrir les règles pendant une partie. La colonne
flexible d'`App.jsx` la plaque tout de même contre le bas quand la vue est plus
courte que l'écran.

Le vert est assombri par rapport à l'herbe pour porter le texte à 4,8:1 — au
plus près de la teinte du décor, il ne dépassait pas 3,3:1, sous le seuil AA.

Le site est statique — sans serveur, un formulaire n'aurait nulle part où
poster. Contact et Suggestions passent donc par un lien `mailto:`, fabriqué par
[`contact.js`](src/utils/contact.js), seul endroit où l'adresse est écrite.
Celle de Suggestions arrive avec un gabarit déjà rempli, dérivé de la même liste
de champs que celle affichée sur la page : les laisser diverger était le défaut
le plus probable à la première retouche. La page annonce que le bouton ouvre la
messagerie, et son libellé dit « Écrire », pas « Envoyer » : le clic ne poste
rien, il rédige.

**Les textes d'interface parlent à la première personne du singulier**, comme
les mentions légales : je tiens ce site seul. Le « nous » de la page Suggestions
promettait une équipe qui n'existe pas. Le visiteur, lui, est vouvoyé partout.

**Les mentions légales sont un texte d'éditeur, pas un texte d'interface** :
[`MentionsLegales.jsx`](src/components/MentionsLegales.jsx) ne fait que lui
donner la charte et une hiérarchie à trois niveaux. Ne le réécrivez pas au fil
d'une refonte — il engage son auteur.

Il décrit ce que le site fait réellement : à chaque fonction qui touche aux
données (stockage local, mesure d'audience, service tiers, service worker)
doit correspondre un paragraphe, et réciproquement. **Plusieurs sections y
décrivent aujourd'hui des fonctions absentes du code** — mesure d'audience,
dons, mode hors connexion, prénoms du kit de jeu : soit elles arrivent, soit
elles sont à retirer du texte.

Le nom de l'éditeur y figure ; l'adresse postale, non — elle n'est pas exigée
d'un particulier éditant à titre non professionnel.

## Animations

Aucune bibliothèque : survols, fondus d'apparition, dépliage du panneau de
filtres et mélange de cartes sont en CSS (`.anim-entree`, `.anim-vue`,
`.anim-panneau`, `.anim-carte`, `.anim-melange` dans
[`index.css`](src/index.css)).

**Le mélange de « Surprends-moi ! »**
([`BoutonTirage.jsx`](src/components/BoutonTirage.jsx)) : les deux étoiles du
bouton deviennent des cartes du catalogue qui défilent en ralentissant, comme
une roulette qu'on lâche, avant que la fiche s'ouvre — environ 0,6 s. Trois
règles y tiennent :

- **la suite du parcours est déclenchée par une minuterie, jamais par la fin
  d'une animation.** C'est précisément ce qui avait mis les fiches en panne du
  temps de Framer Motion ;
- **le bouton se verrouille dans le geste même du clic**, et non à la première
  échéance : sinon deux pressions rapprochées lancent deux tirages ;
- **le libellé ne change pas** pendant le mélange, sans quoi le bouton se
  redimensionnerait sous le doigt qui vient de le presser.

Avec « réduire les animations » activé, le tirage est immédiat : la règle CSS
globale raccourcit les animations mais ne toucherait pas aux minuteries, le
composant vérifie donc lui-même `prefers-reduced-motion`.

Framer Motion a été retiré. Ses deux mécanismes irremplaçables avaient chacun
causé une panne en production : `layout` laissait une projection figée qui
décalait la liste hors de l'écran, et l'animation de sortie d'`AnimatePresence`
pouvait ne jamais se terminer — or `mode="wait"` attend cette fin pour monter la
vue suivante, si bien que les fiches ne s'ouvraient plus. Le bundle est passé de
132 à 80 ko gzippés, et d'un chargement en deux temps à un seul.

Le changement de vue repose sur une clé React et un fondu CSS : une animation
CSS ne dépend d'aucun cycle de vie JavaScript et ne peut pas rester bloquée.

Le dépliage du panneau utilise une grille dont l'unique rangée passe de `0fr` à
`1fr`, ce qui interpole la hauteur sans la mesurer. Le contenu reste dans le DOM
pour rendre la transition possible ; l'attribut `inert` le retire du parcours
clavier tant qu'il est replié.

## Polices

Les familles CSS portent des **noms d'usage** — et non des noms de fonderie :
changer de police ne touche alors que les trois `@font-face` d'`index.css`.

| Famille | Police actuelle | Usage |
| --- | --- | --- |
| `font-titre` | Fredoka (poids 500) | titres, boutons |
| `font-manuscrit` | Petit Formal Script | sous-titre |
| `font-texte` | Source Sans 3 (poids 300) | descriptions, règles |

Les trois sont sous licence **SIL Open Font**, donc auto-hébergeables. Les
précédentes (Berlin Sans FB, Monotype Corsiva, Acumin) étaient commerciales et
ont été retirées — elles subsistent dans l'historique Git, **à purger si le
dépôt devient public**.

Rien n'est chargé depuis un tiers, ce qui évite de transmettre l'adresse IP des
visiteurs à un CDN.

- **Sources** : `assets-source/fonts/`, versionnées avec leurs licences, non servies.
- **Servies** : `public/fonts/*.woff2`, sous-ensemble latin/français, **65 ko** à elles trois.

Deux des trois sont variables alors qu'un seul poids est utilisé : figer
l'instance retire les données d'interpolation, d'où l'essentiel du gain (Source
Sans 3 passe de 631 à 23 ko). Pour régénérer :

```bash
python -m pip install fonttools brotli
npm run build:fonts
```

## Tests

537 tests. [`src/App.test.jsx`](src/App.test.jsx) suit des **parcours complets**
plutôt que des fonctions isolées : consulter un jeu et revenir, filtrer,
composer puis dérouler une soirée, ouvrir un lien partagé.

Ils existent parce que deux régressions bloquantes sont parties en production
sans qu'aucun test unitaire ne les voie — aucun ne cliquait sur une carte. Toute
fonctionnalité touchant à la navigation devrait y ajouter son chemin.

**Leur limite** : jsdom ne calcule pas de rendu. Un défaut purement visuel — la
seconde régression décalait les cartes par une transformation CSS — leur échappe
et demande un vrai navigateur.

## Déploiement

**Cloudflare Pages**, en intégration Git directe : chaque push sur `main`
redéploie, chaque pull request a sa prévisualisation. Aucun workflow ni jeton
d'API à stocker.

| Champ | Valeur |
| --- | --- |
| Commande de build | `npm run build` |
| Dossier de sortie | `dist` |
| Variable d'environnement | `NODE_VERSION` = `20` |

Le site est servi **à la racine** du domaine. Une tentative GitHub Pages figure
dans l'historique : elle imposait un sous-dossier `/AQuoiOnJoue/`, et son
`npm ci` échouait sur un conflit de dépendances corrigé depuis.

### Confidentialité

Un site déployé est **public** : qui connaît l'adresse y accède. Ce dépôt limite
seulement sa *découvrabilité* — [`public/robots.txt`](public/robots.txt) et la
balise `<meta name="robots">` d'`index.html` demandent aux moteurs de ne pas
l'indexer.

Pour un accès réellement restreint, **Cloudflare Access** (gratuit jusqu'à 50
utilisateurs) place le site derrière une vérification par courriel — réglage
côté Cloudflare, rien à changer dans le code.

Pour le rendre public : retirer la balise `meta robots` et vider le `Disallow`.

## Pièges connus

Quelques heures ont été perdues sur chacun. À lire avant de déboguer.

**Les chemins de `public/` depuis le JavaScript.** Vite préfixe les URL du HTML
et du CSS avec le chemin de base, mais **pas les chaînes littérales du JS**.
Passez toujours par [`asset()`](src/utils/asset.js) — sans quoi les images
tombent en 404 dès que le site n'est pas servi à la racine.

**Le serveur de développement se corrompt.** Une série de rechargements à chaud
laisse l'onglet dans un état qui simule de faux bugs (vue figée, transformations
bloquées), et son tampon de console conserve d'anciennes erreurs. En cas de
doute : onglet neuf, ou vérifier sur `npm run preview`.

**Ne simulez jamais toutes les minuteries dans un test.** `vi.useFakeTimers()`
sans `toFake` fige aussi l'ordonnanceur de React, et plus rien ne se rend.
`setTimeout` en particulier est à laisser tranquille : les utilitaires
asynchrones de Testing Library s'appuient dessus, et le test s'interbloque au
lieu d'échouer. C'est pour cette raison que les deux fenêtres d'annulation
(`EcranTour`, `FeuilleDeMatch`) se comptent en `setInterval` — ce qu'un test peut
simuler seul. Avancer les minuteries hors d'un geste de l'utilisateur se fait
dans `act()`, et `userEvent.setup` prend alors `delay: null`.

**Un worktree oublié gonfle la suite de tests.** Vitest et ESLint parcourent
`.claude/worktrees/` s'il en reste un : la suite y ramasse une copie périmée du
dépôt, ce qui a déjà fait annoncer 410 puis 481 tests là où il y en avait 291 et
352. Le compte réel se lit en ignorant les fichiers préfixés `.claude/`, et
`git worktree list` dit s'il en traîne un.

**Le site déployé peut servir du cache.** Une première lecture après un
déploiement peut renvoyer la version précédente. Forcez le rechargement sans
cache avant de conclure.

**`overflow-x: hidden` crée une zone de défilement.** Masquer un seul axe fait
passer l'autre de `visible` à `auto` : le conteneur racine devenait alors
défilant pour son propre compte. Le ciel étoilé, haut de 1400 px, dépassait les
vues courtes et fournissait 588 px de défilement interne — on descendait sous le
pied de page, puis le geste s'arrêtait net avant de reprendre sur la page. Un
défilement dans l'autre, invisible à la lecture du code. Utiliser
**`overflow-x: clip`**, qui masque autant sans créer de conteneur.

**`100vh` est plus haut que l'écran sur téléphone.** C'est la hauteur barre
d'adresse *repliée* : une page calée dessus dépasse toujours d'autant. Les
hauteurs minimales sont en **`svh`**, la plus petite des deux, doublées d'un
`vh` pour les navigateurs qui l'ignorent. Ne pas passer à `dvh` : il suit la
barre d'adresse, donc décale la mise en page pendant le défilement.

**La barre de défilement décalait la page.** Filtrer raccourcit la page, la
barre disparaît, et toute la mise en page glisse de sa largeur — le bouton
qu'on vient de cliquer se dérobe sous le curseur. Réglé par
`scrollbar-gutter: stable` sur `:root`, à ne pas retirer.

**Les polices échouent en silence.** Un `.woff2` manquant ne produit aucune
erreur en console : le rendu retombe simplement sur une police système.

## Limites et suites possibles

Par ordre d'intérêt selon la dernière revue :

1. **Les kits de jeu** — treize sont écrits sur les 41 jeux qui attendent un
   bouton. Les 28 restants sont regroupés par famille de mécanique, avec l'ordre
   conseillé, dans [Les familles qui restent](#les-familles-qui-restent) : le
   **quiz d'animateur** vient ensuite, et compte dix jeux à lui seul. Les règles
   de sept jeux mentionnent déjà une « liste » qui n'existera qu'avec leur kit.
2. **Les illustrations** — 42 jeux sur 50 affichent la carte au point
   d'interrogation.
3. **Tri et filtres dans l'URL** : ni l'un ni l'autre n'est partageable
   aujourd'hui, et un lien vers « les jeux courts à six » aurait du sens.
4. **Ajout à l'écran d'accueil** (manifest + service worker) : le site est
   léger, s'utilise sur téléphone en soirée, et fonctionnerait hors ligne.
5. **Images en WebP** — même méthode que les polices.
6. **Pondérer la recherche** : elle couvre aussi les règles, ce qui devient
   bruyant à cinquante jeux.
7. **Purger les polices commerciales de l'historique Git** si le dépôt est public.
8. **Rendre le site référençable** quand il sera prêt à être trouvé.

## Contribuer

Ouvrez une issue ou proposez une pull request. Avant de pousser :

```bash
npm run lint && npm test -- --run && npm run build
```

Aucune licence n'est définie pour ce projet.
