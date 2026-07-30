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

  it('propose de notifier une erreur, jeu et fiche déjà renseignés', async () => {
    window.history.replaceState({}, '', '/?jeu=undercover');
    rendre();

    const lien = await screen.findByRole('link', {
      name: /notifier une erreur sur undercover/i
    });
    const href = lien.getAttribute('href');

    expect(href).toContain('mailto:nathanboumadjer@gmail.com');
    // Sans le jeu ni son adresse, un signalement demande un aller-retour.
    expect(href).toContain(encodeURIComponent('Jeu : Undercover'));
    expect(href).toContain(encodeURIComponent('?jeu=undercover'));
  });

  it('retombe sur la liste si le lien désigne un jeu inconnu', async () => {
    window.history.replaceState({}, '', '/?jeu=jeu-supprime');
    const u = rendre();
    await fermerIntroduction(u);
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
  });
});

describe('parcours : tirage au sort', () => {
  const titreFiche = () =>
    screen.getByRole('heading', { level: 2 }).textContent;

  it('propose de relancer sans repasser par la liste', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /surprends-moi/i }));

    // La fiche n'arrive qu'au bout du mélange : on l'attend avant de lire son
    // titre, sans quoi on lirait ceux des cartes de la liste.
    const relancer = await screen.findByRole(
      'button',
      { name: /un autre jeu/i },
      { timeout: 3000 }
    );
    const premier = titreFiche();

    await u.click(relancer);

    // Le tirage évite le jeu déjà affiché : on change forcément de fiche.
    expect(titreFiche()).not.toBe(premier);
  });

  it('n’offre pas la relance quand la fiche vient de la liste', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(carteDuJeu('Undercover'));

    await screen.findByRole('heading', { name: /comment on joue/i });
    expect(screen.queryByRole('button', { name: /un autre jeu/i })).not.toBeInTheDocument();
  });

  it('n’offre pas la relance s’il ne reste qu’un seul jeu', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    // 2 joueurs ne laisse que mix.GPT : il n'y a rien d'autre à tirer.
    await u.type(screen.getByLabelText(/nombre de joueurs/i), '2');
    await u.click(screen.getByRole('button', { name: /surprends-moi/i }));

    await screen.findByRole('heading', { name: /comment on joue/i });
    expect(screen.queryByRole('button', { name: /un autre jeu/i })).not.toBeInTheDocument();
  });

  it('mélange les cartes, puis rend la main', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    const bouton = screen.getByRole('button', { name: /surprends-moi/i });
    await u.click(bouton);

    // Le bouton se verrouille dans le geste même du clic — deux pressions
    // rapprochées ne doivent pas lancer deux tirages — et la fiche n'est pas
    // encore là.
    expect(bouton).toHaveAttribute('aria-busy', 'true');
    expect(bouton).toBeDisabled();
    expect(screen.queryByRole('heading', { name: /comment on joue/i })).not.toBeInTheDocument();

    // Et le tirage aboutit toujours : il est mené par une minuterie, jamais par
    // la fin d'une animation — celle-ci pourrait ne jamais venir.
    expect(
      await screen.findByRole('heading', { name: /comment on joue/i }, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it('tire sans attendre quand le système demande moins d’animations', async () => {
    const matchMediaInitial = window.matchMedia;
    window.matchMedia = (requete) => ({ ...matchMediaInitial(requete), matches: true });

    try {
      const u = rendre();
      await fermerIntroduction(u);

      await u.click(screen.getByRole('button', { name: /surprends-moi/i }));

      expect(screen.getByRole('heading', { name: /comment on joue/i })).toBeInTheDocument();
    } finally {
      window.matchMedia = matchMediaInitial;
    }
  });

  it('oublie le tirage après un retour à la liste', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /surprends-moi/i }));
    await screen.findByRole('button', { name: /un autre jeu/i });

    await u.click(screen.getByRole('button', { name: /retour aux jeux/i }));
    await u.click(carteDuJeu('Undercover'));

    expect(screen.queryByRole('button', { name: /un autre jeu/i })).not.toBeInTheDocument();
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

  it('accepte la saisie directe du nombre de joueurs', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    const champ = screen.getByLabelText(/nombre de joueurs/i);
    await u.type(champ, '10');

    // Le « 1 » intermédiaire ne doit pas être réécrit, sinon « 10 » est
    // impossible à taper.
    expect(champ).toHaveValue('10');
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
  });

  it('plafonne la saisie au maximum jouable et accepte l’effacement', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    const champ = screen.getByLabelText(/nombre de joueurs/i);
    await u.type(champ, '99');
    expect(champ).toHaveValue('10');

    await u.clear(champ);
    expect(champ).toHaveValue('');
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
  });

  it('ignore les caractères non numériques', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    const champ = screen.getByLabelText(/nombre de joueurs/i);
    await u.type(champ, 'a4b');
    expect(champ).toHaveValue('4');
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
    await u.click(screen.getByRole('button', { name: 'Rôles cachés' }));

    expect(screen.getByRole('status')).toHaveTextContent('2 jeux trouvés');
    expect(screen.getByRole('button', { name: 'Rôles cachés' })).toHaveAttribute(
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
    const boutonSoiree = screen.getByRole('button', { name: /ma soirée/i });
    expect(boutonSoiree).toBeDisabled();

    await ajouter(u, 'Le Liars Club');
    await ajouter(u, 'Undercover');
    expect(boutonSoiree).toBeEnabled();
    expect(boutonSoiree).toHaveTextContent('2');

    await u.click(boutonSoiree);
    const programme = await screen.findByRole('heading', { name: /ma soirée/i });
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
    expect(await screen.findByRole('heading', { name: /ma soirée/i })).toBeInTheDocument();
  });

  it('réordonne le programme', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await ajouter(u, 'Le Liars Club');
    await ajouter(u, 'Undercover');
    await u.click(screen.getByRole('button', { name: /ma soirée/i }));

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
    await u.click(screen.getByRole('button', { name: /ma soirée/i }));
    await u.click(screen.getByRole('button', { name: /retirer le liars club de la soirée/i }));

    expect(screen.getByText(/votre programme est vide/i)).toBeInTheDocument();
  });

  it('ouvre un programme reçu par lien', async () => {
    window.history.replaceState({}, '', '/?soiree=cacophonie,le-joker');
    rendre();

    expect(await screen.findByRole('heading', { name: /ma soirée/i })).toBeInTheDocument();
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

describe('parcours : pied de page', () => {
  it('ouvre les suggestions, puis revient à la liste', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /^suggestions$/i }));

    expect(
      await screen.findByRole('heading', { name: /un jeu à nous faire découvrir/i })
    ).toBeInTheDocument();
    expect(window.location.search).toBe('?page=suggestions');
    // La liste laisse la place à la page : ses cartes ne sont plus montées.
    expect(screen.queryByLabelText(/rechercher un jeu/i)).not.toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: /retour aux jeux/i }));

    expect(await screen.findByLabelText(/rechercher un jeu/i)).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('pré-remplit le courriel de suggestion avec le gabarit', async () => {
    window.history.replaceState({}, '', '/?page=suggestions');
    rendre();

    const lien = await screen.findByRole('link', { name: /envoyer ma suggestion/i });
    const href = lien.getAttribute('href');

    expect(href).toContain('mailto:nathanboumadjer@gmail.com');
    expect(href).toContain(encodeURIComponent('Le nom du jeu :'));
    expect(href).toContain(encodeURIComponent('Combien de joueurs :'));
    // Un « + » dans le corps arriverait tel quel dans le message.
    expect(href).not.toContain('+');
  });

  it('ouvre les mentions légales depuis un lien direct', async () => {
    window.history.replaceState({}, '', '/?page=mentions-legales');
    rendre();

    expect(
      await screen.findByRole('heading', { name: /mentions légales/i, level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hébergeur/i })).toBeInTheDocument();
  });

  it('retombe sur la liste si la page est inconnue', async () => {
    window.history.replaceState({}, '', '/?page=inexistante');
    const u = rendre();
    await fermerIntroduction(u);

    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
    expect(window.location.search).toBe('');
  });

  it('quitte une page pour la fiche d’un jeu', async () => {
    window.history.replaceState({}, '', '/?page=mentions-legales');
    const u = rendre();
    await screen.findByRole('heading', { name: /mentions légales/i, level: 2 });

    await u.click(screen.getByRole('button', { name: /retour aux jeux/i }));
    await fermerIntroduction(u);
    await u.click(carteDuJeu('Undercover'));

    // Le paramètre `page` prime sur le reste : s'il subsistait, la fiche
    // resterait masquée par les mentions légales.
    expect(await screen.findByRole('heading', { name: 'Undercover', level: 2 })).toBeInTheDocument();
    expect(window.location.search).toBe('?jeu=undercover');
  });

  it('propose un lien de contact vers l’adresse du site', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    const contact = screen.getByRole('link', { name: /^contact$/i });
    expect(contact).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:nathanboumadjer@gmail.com')
    );
  });
});

describe('parcours : première visite', () => {
  it('explique le principe, puis ne le réaffiche plus', async () => {
    const u = rendre();
    expect(screen.getByRole('heading', { name: /ce soir, on joue à quoi/i })).toBeInTheDocument();

    await u.click(screen.getByRole('button', { name: /c’est parti/i }));
    expect(
      screen.queryByRole('heading', { name: /ce soir, on joue à quoi/i })
    ).not.toBeInTheDocument();

    // La liste reste utilisable : une régression l'avait poussée hors écran.
    expect(screen.getAllByRole('listitem')).toHaveLength(gamesList.length);
    expect(screen.getByRole('button', { name: /comment ça marche/i })).toBeInTheDocument();
  });

  it('peut rouvrir l’explication à la demande', async () => {
    const u = rendre();
    await fermerIntroduction(u);

    await u.click(screen.getByRole('button', { name: /comment ça marche/i }));
    expect(screen.getByRole('heading', { name: /ce soir, on joue à quoi/i })).toBeInTheDocument();
  });
});
