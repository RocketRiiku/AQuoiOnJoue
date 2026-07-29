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
  App.jsx                  aiguillage des quatre vues + vue liste
  main.jsx                 point d'entrée, ErrorBoundary
  index.css                polices, animations CSS, réglages globaux
  components/
    Bouton.jsx             ← tous les boutons passent par là
    Tuile.jsx              entrée vers une section (« Notre soirée »)
    Infobulle.jsx          infobulle au survol et au focus
    Header.jsx             les filtres (deux niveaux)
    GameCard.jsx           une carte de la liste
    GameDetail.jsx         la fiche d'un jeu
    GameThumb.jsx          vignette, avec repli si pas d'illustration
    SoireePage.jsx         le programme de la soirée
    SoireeLancement.jsx    le déroulé jeu par jeu
    Introduction.jsx       l'explication de première visite
    ShareButton.jsx        partage natif, repli presse-papier
    ErrorBoundary.jsx      filet contre l'écran blanc
  data/
    games.js               ← le catalogue
    filterOptions.js       options de filtre déduites du catalogue
  utils/
    useNavigation.js       ← URL, vues et sélection de soirée
    useIntroduction.js     affichage de l'explication
    filterGames.js         moteur de filtrage
    formatGame.js          libellés partagés
    asset.js               chemins de public/ depuis le JS
docs/boutons.md            ← le système de boutons
scripts/build-fonts.py     génération des .woff2
assets-source/fonts/       polices sources (non servies)
```

## À lire avant de toucher à l'interface

**[`docs/boutons.md`](docs/boutons.md)**. Toute action passe par
[`Bouton.jsx`](src/components/Bouton.jsx) : quatre niveaux d'emphase, trois
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
  duration: 20,                   // minutes (nombre, pas de texte type « 30+ »)
  material: ['Cartes à jouer'],   // [] si aucun matériel n’est requis
  typeGame: ['compétitif'],       // toujours un tableau
  level: 'Débutant',              // Débutant | Intermédiaire | Expert
  alcohol: false,
  image: '/MaCarte.png'           // facultatif — fichier déposé dans public/
}
```

`image` est **facultative** : les cartes étant dessinées à la main, un jeu peut
entrer au catalogue avant son illustration. `GameThumb` affiche alors un repli à
la charte. Inutile d'attendre le visuel pour saisir un jeu.

[`games.test.js`](src/data/games.test.js) verrouille ces conventions : unicité
des identifiants et des slugs, format de chaque champ, et absence de règles
dupliquées entre deux jeux.

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

Sémantique de « Matériel dispo » : les pastilles décrivent ce dont **on
dispose**, pas ce que le jeu exige. Un jeu sans matériel requis reste donc
toujours proposé.

Le nombre de joueurs se saisit aussi au clavier. Le champ n'est borné que par le
haut : borner aussi par le bas empêcherait de taper « 10 », le « 1 »
intermédiaire étant réécrit en « 2 ».

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

Chaque vue est donc partageable, et le bouton Retour du navigateur fait ce qu'on
attend au lieu de quitter le site.

Le `slug` est **stable** : le modifier casse les liens déjà partagés. Un slug
inconnu est ignoré silencieusement, une étape hors limites ramenée dans
l'intervalle.

Paramètre de requête plutôt que chemin (`/jeu/...`) : aucune réécriture d'URL à
configurer côté hébergeur statique.

## La soirée

On compose depuis la liste (bouton `+` des cartes), puis on réordonne, on
partage, on déroule.

**Où vit la sélection.** Le paramètre `soiree` de l'URL prime s'il est présent —
c'est le cas d'un lien reçu d'un ami, et le programme partagé doit gagner ;
sinon on lit le stockage local. Les deux sont alimentés à chaque modification,
si bien qu'un programme reçu par lien survit à un rechargement.

Le stockage local est un confort, jamais une dépendance : indisponible
(navigation privée, cookies bloqués), le site fonctionne, la sélection ne
survit simplement pas à la fermeture de l'onglet. Sans compte, elle reste propre
à l'appareil — le partage par lien est le moyen prévu de la faire circuler.

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

## Animations

Aucune bibliothèque : survols, fondus d'apparition et dépliage du panneau de
filtres sont en CSS (`.anim-entree`, `.anim-vue`, `.anim-panneau` dans
[`index.css`](src/index.css)).

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

108 tests. [`src/App.test.jsx`](src/App.test.jsx) suit des **parcours complets**
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

**Le site déployé peut servir du cache.** Une première lecture après un
déploiement peut renvoyer la version précédente. Forcez le rechargement sans
cache avant de conclure.

**La barre de défilement décalait la page.** Filtrer raccourcit la page, la
barre disparaît, et toute la mise en page glisse de sa largeur — le bouton
qu'on vient de cliquer se dérobe sous le curseur. Réglé par
`scrollbar-gutter: stable` sur `:root`, à ne pas retirer.

**Les polices échouent en silence.** Un `.woff2` manquant ne produit aucune
erreur en console : le rendu retombe simplement sur une police système.

## Limites et suites possibles

Par ordre d'intérêt selon la dernière revue :

1. **Le catalogue** — six jeux. Tout est prêt pour en accueillir trente, et les
   filtres comme la soirée ne prennent leur sens qu'à partir de là.
2. **Ajout à l'écran d'accueil** (manifest + service worker) : le site est
   léger, s'utilise sur téléphone en soirée, et fonctionnerait hors ligne.
3. **Tri et filtres dans l'URL**, quand le catalogue dépassera la vingtaine.
4. **Images en WebP** — 277 ko de PNG, même méthode que les polices.
5. **Pondérer la recherche** : elle couvre aussi les règles, ce qui deviendra
   bruyant à grande échelle.
6. **Purger les polices commerciales de l'historique Git** si le dépôt est public.
7. **Rendre le site référençable** quand il sera prêt à être trouvé.

Le contenu des règles de trois jeux (Le Liars Club, Cacophonie, mix.GPT) a été
rédigé faute de source : ce sont des hypothèses plausibles, à relire par
l'auteur du site.

## Contribuer

Ouvrez une issue ou proposez une pull request. Avant de pousser :

```bash
npm run lint && npm test -- --run && npm run build
```

Aucune licence n'est définie pour ce projet.
