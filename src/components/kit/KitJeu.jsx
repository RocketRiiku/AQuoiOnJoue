import { ArrowLeft } from 'lucide-react';
import { BarreActions, Bouton } from '../Bouton';
import { kitDe } from './registre';

/** Aiguillage : le kit du jeu, ou un repli si aucun n'est installé. */
function KitJeu({
  game,
  joueurs,
  ancreMenu,
  onQuitter,
  onRetourAccueil,
  libelleRetour = 'Retour à la fiche'
}) {
  const Kit = kitDe(game);

  // Le bouton n'est proposé que pour les kits installés : on ne devrait jamais
  // arriver ici sans. Un lien direct vers `?kit=1` sur un autre jeu, lui, le
  // peut — il repart vers la fiche plutôt que sur un écran vide.
  if (!Kit) {
    return (
      <>
        <p className="text-ardoise font-texte text-lg">
          Le kit de ce jeu n’est pas encore prêt. Les règles de la fiche disent tout ce
          qu’il faut pour y jouer.
        </p>
        <BarreActions>
          <Bouton variante="principal" icone={ArrowLeft} onClick={onQuitter}>
            {libelleRetour}
          </Bouton>
        </BarreActions>
      </>
    );
  }

  return (
    <Kit
      game={game}
      joueurs={joueurs}
      ancreMenu={ancreMenu}
      onQuitter={onQuitter}
      onRetourAccueil={onRetourAccueil}
      libelleRetour={libelleRetour}
    />
  );
}

export default KitJeu;
