import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Pause as IconePause,
  Play,
  RotateCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { BarreActions, Bouton } from '../Bouton';
import CarteTiree from './CarteTiree';
import Chrono from './Chrono';
import MenuPartie from './MenuPartie';
import { contenuDuJeu } from '../../data/lancerJeu';
import {
  carteCourante,
  epuise,
  etatInitial,
  libelles,
  rappelDe,
  reducteur,
  restantes
} from '../../utils/defileur';

/**
 * Le rappel d'avant-partie.
 *
 * Un écran, une phrase, un bouton. Ce n'est pas un réglage — il n'y a rien à
 * régler — mais ce qui se perd entre la lecture des règles sur la fiche et la
 * première carte : la contrainte qui fait le jeu (« ni justification, ni
 * nuance »), ou le matériel à sortir avant de commencer. Les jeux qui n'ont
 * rien de tel à dire ouvrent directement sur leur première carte.
 */
function Rappel({ texte, onCommencer, onQuitter, libelleRetour }) {
  return (
    <div className="text-center mt-4">
      <p className="font-titre text-3xl sm:text-4xl text-brique">Avant de commencer</p>
      <p className="text-ardoise font-texte text-lg mt-3 max-w-md mx-auto">{texte}</p>
      <BarreActions className="justify-center">
        <Bouton variante="principal" icone={Play} onClick={onCommencer}>
          C’est parti&nbsp;!
        </Bouton>
        <Bouton variante="secondaire" icone={ArrowLeft} onClick={onQuitter}>
          {libelleRetour}
        </Bouton>
      </BarreActions>
    </div>
  );
}

/**
 * Le kit des jeux « tirer et montrer ».
 *
 * Un seul écran pour six jeux — Le Joker, Oui ou non ?, Tu préfères ?, Du Coq à
 * l'Âne, Qui de nous ?, Sang bleu — qui ne demandent au téléphone qu'une carte
 * à lire à voix haute. Tout ce qui les distingue est **déduit du catalogue** :
 * le `type` de leur contenu donne le mot du bouton, `chronoTour` décide s'il y
 * a un décompte. Rien n'est configuré par slug, et un septième jeu de la même
 * forme n'aurait qu'une ligne à ajouter au registre.
 *
 * **Pas d'écran de réglage** : il n'y a rien à régler, et un formulaire entre
 * l'envie de jouer et la première carte est le meilleur moyen de faire reposer
 * le téléphone (même raison que les paramètres avancés repliés de Trois fois
 * rien). Un simple rappel de règle, lui, ne coûte qu'une tape et évite la
 * partie où personne ne sait ce qu'on attend de lui — d'où l'écran `Rappel`,
 * pour les jeux qui ont quelque chose à dire avant la première carte.
 *
 * **Rien n'est écrit dans le stockage local**, contrairement à Trois fois rien.
 * Il n'y a pas de partie à perdre : ni score, ni pot, ni équipes — seulement une
 * place dans une liste mélangée. Le tiroir des parties en cours n'en compte
 * qu'un, et il vaut mieux le garder pour une soirée qui coûte quelque chose.
 */
function KitDefileur({ game, ancreMenu, onQuitter, onRetourAccueil, libelleRetour }) {
  const cartes = useMemo(() => contenuDuJeu(game.slug), [game.slug]);
  const mots = useMemo(() => libelles(cartes[0]?.type), [cartes]);

  const rappel = rappelDe(game.slug);

  const [etat, envoyer] = useReducer(reducteur, { cartes }, etatInitial);
  const [commence, setCommence] = useState(!rappel);
  const [chronoLance, setChronoLance] = useState(false);
  const [son, setSon] = useState(true);

  // Chaque carte repart avec son chrono à zéro et à l'arrêt : la minute de
  // « Tu préfères ? » vaut pour le dilemme affiché, pas pour la soirée.
  useEffect(() => setChronoLance(false), [etat.index]);

  const carte = carteCourante(etat);
  const reste = restantes(etat);

  /**
   * Les actions rares, dans le menu de l'en-tête.
   *
   * Remélanger sert une fois par soirée, et couper le son une fois pour toutes :
   * elles encombraient la barre du bas à côté du geste qu'on répète cinquante
   * fois. Le critère est la fréquence (cf. `MenuPartie`).
   */
  const menu = (
    <MenuPartie
      ancre={ancreMenu}
      slug={game.slug}
      libelleRetour={libelleRetour}
      onQuitter={onQuitter}
      onAbandonner={onRetourAccueil}
      extras={[
        {
          cle: 'remelanger',
          libelle: 'Remélanger la pile',
          icone: RotateCw,
          onClick: () => envoyer({ type: 'recommencer' })
        },
        ...(game.chronoTour
          ? [
              {
                cle: 'son',
                libelle: son ? 'Couper le son' : 'Remettre le son',
                icone: son ? Volume2 : VolumeX,
                onClick: () => setSon((v) => !v)
              }
            ]
          : [])
      ]}
    />
  );

  if (!commence) {
    return (
      <>
        {menu}
        <Rappel
          texte={rappel}
          onCommencer={() => setCommence(true)}
          onQuitter={onQuitter}
          libelleRetour={libelleRetour}
        />
      </>
    );
  }

  if (epuise(etat)) {
    return (
      <>
        {menu}
        <div className="text-center mt-6">
          <p className="font-titre text-3xl sm:text-4xl text-brique" role="status">
            La pile est vide
          </p>
          <p className="text-ardoise font-texte text-lg mt-2">
            Vous avez fait le tour des {etat.pile.length} {mots.pluriel}. Remélanger
            les repasse dans un autre ordre.
          </p>
          <BarreActions className="justify-center">
            <Bouton
              variante="principal"
              icone={RotateCw}
              onClick={() => envoyer({ type: 'recommencer' })}
            >
              Remélanger
            </Bouton>
          </BarreActions>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {menu}
      {/* Le compteur dit où l'on en est dans la pile. Sans lui, cinquante-cinq
          questions se ressemblent et rien n'indique qu'elles s'épuisent. */}
      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70">
        {mots.nom} {etat.index + 1} sur {etat.pile.length}
      </p>

      {/* La carte absorbe la hauteur libre et se centre dedans : sur un écran
          haut, elle restait collée en tête et le panneau s'arrêtait au tiers. */}
      <div className="flex-1 flex justify-center items-center py-6">
        <CarteTiree texte={carte.contenu} cle={etat.index} taille="phrase" />
      </div>

      {game.chronoTour && (
        <div className="flex items-end gap-4 max-w-md w-full mx-auto">
          <div className="flex-1 min-w-0">
            <Chrono
              secondes={game.chronoTour}
              enMarche={chronoLance}
              // La clé identifie la carte : changer de carte remonte le
              // décompte à neuf, le mettre en pause le laisse où il en est.
              cle={etat.index}
              son={son}
              onFini={() => setChronoLance(false)}
            />
          </div>
          <Bouton
            variante="discret"
            icone={chronoLance ? IconePause : Play}
            onClick={() => setChronoLance((v) => !v)}
            className="mb-1"
          >
            {chronoLance ? 'Pause' : 'Chrono'}
          </Bouton>
        </div>
      )}

      {/* Reculer et avancer forment une paire, et la paire décide de l'ordre :
          le retour à gauche, l'avancée à droite, comme le sens de lecture. Ils
          vivaient à dix lignes l'un de l'autre, séparés par une sortie et un
          remélange — deux actions qui n'ont rien à voir avec la navigation.

          « Précédente » reste rendu et désactivé sur la première carte, sans
          quoi le bouton principal se déplacerait sous le pouce au premier
          tirage. */}
      <BarreActions className="justify-center">
        <Bouton
          variante="discret"
          icone={ArrowLeft}
          disabled={etat.index === 0}
          onClick={() => envoyer({ type: 'precedente' })}
        >
          {mots.precedente}
        </Bouton>
        <Bouton
          variante="principal"
          // L'icône suit le libellé : c'est un déplacement vers l'avant, le
          // seul cas où docs/boutons.md l'autorise.
          iconeApres={ArrowRight}
          onClick={() => envoyer({ type: 'suivante' })}
        >
          {mots.suivante}
        </Bouton>
      </BarreActions>

      {/* Le compteur du haut disait déjà où l'on en est : « Proposition 1 sur
          50 » et « Encore 49 propositions dans la pile » sont la même phrase.
          Seule la dernière carte mérite d'être annoncée, parce qu'elle change ce
          qui va se passer au prochain geste. */}
      {reste === 0 && (
        <p className="text-ardoise/60 text-xs text-center mt-4">
          C’est la dernière carte de la pile.
        </p>
      )}
    </div>
  );
}

export default KitDefileur;
