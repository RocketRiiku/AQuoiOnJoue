import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Bouton } from '../Bouton';
import Chrono from './Chrono';

/**
 * Brique : une phase de jeu qui prend l'écran entier.
 *
 * Un nom en très grand, une consigne, un chrono, un seul bouton en bas. Écrite
 * pour les deux premières phases du Liars Club — le récit puis les questions —
 * et taillée pour la famille « tour de table chronométré » qui suivra, où un
 * thème s'annonce puis le chrono part.
 *
 * Trois règles la tiennent, et elles valent pour tous les kits :
 *
 * **Le nom fait 15 % de la hauteur d'écran au moins.** C'est le seuil à partir
 * duquel on peut poser le téléphone au centre de la table et lire à deux mètres.
 * D'où un `clamp()` en `svh` plutôt qu'une taille en points : sur un écran de
 * 6 pouces comme sur un ordinateur, la scène occupe la même part du champ.
 *
 * **Le chrono dit s'il tourne.** Un décompte figé sur « 60 s » avec une barre
 * pleine ne se distingue pas d'un décompte en attente : le bouton porte donc
 * « Lancer le chrono », puis « Pause », et le temps restant se lit à côté.
 * Avant le premier départ, la phase est explicitement en attente.
 *
 * **Le bouton principal tombe toujours au même endroit.** La colonne pousse la
 * barre d'actions contre le bas quelle que soit la hauteur du contenu, si bien
 * qu'au troisième tour le pouce y va sans regarder.
 *
 * @param titre    la phase (« Le récit »), au-dessus du nom
 * @param nom      la scène : le joueur qui parle, ou le thème à deviner
 * @param consigne ce qu'on attend de la table pendant cette phase
 * @param secondes durée de la phase, ou `null` pour une phase sans chrono
 * @param action   le libellé du bouton qui fait avancer
 */
function PhaseChronometree({
  titre,
  nom,
  consigne,
  secondes = null,
  action,
  cle,
  son = true,
  onSuivant,
  onPrecedent,
  libellePrecedent,
  entete
}) {
  const [enMarche, setEnMarche] = useState(false);
  const [lance, setLance] = useState(false);

  // Chaque phase repart d'un chrono neuf et à l'arrêt : la minute de questions
  // vaut pour ce tour-ci, pas pour la soirée.
  useEffect(() => {
    setEnMarche(false);
    setLance(false);
  }, [cle]);

  return (
    <div className="flex flex-col flex-1">
      {entete}

      <p className="font-titre text-sm uppercase tracking-wide text-ardoise/70 mt-4 text-center">
        {titre}
      </p>

      {/* 15 % de la hauteur d'écran au minimum, borné pour qu'un nom long ne
          déborde pas sur grand écran. */}
      <p
        className="font-titre text-brique text-center leading-none mt-2 text-[clamp(2rem,15svh,4.5rem)] break-words"
        role="status"
      >
        {nom}
      </p>

      <p className="text-ardoise font-texte text-lg mt-4 max-w-md mx-auto text-center">
        {consigne}
      </p>

      {/* Centré comme le reste de l'écran, et à la largeur du bloc de boutons :
          aligné à gauche, il cassait la colonne alors qu'il est l'objet principal
          de la phase. */}
      {secondes && (
        <div className="mt-8 max-w-sm w-full mx-auto">
          <Chrono
            secondes={secondes}
            enMarche={enMarche}
            cle={cle}
            son={son}
            onFini={() => setEnMarche(false)}
          />
          <div className="flex items-center justify-center gap-3 mt-3">
            {/* Cette ligne dit pourquoi rien ne bouge : elle se lit, elle ne se
                devine pas. En 12 px à 60 % d'opacité, personne ne la voyait. */}
            <p className="text-ardoise font-texte">
              {!lance
                ? 'Le chrono attend votre signal.'
                : enMarche
                  ? 'Le chrono tourne.'
                  : 'Le chrono est en pause.'}
            </p>
            {/* La pause reste accrochée au chrono : elle commande le décompte,
                elle ne fait pas avancer le jeu. */}
            {lance && (
              <Bouton
                variante="discret"
                icone={enMarche ? Pause : Play}
                onClick={() => setEnMarche((v) => !v)}
              >
                {enMarche ? 'Pause' : 'Reprendre'}
              </Bouton>
            )}
          </div>
        </div>
      )}

      {/**
       * Deux directions en vis-à-vis, l'action seule en dessous.
       *
       * Trois boutons empilés sur deux rangées ne disaient plus lequel faisait
       * quoi. Reculer et avancer sont symétriques et de part et d'autre, à taille
       * réduite ; le geste de la phase prend toute la largeur, seul, et tombe
       * toujours au même endroit sous le pouce.
       *
       * Le retour reste rendu et désactivé quand il n'y a rien derrière : sans
       * lui, la rangée changerait de hauteur d'une phase à l'autre.
       */}
      <div className="mt-auto pt-6 max-w-sm w-full mx-auto">
        <div className="flex items-center justify-between gap-2">
          <Bouton
            variante="discret"
            icone={ArrowLeft}
            disabled={!onPrecedent}
            onClick={onPrecedent}
          >
            {libellePrecedent ?? 'Précédent'}
          </Bouton>
          {/* Avancer ne se dédouble que si le bouton principal fait autre chose :
              lancer le chrono. */}
          {secondes && !lance ? (
            <Bouton variante="discret" iconeApres={ArrowRight} onClick={onSuivant}>
              {action}
            </Bouton>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>

        <div className="mt-3">
          {secondes && !lance ? (
            <Bouton
              variante="principal"
              icone={Play}
              className="w-full"
              onClick={() => {
                setLance(true);
                setEnMarche(true);
              }}
            >
              Lancer le chrono
            </Bouton>
          ) : (
            <Bouton
              variante="principal"
              iconeApres={ArrowRight}
              className="w-full"
              onClick={onSuivant}
            >
              {action}
            </Bouton>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhaseChronometree;
