import { useState } from 'react';
import { ArrowLeft, Ellipsis, Trash2 } from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton, BoutonIcone } from '../Bouton';
import Dialogue from '../Dialogue';
import { partieDuJeu } from '../../utils/partieEnCours';

/**
 * Les sorties d'une partie, rangées hors de portée du pouce.
 *
 * Les trois chemins de sortie s'alignaient en bas de l'écran, dont deux qui se
 * ressemblaient — « Terminer la partie » et « Abandonner la partie ». En soirée,
 * un pouce mal placé faisait perdre une demi-heure de jeu. Seul « Terminer »
 * reste visible dans la partie, et il ne fait rien perdre : il mène au
 * classement.
 *
 * Quitter et abandonner passent donc par ce menu, en **haut à droite**. C'est la
 * zone la moins accessible d'un téléphone tenu à une main, et c'est exactement
 * ce qu'on veut d'une cible négative : une friction volontaire. Le bas de
 * l'écran reste à l'interaction, le haut à la lecture et à ce qu'on ne doit pas
 * toucher par accident.
 *
 * L'abandon demande confirmation, dans le même dialogue plutôt que dans un
 * second : deux voiles empilés se referment mal, et la question tient en une
 * phrase.
 *
 * @param slug le jeu joué, pour savoir s'il y a une partie à abandonner
 */
function MenuPartie({ slug, libelleRetour, onQuitter, onAbandonner }) {
  const [ouvert, setOuvert] = useState(false);
  const [confirme, setConfirme] = useState(false);

  /**
   * Lue à l'ouverture, et non au rendu de l'application autour.
   *
   * Le kit écrit sa partie dans un effet, sans que rien au-dessus de lui en soit
   * averti : une valeur calculée par le parent restait celle d'avant la première
   * tape, et le menu annonçait « rien n'est enregistré » au milieu d'une partie.
   * Le défileur, lui, n'enregistre réellement rien.
   */
  const partieEnregistree = ouvert && Boolean(partieDuJeu(slug));

  const fermer = () => {
    setOuvert(false);
    setConfirme(false);
  };

  return (
    <>
      <BoutonIcone
        icone={Ellipsis}
        infobulle="Sortir de la partie"
        nomAccessible="Sortir de la partie"
        onClick={() => setOuvert(true)}
      />

      {ouvert &&
        (confirme ? (
          <Dialogue titre="Abandonner la partie ?" onFermer={fermer}>
            <p className="text-ardoise font-texte text-lg">
              Vous perdrez les scores, et la partie ne se reprendra pas. Quitter
              sans abandonner la garde de côté.
            </p>
            <BarreActions>
              <Bouton
                variante="discret"
                destructeur
                icone={Trash2}
                onClick={() => {
                  fermer();
                  onAbandonner();
                }}
              >
                Oui, abandonner
              </Bouton>
              <Bouton variante="secondaire" onClick={() => setConfirme(false)}>
                Non, revenir au jeu
              </Bouton>
            </BarreActions>
          </Dialogue>
        ) : (
          <Dialogue titre="Cette partie" onFermer={fermer}>
            <p className="text-ardoise font-texte text-lg">
              {partieEnregistree
                ? 'Quitter met la partie de côté : vous la retrouverez en revenant. Abandonner la supprime.'
                : 'Ce jeu ne garde aucune partie : quitter vous ramène d’où vous venez.'}
            </p>
            <BarreActions>
              <Bouton
                variante="principal"
                icone={ArrowLeft}
                onClick={() => {
                  fermer();
                  onQuitter();
                }}
              >
                {libelleRetour}
              </Bouton>
            </BarreActions>
            {partieEnregistree && (
              <BarreActionsSecondaire>
                <Bouton
                  variante="discret"
                  destructeur
                  icone={Trash2}
                  onClick={() => setConfirme(true)}
                >
                  Abandonner la partie
                </Bouton>
              </BarreActionsSecondaire>
            )}
          </Dialogue>
        ))}
    </>
  );
}

export default MenuPartie;
