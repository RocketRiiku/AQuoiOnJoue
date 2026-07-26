import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { gamesList } from './data/games';

/**
 * Tests de parcours : ils suivent un chemin complet dans l'interface plutôt que
 * d'isoler une fonction.
 *
 * Ils existent parce que la suite unitaire, pourtant fournie, n'a pas vu partir
 * en production deux régressions bloquantes : l'ouverture d'une fiche de jeu ne
 * fonctionnait plus, et la liste se décalait hors de l'écran après fermeture de
 * l'explication. Aucun test ne cliquait sur une carte.
 *
 * On vérifie la présence dans le DOM plutôt que la visibilité : jsdom ne calcule
 * pas de rendu, et une opacité posée en style inline par une bibliothèque
 * d'animation ferait échouer `toBeVisible` sans qu'il y ait de défaut. C'est bien
 * le montage du composant qui manquait dans les deux régressions.
 */

const rendre = () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  return utilisateur;
};

/** Ferme l'explication de première visite, qui masque la liste au départ. */
const fermerIntroduction = async (utilisateur) => {
  const bouton = screen.queryByRole('button', { name: /masquer l’explication/i });
  if (bouton) await utilisateur.click(bouton);
};

const carteDuJeu = (titre) =>
  screen.getByRole('button', { name: new RegExp(`^${titre.replace(/[.?]/g, '\\$&')}\\.`) });

describe('parcours : consulter un jeu', () => {
  it('affiche la liste complète au chargement', async () => {
    const u = rendre();
    await fermerIntroduction(u);
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
  });

  it('ouvre la fiche d’un jeu et affiche ses règles', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(carteDuJeu('Undercover'));

    // Régression : l'URL et le titre changeaient, mais la fiche ne montait pas.
    expect(await screen.findByRole('heading', { name: 'Undercover', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /comment on joue/i })).toBeInTheDocument();
    // Sans apostrophe dans le motif : les données mêlent apostrophes droites
    // et typographiques, et ce test n'a pas à en dépendre.
    expect(screen.getByText(/qui reçoit un mot très proche/i)).toBeInTheDocument();
    expect(window.location.search).toBe('?jeu=undercover');
  });

  it('revient à la liste, filtres et recherche compris', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(carteDuJeu('Undercover'));
    await screen.findByRole('heading', { name: /comment on joue/i });
    // La recherche appartient à la vue liste : elle disparaît sur une fiche.
    expect(screen.queryByLabelText(/rechercher un jeu/i)).not.toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: /retour aux jeux/i }));

    expect(await screen.findByLabelText(/rechercher un jeu/i)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
    expect(window.location.search).toBe('');
  });

  it('ouvre directement la fiche depuis un lien partagé', async () => {
    window.history.replaceState({}, '', '/?jeu=cacophonie');
    rendre();
    expect(await screen.findByRole('heading', { name: 'Cacophonie', level: 2 })).toBeInTheDocument();
  });

  it('retombe sur la liste si le lien désigne un jeu inconnu', async () => {
    window.history.replaceState({}, '', '/?jeu=jeu-supprime');
    const u = rendre();
    await fermerIntroduction(u);
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
  });
});

describe('parcours : filtrer', () => {
  it('restreint la liste par nombre de joueurs', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /plus de joueurs/i }));

    // 2 joueurs : seul mix.GPT descend aussi bas.
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('1 jeu trouvé');
  });

  it('restreint la liste par recherche, sans tenir compte des accents', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.type(screen.getByLabelText(/rechercher un jeu/i), 'traitre');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Undercover' })).toBeInTheDocument();
  });

  it('déplie les filtres secondaires et applique une pastille', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /plus de filtres/i }));
    await u.click(screen.getByRole('button', { name: 'à traîtres' }));

    expect(screen.getByRole('status')).toHaveTextContent('2 jeux trouvés');
    expect(screen.getByRole('button', { name: 'à traîtres' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('réinitialise les filtres', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /plus de joueurs/i }));
    await u.click(screen.getByRole('button', { name: /réinitialiser/i }));

    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
  });

  it('affiche un état vide exploitable', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.type(screen.getByLabelText(/rechercher un jeu/i), 'zzzz');

    expect(screen.getByText(/aucun jeu trouvé/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /surprends-moi/i })).toBeDisabled();
  });
});

describe('parcours : composer et dérouler une soirée', () => {
  const ajouter = async (u, titre) =>
    u.click(screen.getByRole('button', { name: new RegExp(`ajouter ${titre} à la soirée`, 'i') }));

  it('compose un programme, le déroule et le termine', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    // Le bouton existe dès le départ, désactivé, pour faire connaître la fonction.
    const boutonSoiree = screen.getByRole('button', { name: /notre soirée/i });
    expect(boutonSoiree).toBeDisabled();

    await ajouter(u, 'Le Liars Club');
    await ajouter(u, 'Undercover');
    expect(boutonSoiree).toBeEnabled();
    expect(boutonSoiree).toHaveTextContent('2');

    await u.click(boutonSoiree);
    const programme = await screen.findByRole('heading', { name: /notre soirée/i });
    expect(programme).toBeInTheDocument();
    expect(screen.getByText(/1 h/)).toBeInTheDocument(); // 40 + 20 min

    await u.click(screen.getByRole('button', { name: /lancer la soirée/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Jeu 1 sur 2');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Le Liars Club');
    expect(screen.getByRole('button', { name: /précédent/i })).toBeDisabled();

    await u.click(screen.getByRole('button', { name: /jeu suivant/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Jeu 2 sur 2');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Undercover');

    // Dernière étape : l'action devient « Terminer ».
    await u.click(screen.getByRole('button', { name: /terminer la soirée/i }));
    expect(await screen.findByRole('heading', { name: /notre soirée/i })).toBeInTheDocument();
  });

  it('réordonne le programme', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await ajouter(u, 'Le Liars Club');
    await ajouter(u, 'Undercover');
    await u.click(screen.getByRole('button', { name: /notre soirée/i }));

    const avant = screen.getByRole('list');
    expect(within(avant).getAllByRole('listitem')[0]).toHaveTextContent('Le Liars Club');

    await u.click(screen.getByRole('button', { name: /descendre le liars club/i }));

    const apres = screen.getByRole('list');
    expect(within(apres).getAllByRole('listitem')[0]).toHaveTextContent('Undercover');
  });

  it('retire un jeu du programme', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await ajouter(u, 'Le Liars Club');
    await u.click(screen.getByRole('button', { name: /notre soirée/i }));
    await u.click(screen.getByRole('button', { name: /retirer le liars club de la soirée/i }));

    expect(screen.getByText(/votre programme est vide/i)).toBeInTheDocument();
  });

  it('ouvre un programme reçu par lien', async () => {
    window.history.replaceState({}, '', '/?soiree=cacophonie,le-joker');
    rendre();

    expect(await screen.findByRole('heading', { name: /notre soirée/i })).toBeInTheDocument();
    const liste = screen.getByRole('list');
    expect(within(liste).getAllByRole('listitem')).toHaveLength(2);
  });

  it('reprend un déroulé à l’étape indiquée par le lien', async () => {
    window.history.replaceState({}, '', '/?soiree=cacophonie,le-joker&etape=2');
    rendre();

    expect(await screen.findByRole('status')).toHaveTextContent('Jeu 2 sur 2');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Le Joker');
  });
});

describe('parcours : première visite', () => {
  it('explique le principe, puis ne le réaffiche plus', async () => {
    const u = rendre();
    expect(screen.getByRole('heading', { name: /vous ne savez pas à quoi jouer/i })).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: /c’est parti/i }));
    expect(
      screen.queryByRole('heading', { name: /vous ne savez pas à quoi jouer/i })
    ).not.toBeInTheDocument();

    // La liste reste utilisable : une régression l'avait poussée hors écran.
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
    expect(screen.getByRole('button', { name: /comment ça marche/i })).toBeInTheDocument();
  });

  it('peut rouvrir l’explication à la demande', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /comment ça marche/i }));
    expect(screen.getByRole('heading', { name: /vous ne savez pas à quoi jouer/i })).toBeInTheDocument();
  });
});
