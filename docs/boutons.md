# Système de boutons

**À lire avant d'ajouter une action à l'interface.** Tous les boutons passent par
[`src/components/Bouton.jsx`](../src/components/Bouton.jsx) — n'écrivez pas de
`<button>` avec ses propres classes.

Ce document existe parce que l'incohérence s'était installée sans qu'on la voie :
« Partager » était une icône sur la fiche d'un jeu et une pastille pleine sur le
programme de la soirée, et les actions du programme étaient de simples liens
texte, un vocabulaire qui n'existait nulle part ailleurs.

## Les quatre niveaux

| Niveau | Apparence | Usage | Règle |
| --- | --- | --- | --- |
| `principal` | plein brique, ombré | l'action que l'utilisateur veut le plus probablement | **une seule par vue** |
| `secondaire` | contour brique | l'alternative à l'action principale | accompagne le principal |
| `discret` | pastille claire, bord fin | actions auxiliaires | sur leur propre rangée |
| `destructeur` | pastille claire, vire au brique au survol | fait perdre quelque chose | **jamais en emphase forte** |

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

- **Haut à droite** — les actions qui portent sur *l'objet affiché* : partager ce
  jeu, l'ajouter à la soirée. Icônes seules, via `ActionsObjet` + `BoutonIcone`.
- **Bas, première rangée** — les actions qui font *avancer dans le parcours* :
  lancer la soirée, revenir à la liste. Le principal **en premier, à gauche**
  ([Carbon](https://carbondesignsystem.com/components/button/usage/)), le
  secondaire à sa droite. Via `BarreActions`.
- **Bas, seconde rangée** — le reste, en `discret`. Via `BarreActionsSecondaire`.

C'est le **rôle** qui décide de la forme, jamais la place disponible. « Partager »
porte sur l'objet affiché : c'est donc une icône en haut à droite, sur la fiche
d'un jeu comme sur le programme d'une soirée.

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

// Actions sur l'objet affiché
<ActionsObjet>
  <BoutonIcone icone={Plus} infobulle="Ajouter à la soirée"
               nomAccessible={`Ajouter ${jeu.title} à la soirée`} />
  <BoutonIcone icone={Share2} infobulle="Partager" />
</ActionsObjet>
```

## Les entrées de section : des tuiles, pas des boutons

Une **porte d'entrée vers une section** n'est pas une action, et aucun niveau
d'emphase ne lui convient : en `secondaire` elle paraît mise de côté, en
`principal` elle entre en concurrence avec la vraie action de la vue.

C'est le cas de « Notre soirée » sur la liste. Il passe par
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
| Pastilles de filtre | `Header.jsx` | ce sont des **contrôles de formulaire** : elles portent un état sélectionné (`aria-pressed`), pas une action |
| Contrôles de ligne | `SoireePage.jsx` | monter, descendre, retirer un jeu : micro-commandes de 16 px propres à une liste ordonnée |
| Carte de jeu | `GameCard.jsx` | la carte entière est la zone cliquable ; le `+` en coin est une affordance de carte, pas une action de panneau |
| Fermeture d'un panneau | `Introduction.jsx` | la croix en coin est une convention universelle, elle n'a pas besoin d'un niveau d'emphase |

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
