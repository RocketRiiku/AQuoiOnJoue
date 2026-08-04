import { useEffect, useState } from 'react';
import { ArrowRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton } from '../Bouton';
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
  onSuivant,
  entete
}) {
  const [enMarche, setEnMarche] = useState(false);
  const [lance, setLance] = useState(false);
  const [son, setSon] = useState(true);

  // Chaque phase repart d'un chrono neuf et à l'arrêt : la minute de questions
  // vaut pour ce tour-ci, pas pour la soirée.
  useEffect(() => {
    setEnMarche(false);
    setLance(false);
  }, [cle]);

  return (
    <div className="flex flex-col min-h-[62svh]">
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

      {secondes && (
        <div className="mt-8 max-w-md w-full mx-auto">
          <Chrono
            secondes={secondes}
            enMarche={enMarche}
            cle={cle}
            son={son}
            onFini={() => setEnMarche(false)}
          />
          <p className="text-ardoise/60 text-xs mt-2">
            {!lance
              ? 'Le chrono attend votre signal.'
              : enMarche
                ? 'Le chrono tourne.'
                : 'Le chrono est en pause.'}
          </p>
        </div>
      )}

      {/* `mt-auto` : la barre tombe au même endroit d'une phase à l'autre, quelle
          que soit la longueur de la consigne.

          Avant le départ, lancer le chrono *est* le mouvement vers l'avant :
          c'est lui qui prend l'emphase principale. Une fois le temps parti, elle
          revient à la phase suivante, la table pouvant toujours couper court —
          elle a fini avant la fin du temps aussi souvent que l'inverse. */}
      <div className="mt-auto">
        <BarreActions className="justify-center">
          {secondes && !lance ? (
            <Bouton
              variante="principal"
              icone={Play}
              onClick={() => {
                setLance(true);
                setEnMarche(true);
              }}
            >
              Lancer le chrono
            </Bouton>
          ) : (
            <Bouton variante="principal" iconeApres={ArrowRight} onClick={onSuivant}>
              {action}
            </Bouton>
          )}
        </BarreActions>

        <BarreActionsSecondaire className="justify-center">
          {secondes && !lance && (
            <Bouton variante="discret" iconeApres={ArrowRight} onClick={onSuivant}>
              {action}
            </Bouton>
          )}
          {secondes && lance && (
            <Bouton
              variante="discret"
              icone={enMarche ? Pause : Play}
              onClick={() => setEnMarche((v) => !v)}
            >
              {enMarche ? 'Pause' : 'Reprendre'}
            </Bouton>
          )}
          {secondes && (
            <Bouton
              variante="discret"
              icone={son ? Volume2 : VolumeX}
              onClick={() => setSon((v) => !v)}
              aria-pressed={son}
            >
              {son ? 'Couper le son' : 'Remettre le son'}
            </Bouton>
          )}
        </BarreActionsSecondaire>
      </div>
    </div>
  );
}

export default PhaseChronometree;
