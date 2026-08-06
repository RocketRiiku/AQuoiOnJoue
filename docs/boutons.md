# Système de boutons

**À lire avant d'ajouter une action à l'interface.** Tous les boutons passent par
[`src/components/Bouton.jsx`](../src/components/Bouton.jsx) — n'écrivez pas de
`<button>` avec ses propres classes.

Ce document existe parce que l'incohérence s'était installée sans qu'on la voie :
« Partager » était une icône sur la fiche d'un jeu et une pastille pleine sur le
programme de la soirée, et les actions du programme étaient de simples liens
texte, un vocabulaire qui n'existait nulle part ailleurs.

## Les niveaux d'emphase

| Niveau | Apparence | Usage | Règle |
| --- | --- | --- | --- |
| `principal` | plein brique, ombré | l'action que l'utilisateur veut le plus probablement | **une seule par vue** |
| `secondaire` | contour brique | l'alternative à l'action principale | accompagne le principal |
| `discret` | pastille claire, bord fin | actions auxiliaires | sur leur propre rangée |
| `destructeur` | pastille claire, vire au brique au survol | fait perdre quelque chose | **jamais en emphase forte** |
| `lien` | texte crème, souligné au survol | entrées de bas de page | **réservé au pied de page** |

Deux conventions reprises des systèmes établis :

- une mise en page ne contient **qu'un seul bouton de forte emphase**, accompagné
  d'actions de moindre emphase ([Material 3](https://m3.material.io/components/buttons/guidelines)) ;
- une action destructrice qui n'est qu'une option parmi d'autres prend une
  **emphase basse**, pas un bouton d'alerte plein — le rouge plein est réservé
  au cas où détruire *est* l'étape attendue du parcours
  ([Carbon](https://carbondesignsystem.com/components/button/usage/)).

Sur ce site, aucune destruction n'est l'étape attendue : `destructeur` est donc
toujours une variante de `discret`.

## Disposition

Trois emplacements, et un seul par type d'action.

```
┌─────────────────────────────────────────────┐
│                              [icône] [icône] │ ← actions sur l'objet affiché
│                                              │
│  Contenu du panneau                          │
│                                              │
│  [ Principal ]  [ Secondaire ]               │ ← actions de parcours
│  ( discret ) ( discret )                     │ ← actions auxiliaires
└─────────────────────────────────────────────┘
```

- **Haut à droite** — les actions qui portent sur *l'objet affiché* : l'ajouter à
  la soirée, le partager, signaler une erreur dessus. Icônes seules, via
  `ActionsObjet` + `BoutonIcone`, **rangées de la plus probable à la moins
  probable** : c'est le sens de lecture, et rien d'autre ne les hiérarchise
  puisqu'elles ont toutes la même apparence.
- **Bas, première rangée** — les actions qui font *avancer dans le parcours* :
  lancer la soirée, revenir à la liste. Le principal **en premier, à gauche**
  ([Carbon](https://carbondesignsystem.com/components/button/usage/)), le
  secondaire à sa droite. Via `BarreActions`.
- **Bas, seconde rangée** — le reste, en `discret`. Via `BarreActionsSecondaire`.

C'est le **rôle** qui décide de la forme, jamais la place disponible. « Partager »
porte sur l'objet affiché : c'est donc une icône en haut à droite, sur la fiche
d'un jeu comme sur le programme d'une soirée.

**Le pied de page** ([`PiedDePage.jsx`](../src/components/PiedDePage.jsx)) est
un quatrième emplacement, et le seul qui traverse toutes les vues. Suggestions,
Contact et Mentions légales ne portent sur aucun écran en particulier : elles
prennent donc l'emphase la plus basse du système, `lien`, sur une bande verte
plaquée au bas de la page.

D'abord traitées en `discret` dans un encart crème, elles pesaient plus lourd
que les jeux au-dessus. La règle du principal unique était pourtant respectée :
c'est la **densité visuelle** — trois pastilles claires cerclées sur un fond
sombre — qui déséquilibrait la page, pas le niveau d'emphase déclaré.

Deux contraintes tiennent cette bande :

- **au bas de la *page*, jamais de l'*écran*** — le site se lit sur téléphone en
  pleine soirée, et rien ne doit recouvrir les règles pendant une partie ;
- **le contraste tranche la teinte, pas l'inverse.** Un vert plus proche encore
  de l'herbe du décor ne portait le texte crème qu'à 3,3:1. La bande est donc
  assombrie jusqu'à 4,8:1, au-dessus du seuil AA. Ne pas l'éclaircir pour la
  fondre davantage.

## Quand ce n'est pas un bouton mais un lien

Une action *fait* quelque chose sur place ; un lien *mène* ailleurs. Écrire un
courriel mène ailleurs : passer `href` à `Bouton` **ou à `BoutonIcone`** rend
alors un `<a>`, à l'apparence rigoureusement identique. C'est ce qui permet le
clic droit, le « copier l'adresse », l'ouverture dans un onglet, et l'annonce
correcte par les lecteurs d'écran — tout ce qu'un `<button>` déguisé en lien
fait perdre.

```jsx
<Bouton variante="lien" href={lienMailto({ sujet: '…' })}>
  Contact
</Bouton>

<BoutonIcone icone={TriangleAlert} infobulle="Notifier une erreur"
             nomAccessible={`Notifier une erreur sur ${jeu.title}`}
             href={lienSignalement(jeu)} />
```

L'adresse ne s'écrit qu'à un endroit,
[`utils/contact.js`](../src/utils/contact.js).

## Quand un bouton déplie un panneau

Montrer ou cacher un contenu déjà présent reste une action ordinaire : elle
passe par `Bouton`, en `discret`. C'est le motif *disclosure* du
[WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) et non un
menu — `aria-expanded` porte l'état, `aria-controls` désigne le panneau.

Deux règles propres à ce cas :

- **le libellé porte la valeur en cours**, pas seulement le nom du réglage :
  « Trier : A → Z » plutôt que « Trier par ». Un déclencheur muet laisse le
  visiteur incapable de dire comment la liste est rangée
  ([Baymard](https://baymard.com/blog/essential-sort-types)), et le réglage
  replié devient introuvable. Faute de valeur unique à annoncer, un compteur en
  tient lieu, comme le badge de « Plus de filtres » ;
- **un chevron suit le libellé**, et change de sens à l'ouverture. Seule
  exception à la règle de l'icône qui précède : cette flèche n'accompagne pas le
  libellé, elle montre où le panneau va s'ouvrir. Elle bascule
  `ChevronDown`/`ChevronUp` plutôt que de pivoter, faute de quoi il faudrait
  ouvrir `Bouton` aux classes d'icône passées de l'extérieur.

Le choix appliqué referme le panneau et rend le focus au bouton.

Deux déclencheurs de ce type aujourd'hui : le tri
([`TriJeux.jsx`](../src/components/TriJeux.jsx)) et les filtres secondaires
([`Header.jsx`](../src/components/Header.jsx)).

## La ponctuation des libellés

**Le tiret cadratin ne survit qu'à deux endroits** : entre un nom de page et le
nom du site (`Ma soirée — À quoi on joue ?`, un titre de document, et la
convention du Web), et dans un objet de courriel. Partout ailleurs il se remplace,
et le remplacement dit lequel des trois rôles il jouait :

- **deux-points** quand il séparait une étiquette de sa valeur : « Manche 2 : Un
  seul mot », « Trier : A → Z » ;
- **virgule** dans un nom accessible, parce qu'elle se prononce en pause. Le
  tiret, lui, est lu littéralement par certains lecteurs d'écran et ignoré par
  d'autres : « Joueur 2, éliminé » ;
- **point** dans une phrase, où il servait d'incise commode.

La règle existe parce qu'un tiret cadratin dans un texte d'une ou deux phrases
est le marqueur d'écriture automatique le plus reconnaissable qui soit, et qu'il
s'était glissé dans des rappels de jeu, des noms accessibles et deux messages de
partage.

**Le nom accessible se compose en une seule chaîne**, pas en concaténant un
`<span class="sr-only">`. L'algorithme de nom accessible insère une espace entre
deux nœuds : « Équipe 1 » suivi de « , en tête » s'annonce « Équipe 1 , en tête ».
Passer par `aria-label` donne la ponctuation exacte.

## Icônes

- Une icône **précède** le libellé.
- Elle ne le **suit** que pour un déplacement vers l'avant (« Jeu suivant › »),
  où la flèche accompagne le sens de lecture. Utiliser `iconeApres`.
- Une icône seule n'est admise que dans le groupe en haut à droite.

`BoutonIcone` impose l'infobulle et le nom accessible : ils ne sont pas
optionnels. Une icône sans libellé n'est compréhensible que si l'information
apparaît au survol **et au focus clavier**, et n'en poser que sur certaines
icônes est pire que de n'en poser sur aucune
([Material 3](https://m3.material.io/components/icon-buttons/accessibility),
[NN/g](https://www.nngroup.com/articles/tooltip-guidelines/)).

## Exemples

```jsx
// Rangée d'actions de parcours
<BarreActions>
  <Bouton variante="principal" icone={Play} onClick={onLancer}>
    Lancer la soirée
  </Bouton>
  <Bouton variante="secondaire" icone={ArrowLeft} onClick={onRetour}>
    Retour aux jeux
  </Bouton>
</BarreActions>

// Actions auxiliaires, dont une destructrice
<BarreActionsSecondaire>
  <Bouton variante="discret" icone={Plus} onClick={onAjouter}>
    Ajouter d'autres jeux
  </Bouton>
  <Bouton variante="discret" destructeur icone={Trash2} onClick={onVider}>
    Vider le programme
  </Bouton>
</BarreActionsSecondaire>

// Actions sur l'objet affiché, de la plus probable à la moins probable
<ActionsObjet>
  <BoutonIcone icone={Plus} infobulle="Ajouter à la soirée"
               nomAccessible={`Ajouter ${jeu.title} à la soirée`} />
  <BoutonIcone icone={Share2} infobulle="Partager" />
  <BoutonIcone icone={TriangleAlert} infobulle="Notifier une erreur"
               nomAccessible={`Notifier une erreur sur ${jeu.title}`}
               href={lienSignalement(jeu)} />
</ActionsObjet>
```

## Les entrées de section : des tuiles, pas des boutons

Une **porte d'entrée vers une section** n'est pas une action, et aucun niveau
d'emphase ne lui convient : en `secondaire` elle paraît mise de côté, en
`principal` elle entre en concurrence avec la vraie action de la vue.

C'est le cas de « Ma soirée » sur la liste. Il passe par
[`Tuile.jsx`](../src/components/Tuile.jsx) : un bloc large, entièrement
cliquable, avec un titre, **une ligne qui explique où il mène**, et un chevron
qui signale la navigation. Sa présence vient de sa taille et de son contenu, pas
d'une couleur qui crierait plus fort que le reste — la règle du principal unique
reste donc intacte.

Deux contraintes reprises du motif de la [tuile cliquable de
Carbon](https://carbondesignsystem.com/components/tile/usage/) :

- **aucune commande à l'intérieur** — un second point de clic rendrait la cible
  ambiguë. Un badge ou une icône, oui ; un bouton, non ;
- **une icône signale la navigation**, ici un chevron à droite.

La ligne de description remplace avantageusement une infobulle : elle se lit
sans survol, donc aussi au doigt sur mobile. Elle s'adapte à l'état — quand le
programme est vide, elle explique comment le remplir.

## Ce que ce système ne couvre pas

Il régit les **actions** — ce qu'on déclenche volontairement. Trois familles
gardent leur traitement propre, chacune cohérente en interne :

| Famille | Où | Pourquoi à part |
| --- | --- | --- |
| Pastilles | `Pastille.jsx` | ce sont des **contrôles de formulaire** : elles portent un état sélectionné (`aria-pressed`), pas une action. Trois vues s'en servent — les filtres (`Header.jsx`), le choix du tri (`TriJeux.jsx`) et la désignation des joueurs qui marquent (`kit/KitFeuilleDeMatch.jsx`) |
| Compteurs `< n >` | `Header.jsx`, `kit/Compteur.jsx` | réglage d'un nombre : même famille que les pastilles, un état et non une action |
| Zones de réponse | `kit/EcranTour.jsx` | pendant un tour, « Trouvé » et « Passer » ne sont pas des actions de panneau mais **la table de jeu** — voir ci-dessous |
| Lignes d'une feuille de match | `kit/FeuilleDeMatch.jsx` | la ligne entière marque le point : c'est le geste du jeu, répété toute la soirée, pas une commande de panneau — même famille que les zones de réponse |
| Lignes de désignation d'un quiz | `kit/KitQuizAnimateur.jsx` | même geste, une carte plus tard : on tape qui vient de trouver. Une seconde tape vaut deux points là où le jeu les donne (`LigneJoueur`, la brique commune) |
| Cases d'une matrice de gains | `kit/KitFeuilleDeMatch.jsx` | les quatre issues d'un duel : on tape celle qui s'est produite. La matrice est à la fois le barème qu'on lit et la commande qu'on presse, ce qu'aucun bouton de panneau ne sait faire |
| Contrôles de ligne | `SoireePage.jsx` | monter, descendre, retirer un jeu : micro-commandes de 16 px propres à une liste ordonnée |
| Carte de jeu | `GameCard.jsx` | la carte entière est la zone cliquable ; le `+` en coin est une affordance de carte, pas une action de panneau |
| Fermeture d'un panneau | `Introduction.jsx` | la croix en coin est une convention universelle, elle n'a pas besoin d'un niveau d'emphase |
| Titre du site | `App.jsx` | il ramène à l'accueil : c'est un lien, pas une action, et sa forme est déjà donnée — c'est le titre |

En cas d'hésitation entre ces familles et le système : si l'élément apparaît
**une fois par écran** et fait quelque chose, c'est une action — il passe par
`Bouton`. S'il se **répète** par élément de liste ou porte un état de filtre,
il appartient à sa famille.

## Le cas des kits de jeu

Un jeu qui a son kit fait apparaître **« Lancer le jeu »**, sur sa fiche comme
dans le déroulé d'une soirée. C'est alors **le principal de la vue**, et les
actions qui l'entouraient descendent d'un cran :

| Vue | Sans kit | Avec kit |
| --- | --- | --- |
| Fiche d'un jeu | principal « Retour aux jeux » (ou « Un autre jeu ? ») | principal **« Lancer le jeu »**, le reste en `secondaire` |
| Déroulé de soirée | principal « Jeu suivant » | principal **« Lancer le jeu »**, « Jeu suivant » et « Précédent » en `secondaire` |

C'est l'application directe de la règle du principal unique : *l'action que
l'utilisateur veut le plus probablement*. On lit les règles pour jouer ; passer
au jeu suivant ne vient qu'après. Ne pas ajouter un second bouton plein pour
éviter de déplacer les autres — ce serait exactement l'incohérence que ce
document combat.

### Une partie prend l'écran, et n'a qu'une sortie

Trois règles valent pour les quatre orchestrateurs. Elles sont venues du Liars
Club, dont l'écran empilait tout, mais aucune ne lui est propre.

**Ce qui reste en bas sert à chaque tour ; le reste va dans le menu `⋯`.** Le
critère est la fréquence d'usage, pas l'encombrement. Material fixe une à trois
actions visibles, à forte fréquence, et réserve au dépassement les actions rares
ou destructrices — en prévenant qu'un menu qui avale tout fait perdre confiance à
la barre visible ([Material 3](https://m3.material.io/components/app-bars/guidelines),
[NN/g](https://www.nngroup.com/articles/progressive-disclosure/)).

| Sert à chaque tour, donc visible | Sert une fois par partie, donc dans le `⋯` |
| --- | --- |
| l'action qui avance (Suivante, Compter les points, Passer au vote) | Retour à la fiche ou à la soirée |
| l'action qui recule, **collée** à la précédente | Abandonner la partie, avec confirmation |
| la pause, mais accrochée au chrono et non dans la barre | Terminer, Recommencer, Remélanger |
| | Corriger les scores, Couper le son, Effacer les jets |

**Une action se montre au moment où elle devient l'étape attendue.** « Terminer la
partie » sur chaque écran encombrait et se confondait avec « Abandonner » ; elle
dort donc dans le menu, et remonte en bas d'écran une fois le tour de table
complet, où conclure est précisément ce qu'on veut faire.

Le menu est en **haut à droite** : la zone la moins accessible d'un téléphone tenu
à une main, et c'est exactement ce qu'on veut d'une cible négative — une friction
volontaire. Le bas de l'écran reste à l'interaction, le haut à la lecture et à ce
qu'on ne doit pas toucher par accident
([Parachute](https://parachutedesign.ca/blog/thumb-zone-ux/),
[Juno](https://www.junoschool.org/article/thumb-zone-design-one-handed-use/)).

Le déclencheur part en **portail** dans l'en-tête, que possède `App.jsx` : chaque
orchestrateur compose ses propres entrées et les envoie s'y poser, sans que
l'application ait à les connaître.

**Reculer et avancer forment une paire, et la paire décide de l'ordre** : retour à
gauche, avancée à droite, comme le sens de lecture. C'est la seule exception à la
règle du principal placé en premier — pour la même raison que la flèche qui suit
le libellé d'un déplacement vers l'avant. Le retour reste **rendu et désactivé**
quand il n'y a rien derrière, sans quoi le bouton principal se déplacerait sous le
pouce d'un écran à l'autre.

**Sur un écran de jeu, les deux directions se font face et l'action passe en
dessous, pleine largeur.**

```
     ← Le récit              Passer au vote →
     ┌──────────────────────────────────────┐
     │         ▷ Lancer le chrono           │
     └──────────────────────────────────────┘
```

Trois boutons empilés sur deux rangées ne disaient plus lequel faisait quoi. Les
deux navigations sont symétriques et de taille réduite ; le geste de la phase prend
toute la largeur, seul, et tombe toujours au même endroit. La navigation vers
l'avant ne se dédouble que si le bouton principal fait autre chose — lancer le
chrono.

**Le bouton principal tombe toujours au même endroit.** Les écrans de phase sont
des colonnes qui poussent leur barre d'actions contre le bas, quelle que soit la
longueur de la consigne. C'est ce qui rend le jeu rapide au bout de trois tours :
le pouce y va sans regarder.

**Le texte de scène fait 15 % de la hauteur d'écran au moins** — le nom du joueur
qui parle, le mot à faire deviner. En dessous, on ne peut pas poser le téléphone
au centre de la table. D'où un `clamp()` en `svh` plutôt qu'une taille en points,
plafonné pour qu'un ordinateur n'hérite pas d'un titre de 140 px.

**Un écran de jeu se lit en trois zones : l'en-tête, la scène, les actions.** La
scène prend la place libre et **s'y centre**, les actions restent en bas. Tout
était calé en haut, si bien que la moitié basse restait vide : centrer répartit ce
vide de part et d'autre, et c'est ce qui donne la respiration sans rien ajouter.
Un écran qui n'a qu'une phrase et deux boutons — un rappel de règle, un classement
— se centre en entier.

La règle vaut pour **les quatre kits**, sans exception : l'écran de tour de *Trois
fois rien* (chiffres en haut, mot au centre, surfaces de réponse en bas),
l'annonce d'équipe, les trois bilans, la reprise, le jet de dé, le duel, la
matrice, le défileur et ses écrans de rappel et de pile vide. Une correction faite
pour un jeu se rejoue partout où elle apporte quelque chose, sinon les écrans
divergent — c'est exactement ce que ce document existe pour empêcher.

Ce qui peut grandir, grandit. La carte du défileur passait sa vie à 144 px au
milieu de 400 px de vide : elle prend maintenant la hauteur disponible, plafonnée,
et le surplus se répartit autour d'elle plutôt que de s'accumuler dessous.

**À partir de `lg`, une phase chronométrée passe à deux colonnes** : le nom du
joueur d'un côté, le décompte de l'autre, tous deux à hauteur d'œil. Sur 1 900 px,
les empiler au centre d'une colonne étroite laissait tout le reste inoccupé. Le
panneau d'un kit est aussi plus large que celui des autres vues — un écran de jeu
n'a pas de prose à lire sur une colonne de lecture.

**Le décompte dit s'il tourne.** Un chrono figé sur sa durée pleine, barre
comprise, ne se distingue pas d'un chrono en attente. Le bouton nomme donc le
geste (« Lancer le chrono », puis « Pause »), et une ligne annonce l'état. Tant
qu'il n'est pas parti, lancer le chrono *est* l'action principale de l'écran.

L'action de sortie garde son emphase basse, `discret destructeur`, et son libellé
nomme l'écran où l'on retourne — « Retour à la fiche » ou « Retour à la soirée » —
parce que le kit se pose sur les deux.

**Les règles restent à portée pendant toute la partie**, par un « ? » posé sur la
ligne du titre du jeu. On lit la fiche, on lance le jeu, et vingt minutes plus
tard quelqu'un arrive ou une question tombe : sans lui, il faut quitter le kit,
donc mettre la partie de côté, pour relire trois phrases.

C'est une action qui porte sur l'objet affiché, donc une icône seule en haut à
droite — la place que ce document lui assigne, et la seule où une icône sans
libellé est admise. Elle vit dans `App.jsx`, sur le bandeau commun aux quatre
orchestrateurs, plutôt que dans chacun d'eux.

### Un écran ne montre qu'une chose à la fois

**Quand un second bloc arrive, le premier cède la place — il ne s'empile pas.**
Le quiz d'animateur l'a appris à ses frais : la carte à lire d'un côté, la
réponse de l'autre, et les joueurs à désigner en dessous, l'écran dépassait de
trois cents pixels et le bouton principal tombait hors de portée. La carte porte
donc les deux textes tour à tour, avec un bouton pour basculer.

C'est aussi le geste du jeu — on annonce la réponse, puis on relit l'énoncé pour
montrer où était le piège — et les mots de la bascule appartiennent au jeu :
« Le résumé » et « Les cinq erreurs » chez Le Fitch, « L'énoncé » et « La
réponse » partout ailleurs.

Deux règles en découlent, valables pour tout écran de kit :

- **ce qui n'est plus la vedette rapetisse**, et défile s'il ne rentre plus. Une
  carte qui garde sa pleine hauteur après avoir cédé le premier rôle vole la
  place de ce qui l'a remplacée ;
- **une action qui a un meilleur endroit s'en va.** « Précédente » vivait sous
  les joueurs à désigner, où elle ne sert jamais : elle est déjà là avant la
  révélation, et deux rangées de boutons de moins, c'est autant rendu au jeu.

Rien dans la charpente du site ne plafonne la hauteur d'un panneau de kit :
`flex-1` ne partage que la place *libre*, et un bloc sans hauteur définie
au-dessus de lui grandit avec son contenu. Les écrans qui doivent loger plusieurs
blocs bornent donc les leurs en `svh`, comme les hauteurs minimales du site. À
revoir le jour où le panneau aura une hauteur propre.

### Une zone qui défile le dit

**Une zone coupée net passe pour une zone finie.** Le résumé du Fitch s'arrêtait
au milieu d'un mot sans rien annoncer des dix lignes suivantes, et une liste de
seize joueurs bornée à quatre lignes laissait croire qu'il n'y avait que quatre
joueurs. Dès qu'une zone déborde, elle porte donc un dégradé et une flèche à ce
bord — [`OmbreDefilement`](../src/components/kit/OmbreDefilement.jsx), piloté par
[`useDefilement`](../src/utils/useDefilement.js).

Quatre règles :

- **seulement quand il y a quelque chose au-delà**, et de ce côté-là. Une flèche
  qui reste allumée en bout de course ne veut plus rien dire, et devient un décor
  qu'on ne regarde plus ;
- **un dégradé, pas une barre.** Le texte s'éteint dans la couleur du fond — celle
  de la carte, ou celle du panneau sous une liste. Plus haut qu'une ligne, sinon la
  dernière se lit encore au travers et la flèche lui passe dessus ;
- **posé hors de la zone qui défile.** Un calque absolu placé *dans* un conteneur
  défilant suit le contenu et sort du cadre au premier geste. Et l'enveloppe doit
  épouser la zone : un `flex-1` de trop mettait la flèche du bas cent pixels sous
  la dernière ligne ;
- **décoratif**, `aria-hidden`. Le contenu entier est déjà dans l'arbre
  d'accessibilité et lu d'un bloc : un lecteur d'écran n'a rien à faire défiler.

Attention au piège qui a motivé tout ça : une zone défilante dont le contenu est
centré (`items-center`, `justify-center`) déborde **des deux côtés**, et le haut
devient inatteignable — `scrollTop` ne descend pas sous zéro. Le début du texte
est alors perdu pour de bon, pas seulement masqué. Des marges `auto` sur l'enfant
centrent quand il y a de la place et se résorbent quand il n'y en a plus.

### Pendant un tour, l'écran n'est plus un panneau

Les trente secondes d'un tour ne se pilotent pas comme un formulaire. « Trouvé »
et « Passer » sortent donc du système, au même titre que la carte entière de la
liste : ce sont **des surfaces de jeu**, pas des boutons de panneau.

Trois règles, reprises de ce que font les applications du genre — Heads Up!,
les jeux de charades, Fishbowl :

- **elles occupent le bas de l'écran, sur toute la largeur.** C'est la zone que
  le pouce atteint sans effort : la précision d'appui y est de 96 %, contre
  61 % dès qu'il faut s'étirer (NN/g). On tape sous la pression du chrono,
  parfois debout, un verre à la main ;
- **la réussite est verte, le reste ne l'est pas.** `herbe-sombre` — le vert du
  décor, à la seule teinte où le crème passe le seuil AA. Un aplat brique aurait
  dit « action importante » là où il faut dire « c'est bon » ;
- **elles sont doublées d'un glissement de la carte** — droite pour « trouvé »,
  gauche pour « passer ». Un raccourci, jamais le seul chemin : le glissement
  n'existe qu'au doigt, les deux surfaces restent la voie universelle ;
- **chaque geste s'annule**, par un lien discret offert deux secondes et demie.
  Deux surfaces larges et collées, tapées vite : l'erreur est prévisible, et un
  point volé sans retour en arrière fausse toute la partie.

### La feuille de match suit la même règle

Cinq jeux ne tiennent qu'un score, et rien d'autre : on désigne celui qui vient
de marquer, ou de craquer. **La ligne entière du joueur est la cible**, comme la
carte entière l'est dans la liste — c'est le geste du jeu, tapé cent fois dans la
soirée, et non une commande de panneau. Le trio `− + ↺` de `TableauScores` reste
ce qu'il est : une correction, sur un écran de bilan.

Deux conséquences, les mêmes que pour les zones de réponse :

- **elles occupent toute la largeur**, hautes d'une cinquantaine de pixels, et se
  parcourent au pouce sans viser ;
- **chaque geste s'annule**, par le même lien discret offert deux secondes et
  demie. Vingt lignes identiques et collées : viser la mauvaise vole un point à
  quelqu'un *et* en donne un à un autre.

La forme reste `2500 ms` de part et d'autre. Ce n'est pas un réglage d'écran mais
une règle d'interaction du site : si l'une change, l'autre suit.

Sur l'écran de tour, seuls **deux chiffres et le mot** ont droit à la grande taille :
le temps qui descend, les mots trouvés qui montent. Le nom de l'équipe et le
tableau des scores ont leur place avant et après le tour, pas pendant.

Le mot lui-même est posé sur une **carte** paille, pas sur une ligne de texte :
c'est la métaphore du site, et c'est le papier qu'on vient de tirer du chapeau.

Deux voiles couvrent le panneau et suspendent le jeu — le décompte d'entrée
(3, 2, 1) et la pause. Tous deux sont **opaques** : à travers un voile
translucide, le mot en cours reste lisible, et une pause ne doit pas donner la
réponse.

## En cas de doute

Deux questions dans l'ordre :

1. **L'action porte-t-elle sur l'objet affiché, ou fait-elle avancer le
   parcours ?** La première va en haut à droite en icône, la seconde en bas
   avec un libellé.
2. **Y a-t-il déjà un bouton principal dans cette vue ?** Si oui, la nouvelle
   action est au mieux `secondaire`.

Sources : [Material 3](https://m3.material.io/components/buttons/guidelines) ·
[Carbon](https://carbondesignsystem.com/components/button/usage/) ·
[NN/g](https://www.nngroup.com/articles/tooltip-guidelines/)
