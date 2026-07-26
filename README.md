# À quoi on joue

Une petite application web pour choisir des jeux de société ou d'ambiance à partager entre amis.

## Installation

```bash
npm install
npm run dev
```

## Construction du projet

Pour générer les fichiers de production :

```bash
npm run build
```

## Qualité

```bash
npm run lint
npm test
```

Ces trois commandes (plus `npm run build`) tournent automatiquement sur chaque
push et chaque pull request, via
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

[`src/App.test.jsx`](src/App.test.jsx) suit des **parcours complets** plutôt que
des fonctions isolées : consulter un jeu et revenir, filtrer, composer puis
dérouler une soirée, ouvrir un lien partagé. Ces tests existent parce que deux
régressions bloquantes sont parties en production sans qu'aucun test unitaire ne
les voie — aucun ne cliquait sur une carte. Toute nouvelle fonctionnalité
touchant à la navigation devrait y ajouter son chemin.

Leur limite : jsdom ne calcule pas de rendu. Un défaut purement visuel — l'une
des deux régressions décalait les cartes par une transformation CSS — reste hors
de leur portée et demande un vrai navigateur.

## Animations

Aucune bibliothèque d'animation : survols, fondus d'apparition et dépliage du
panneau de filtres sont en CSS (voir `.anim-entree`, `.anim-vue` et
`.anim-panneau` dans [`src/index.css`](src/index.css)).

Framer Motion a été retiré. Ce qu'il restait à animer ne le justifiait plus, et
ses deux mécanismes irremplaçables avaient chacun causé une panne en production :
`layout` laissait une projection figée qui décalait la liste hors de l'écran, et
l'animation de sortie d'`AnimatePresence` pouvait ne jamais se terminer — or
`mode="wait"` attend cette fin pour monter la vue suivante, si bien que les
fiches de jeu ne s'ouvraient plus. Le bundle est passé de 132 à 79 ko gzippés,
et d'un chargement en deux temps à un seul.

Le dépliage du panneau utilise une grille dont l'unique rangée passe de `0fr` à
`1fr`, ce qui interpole la hauteur sans avoir à la mesurer. Le contenu reste dans
le DOM pour rendre la transition possible : l'attribut `inert` le retire du
parcours clavier tant qu'il est replié.

## Ajouter un jeu

Tout le catalogue tient dans [`src/data/games.js`](src/data/games.js). Un jeu se
décrit ainsi :

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
la charte (emoji du type de jeu et initiales). Inutile donc d'attendre le visuel
pour saisir un jeu.

Les **options de filtre sont déduites du catalogue** (voir
[`src/data/filterOptions.js`](src/data/filterOptions.js)) : introduire un jeu
avec un nouveau libellé de `material` ou de `typeGame` fait apparaître l'option
correspondante, et aucune option ne peut être proposée sans qu'au moins un jeu y
réponde. Les tests vérifient cette propriété.

Sémantique du filtre « Matériel dispo » : les pastilles décrivent ce dont on
dispose, et non ce que le jeu exige. Un jeu sans matériel requis reste donc
toujours proposé.

### Les deux niveaux de filtres

**Joueurs** et **Durée** restent visibles en permanence, sous forme de cartes :
ce sont les deux critères qui répondent à la question posée au moment de choisir
(« on est six, on a vingt minutes »). Tout le reste — matériel, type de jeu,
niveau, alcool — est replié derrière « Plus de filtres », sous forme de
pastilles compactes, avec un compteur de critères actifs.

La raison est mesurable : les sept cartes précédentes occupaient 384 px en
permanence sur ordinateur et 736 px sur mobile, repoussant le premier jeu à
respectivement 835 px et 1 196 px du haut de page — soit une page et demie de
défilement sur téléphone avant d'apercevoir un seul jeu. Le bloc fait désormais
248 px dans les deux cas.

Cela règle aussi la suite : les options étant dérivées du catalogue, chaque
nouveau libellé de matériel ou de type **ajoute une option**. Elles atterrissent
maintenant dans la zone dépliable, où elles passent simplement à la ligne :
l'empreinte permanente ne grandit plus avec le catalogue.

## Déploiement

Hébergeur retenu : **Cloudflare Pages**, en intégration Git directe (aucun
workflow ni jeton d'API à stocker). Réglages à saisir une seule fois :

| Champ | Valeur |
| --- | --- |
| Commande de build | `npm run build` |
| Dossier de sortie | `dist` |
| Version de Node | `20` |

Deux points expliquent ce choix plutôt que GitHub Pages. D'abord le site est
servi **à la racine** du domaine : les vingt chemins d'assets absolus
(`/CarteUndercover.png`, `/fonts/titre.woff2`…) fonctionnent tels quels, alors
qu'un sous-dossier de projet GitHub Pages les casserait tous. Ensuite aucune
règle de réécriture n'est nécessaire, puisque la navigation passe par des
paramètres de requête et non par des chemins : seule `/` est jamais demandée.

### Confidentialité

Un site déployé est **public** : toute personne connaissant l'adresse y accède.
Par défaut, ce dépôt limite seulement sa *découvrabilité* —
[`public/robots.txt`](public/robots.txt) et la balise `<meta name="robots">` de
`index.html` demandent aux moteurs de recherche de ne pas l'indexer. Le site est
donc en ligne sans être trouvable, ce qui suffit tant qu'on ne diffuse le lien
qu'à ses amis.

Pour un accès réellement restreint, **Cloudflare Access** (Zero Trust, gratuit
jusqu'à 50 utilisateurs) place le site derrière une vérification par courriel.
C'est un réglage côté Cloudflare, rien à changer dans le code.

Quand vous voudrez le rendre public, retirez la balise `meta robots` et videz
le `Disallow` de `robots.txt`.

## Navigation et liens partageables

Toute la navigation passe par l'URL, gérée par
[`src/utils/useNavigation.js`](src/utils/useNavigation.js) — un hook unique,
seul propriétaire de l'URL *et* du stockage local (deux hooks écrivant dans
l'historique finissent par se marcher dessus) :

| URL | Vue |
| --- | --- |
| `/` | la liste des jeux |
| `/?jeu=undercover` | la fiche d'un jeu |
| `/?soiree=liars-club,undercover` | le programme de la soirée |
| `/?soiree=...&etape=2` | mode « lancer la soirée », 2ᵉ jeu |

Conséquences : chaque vue est partageable d'un lien, et le bouton Retour du
navigateur fait ce qu'on attend (refermer une fiche, revenir au jeu précédent
d'un déroulé) au lieu de quitter le site.

Le `slug` de chaque jeu est un identifiant **stable** : le modifier casse les
liens déjà partagés. Un slug inconnu est ignoré silencieusement, une étape hors
limites est ramenée dans l'intervalle.

Le paramètre de requête est volontairement préféré à un chemin (`/jeu/...`) :
aucune réécriture d'URL à configurer côté hébergeur statique.

## Première visite

Le principe du site n'est pas évident au premier abord. Une explication en
trois étapes (trouver, composer, jouer) est donc dépliée à la première visite,
puis repliée définitivement une fois fermée — le choix est mémorisé localement.
Un lien discret « Comment ça marche ? » la rouvre à tout moment.

Volontairement une section au-dessus du catalogue, et non une page
d'introduction : celle-ci s'interposerait entre le visiteur et les jeux, et
imposerait un passage inutile aux habitués. Ici, les jeux restent visibles juste
en dessous.

## La soirée

On compose un programme depuis la liste (bouton `+` sur chaque carte), puis on
le réordonne, le partage, et on le déroule jeu par jeu.

**Où vit la sélection.** Le paramètre `soiree` de l'URL prime s'il est présent —
c'est le cas d'un lien reçu d'un ami, et le programme partagé doit gagner ;
sinon on lit le stockage local. Les deux sont alimentés à chaque modification,
si bien qu'un programme reçu par lien survit à un rechargement.

Le stockage local est un confort, jamais une dépendance : s'il est indisponible
(navigation privée, cookies bloqués), le site fonctionne normalement, la
sélection ne survit simplement pas à la fermeture de l'onglet. Sans compte, elle
reste par ailleurs propre à l'appareil — le partage par lien est le moyen prévu
de la faire circuler.

**Réordonnancement.** Boutons monter/descendre plutôt que glisser-déposer :
utilisable au clavier, annoncé aux lecteurs d'écran, et fiable au doigt sur
mobile. Ces réordonnancements utilisent `replaceState`, pour ne pas remplir
l'historique du navigateur.

## Polices

Les familles CSS portent des **noms d'usage** — `titre`, `manuscrit`, `texte` —
et non des noms de fonderie. Changer de police ne touche alors que les trois
`@font-face` de `src/index.css`, sans renommer une classe dans tout le projet.

| Famille | Police actuelle | Usage |
| --- | --- | --- |
| `font-titre` | Jost (poids 500) | titres, boutons |
| `font-manuscrit` | Petit Formal Script | sous-titre |
| `font-texte` | Source Sans 3 (poids 300) | descriptions, règles |

Les trois sont sous licence **SIL Open Font**, donc auto-hébergeables sans
restriction. Les précédentes (Berlin Sans FB, Monotype Corsiva, Acumin) étaient
commerciales et ont été retirées ; elles subsistent toutefois dans l'historique
Git, à purger si le dépôt devient public.

Aucune police n'est chargée depuis un tiers : tout est servi par le site, ce qui
évite au passage de transmettre l'adresse IP des visiteurs à un CDN.

- **Sources** : `assets-source/fonts/` — versionnées avec leurs licences OFL,
  mais **non servies**.
- **Servies** : `public/fonts/*.woff2` — sous-ensemble latin/français, **59 ko**
  à elles trois.

Deux des trois sont variables alors qu'un seul poids est utilisé : figer
l'instance retire les données d'interpolation, d'où l'essentiel du gain (Source
Sans 3 passe de 631 à 23 ko). Pour régénérer après changement d'une source :

```bash
python -m pip install fonttools brotli
npm run build:fonts
```

## Contribuer

Les contributions sont les bienvenues ! Ouvrez une issue ou proposez une pull request pour participer.

Aucune licence n'est actuellement définie pour ce projet.
