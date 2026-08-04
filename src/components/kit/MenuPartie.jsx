import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Ellipsis, Trash2 } from 'lucide-react';
import { BarreActions, BarreActionsSecondaire, Bouton, BoutonIcone } from '../Bouton';
import Dialogue from '../Dialogue';
import { partieDuJeu } from '../../utils/partieEnCours';

/**
 * Tout ce qui ne sert pas à chaque tour, rangé hors de portée du pouce.
 *
 * **Le critère est la fréquence, pas l'encombrement.** Material fixe une à trois
 * actions visibles, à forte fréquence, et réserve au menu de dépassement les
 * actions rares ou destructrices — en prévenant qu'un menu qui avale tout fait
 * perdre confiance à la barre visible
 * ([Material 3](https://m3.material.io/components/app-bars/guidelines)). Reste
 * donc en bas ce qui fait avancer le jeu ; passe ici ce qui sert une fois par
 * partie : quitter, abandonner, remélanger, corriger un score, couper le son.
 *
 * **En haut à droite**, parce que c'est la zone la moins accessible d'un
 * téléphone tenu à une main, et que c'est exactement ce qu'on veut d'une cible
 * qui coûte une demi-heure de jeu
 * ([Parachute](https://parachutedesign.ca/blog/thumb-zone-ux/)).
 *
 * Le déclencheur part en **portail** dans l'en-tête du kit : cet en-tête
 * appartient à `App`, qui ne connaît pas les actions d'un jeu, alors que chaque
 * orchestrateur connaît les siennes. Chacun compose donc son menu et l'envoie se
 * poser au bon endroit, sans que l'application ait à faire remonter quoi que ce
 * soit.
 *
 * @param ancre   le nœud de l'en-tête où poser le déclencheur
 * @param slug    le jeu joué, pour savoir s'il y a une partie à abandonner
 * @param extras  les entrées propres au kit : `{ cle, libelle, icone, onClick }`
 */
function MenuPartie({ ancre, slug, libelleRetour, onQuitter, onAbandonner, extras = [] }) {
  const [ouvert, setOuvert] = useState(false);
  const [confirme, setConfirme] = useState(false);

  /**
   * Lue à l'ouverture, et non au rendu de l'application autour.
   *
   * Le kit écrit sa partie dans un effet, sans que rien au-dessus de lui en soit
   * averti : une valeur calculée par le parent restait celle d'avant la première
   * tape, et le menu annonçait « rien n'est enregistré » au milieu d'une partie.
   */
  const partieEnregistree = ouvert && Boolean(partieDuJeu(slug));

  const fermer = () => {
    setOuvert(false);
    setConfirme(false);
  };

  const declencheur = (
    <BoutonIcone
      icone={Ellipsis}
      infobulle="Autres actions"
      nomAccessible="Autres actions de la partie"
      onClick={() => setOuvert(true)}
    />
  );

  return (
    <>
      {ancre ? createPortal(declencheur, ancre) : declencheur}

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
          <Dialogue titre="Autres actions" onFermer={fermer}>
            {/* Les entrées du jeu d'abord : ce sont les seules qu'on vient
                parfois chercher pour continuer à jouer. La sortie ensuite. */}
            {extras.length > 0 && (
              <div className="flex flex-col items-start gap-2 mb-6">
                {extras.map(({ cle, libelle, icone, onClick }) => (
                  <Bouton
                    key={cle}
                    variante="discret"
                    icone={icone}
                    onClick={() => {
                      fermer();
                      onClick();
                    }}
                  >
                    {libelle}
                  </Bouton>
                ))}
              </div>
            )}

            <p className="text-ardoise font-texte">
              {partieEnregistree
                ? 'Quitter met la partie de côté : vous la retrouverez en revenant. Abandonner la supprime.'
                : 'Ce jeu ne garde aucune partie : quitter vous ramène d’où vous venez.'}
            </p>
            <BarreActions>
              <Bouton
                variante="secondaire"
                icone={ArrowLeft}
                onClick={() => {
                  fermer();
                  onQuitter();
                }}
              >
                {libelleRetour}
              </Bouton>
              {partieEnregistree && (
                <Bouton
                  variante="discret"
                  destructeur
                  icone={Trash2}
                  onClick={() => setConfirme(true)}
                >
                  Abandonner la partie
                </Bouton>
              )}
            </BarreActions>
          </Dialogue>
        ))}
    </>
  );
}

export default MenuPartie;
