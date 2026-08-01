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
| Pastilles | `Pastille.jsx` | ce sont des **contrôles de formulaire** : elles portent un état sélectionné (`aria-pressed`), pas une action. Deux vues s'en servent — les filtres (`Header.jsx`) et le choix du tri (`TriJeux.jsx`) |
| Contrôles de ligne | `SoireePage.jsx` | monter, descendre, retirer un jeu : micro-commandes de 16 px propres à une liste ordonnée |
| Carte de jeu | `GameCard.jsx` | la carte entière est la zone cliquable ; le `+` en coin est une affordance de carte, pas une action de panneau |
| Fermeture d'un panneau | `Introduction.jsx` | la croix en coin est une convention universelle, elle n'a pas besoin d'un niveau d'emphase |
| Titre du site | `App.jsx` | il ramène à l'accueil : c'est un lien, pas une action, et sa forme est déjà donnée — c'est le titre |

En cas d'hésitation entre ces familles et le système : si l'élément apparaît
**une fois par écran** et fait quelque chose, c'est une action — il passe par
`Bouton`. S'il se **répète** par élément de liste ou porte un état de filtre,
il appartient à sa famille.

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
