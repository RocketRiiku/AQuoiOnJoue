import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KitFeuilleDeMatch from './KitFeuilleDeMatch';
import { gamesList } from '../../data/games';

/**
 * Les trois formes de l'écran, une par jeu représentatif : la feuille qu'on
 * tape au vol, le tour qu'on résout d'un coup, le duel. Le barème lui-même est
 * couvert sans DOM dans `feuilleDeMatch.test.js` — ici on vérifie qu'il est
 * bien branché, et que la table n'a aucun chiffre à calculer de tête.
 */
const jeu = (slug) => gamesList.find((g) => g.slug === slug);

const monter = (slug, joueurs) =>
  render(
    <KitFeuilleDeMatch
      game={jeu(slug)}
      joueurs={joueurs}
      onQuitter={() => {}}
      onRetourAccueil={() => {}}
      libelleRetour="Retour à la fiche"
    />
  );

/** Passe l'écran de réglage avec l'effectif proposé. */
const ouvrirLaFeuille = async () => {
  await userEvent.click(screen.getByRole('button', { name: /Ouvrir la feuille/ }));
};

const ligneDe = (nom) => screen.getByRole('row', { name: new RegExp(nom) });

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  window.localStorage.clear();
  vi.useRealTimers();
});

describe('KitFeuilleDeMatch — l’écran de réglage', () => {
  it('reprend l’effectif déjà saisi dans le filtre de la liste', async () => {
    monter('qui-rit-sort', 7);
    // Le nombre de joueurs se saisit une fois, dans le filtre, et suit jusque
    // dans le kit : le redemander serait le demander deux fois.
    expect(screen.getByText(/7 lignes sur la feuille/)).toBeInTheDocument();

    await ouvrirLaFeuille();
    expect(screen.getAllByRole('button', { name: /Joueur \d/ })).toHaveLength(7);
  });

  it('retombe sur l’effectif idéal quand le filtre est vide', () => {
    monter('qui-rit-sort', null);
    expect(
      screen.getByText(new RegExp(`${jeu('qui-rit-sort').idealPlayersMin} lignes`))
    ).toBeInTheDocument();
  });

  it('rappelle la règle avant de commencer', () => {
    monter('sur-parole', 5);
    expect(screen.getByText(/l’As vaut 11/)).toBeInTheDocument();
  });

  it('renomme les joueurs, et garde « Joueur n » pour les champs vides', async () => {
    monter('qui-rit-sort', 3);
    await userEvent.click(screen.getByRole('button', { name: /Paramètres avancés/ }));
    await userEvent.type(screen.getByPlaceholderText('Joueur 2'), 'Camille');
    await ouvrirLaFeuille();

    expect(screen.getByRole('button', { name: /^Camille/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Joueur 1/ })).toBeInTheDocument();
  });
});

describe('KitFeuilleDeMatch — la feuille qu’on tape (Qui rit sort)', () => {
  it('marque un avertissement en touchant la ligne', async () => {
    monter('qui-rit-sort', 4);
    await ouvrirLaFeuille();

    await userEvent.click(screen.getByRole('button', { name: /^Joueur 2 a souri/ }));
    expect(
      screen.getByRole('button', { name: 'Joueur 2 a souri — 1 avertissement sur 2' })
    ).toBeInTheDocument();
  });

  it('élimine au seuil sans retirer le joueur de l’écran', async () => {
    monter('qui-rit-sort', 4);
    await ouvrirLaFeuille();

    const cible = () => screen.getByRole('button', { name: /^Joueur 2/ });
    await userEvent.click(cible());
    await userEvent.click(cible());

    // Il rejoint le public, d'où il continue à saboter : il reste affiché.
    expect(screen.getByRole('button', { name: 'Joueur 2 — éliminé' })).toBeDisabled();
    expect(screen.getByText(/3 joueurs encore en course/)).toBeInTheDocument();
  });

  it('annonce le classement quand il ne reste qu’un joueur', async () => {
    monter('qui-rit-sort', 3);
    await ouvrirLaFeuille();

    for (const nom of ['Joueur 1', 'Joueur 3']) {
      const cible = () => screen.getByRole('button', { name: new RegExp(`^${nom}`) });
      await userEvent.click(cible());
      await userEvent.click(cible());
    }

    expect(screen.getByText('Joueur 2 l’emporte')).toBeInTheDocument();
    expect(screen.getByText('Le dernier debout.')).toBeInTheDocument();
  });

  it('défait la tape, et retire l’offre une fois servie', async () => {
    monter('qui-rit-sort', 4);
    await ouvrirLaFeuille();

    await userEvent.click(screen.getByRole('button', { name: /^Joueur 2 a souri/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(
      screen.getByRole('button', { name: 'Joueur 2 a souri — 0 avertissement sur 2' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();
  });
});

/**
 * La fenêtre d'annulation, à part parce qu'elle demande des minuteries simulées.
 *
 * On ne simule que `setInterval`, jamais tout : tout simuler fige aussi
 * l'ordonnanceur de React et plus rien ne se rend — le piège déjà rencontré sur
 * le décompte d'entrée d'`EcranTour`. Simuler `setTimeout` en particulier
 * interbloque les utilitaires asynchrones de Testing Library.
 */
describe('KitFeuilleDeMatch — la fenêtre d’annulation', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] }));

  it('ne laisse pas « Annuler » à demeure', async () => {
    const utilisateur = userEvent.setup({
      // Sans cela, chaque clic attend une vraie minuterie que les minuteries
      // simulées n'avancent jamais.
      delay: null,
      advanceTimers: (ms) => vi.advanceTimersByTime(ms)
    });
    monter('qui-rit-sort', 4);
    await utilisateur.click(screen.getByRole('button', { name: /Ouvrir la feuille/ }));
    await utilisateur.click(screen.getByRole('button', { name: /^Joueur 2 a souri/ }));

    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2600);
    });
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();
    // Le geste, lui, tient : c'est l'offre qui expire, pas le point.
    expect(
      screen.getByRole('button', { name: 'Joueur 2 a souri — 1 avertissement sur 2' })
    ).toBeInTheDocument();
  });
});

describe('KitFeuilleDeMatch — le tour qu’on résout (Le Liars Club)', () => {
  it('désigne le joueur courant et ne lui propose pas de se démasquer', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();

    expect(screen.getByText(/Joueur 1 raconte/)).toBeInTheDocument();
    // Les pastilles listent les auditeurs, jamais le conteur.
    expect(screen.getByRole('button', { name: 'Joueur 2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Joueur 1' })).not.toBeInTheDocument();
  });

  it('déduit les points du conteur du nombre de trouveurs', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();

    // Un seul démasque : le conteur a trompé les deux autres.
    await userEvent.click(screen.getByRole('button', { name: 'Joueur 3' }));
    await userEvent.click(screen.getByRole('button', { name: /Compter les points/ }));

    expect(within(ligneDe('Joueur 1')).getByText('2')).toBeInTheDocument();
    expect(within(ligneDe('Joueur 3')).getByText('1')).toBeInTheDocument();
    // Le tour passe au suivant.
    expect(screen.getByText(/Joueur 2 raconte/)).toBeInTheDocument();
  });

  it('propose la minute d’interrogation que le catalogue annonce', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();
    // chronoTour = 60 s : « 1:00 », lu en minutes au-delà de cent secondes ? Non
    // — soixante secondes s'annoncent encore en secondes.
    expect(screen.getByRole('timer')).toHaveTextContent('60');
    expect(screen.getByRole('button', { name: /Questions/ })).toBeInTheDocument();
  });

  it('signale le tour de table complet, et clôt sur demande', async () => {
    monter('liars-club', 3);
    await ouvrirLaFeuille();

    expect(screen.getByRole('button', { name: /Terminer la partie/ })).toBeInTheDocument();
    for (let tour = 0; tour < 3; tour += 1) {
      await userEvent.click(screen.getByRole('button', { name: /Compter les points/ }));
    }

    const conclure = screen.getByRole('button', { name: /Tout le monde est passé/ });
    await userEvent.click(conclure);
    expect(screen.getByRole('table', { name: /Classement par joueur/ })).toBeInTheDocument();
  });

  it('corrige un score sans toucher aux autres', async () => {
    monter('tudum', 3);
    await ouvrirLaFeuille();

    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un point à Joueur 3' }));
    expect(within(ligneDe('Joueur 3')).getByText('1')).toBeInTheDocument();
    expect(within(ligneDe('Joueur 2')).getByText('0')).toBeInTheDocument();
  });
});

describe('KitFeuilleDeMatch — le duel (Avez-vous confiance ?)', () => {
  it('tire deux duellistes, puis répartit les six points', async () => {
    monter('avez-vous-confiance', 4);
    await ouvrirLaFeuille();

    await userEvent.click(screen.getByRole('button', { name: /Tirer deux duellistes/ }));
    expect(screen.getByText(/contre/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Deux CONFIANCE/ }));
    // Trois points chacun, et à personne d'autre : six points en jeu, six
    // points distribués.
    expect(screen.getAllByText('3')).toHaveLength(2);
  });

  it('demande lequel des deux a trahi', async () => {
    monter('avez-vous-confiance', 4);
    await ouvrirLaFeuille();
    await userEvent.click(screen.getByRole('button', { name: /Tirer deux duellistes/ }));

    // L'issue asymétrique prend deux boutons, un par duelliste ; les issues
    // symétriques n'en demandent qu'un.
    expect(screen.getAllByRole('button', { name: /Une seule trahison/ })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Deux trahisons/ })).toHaveLength(1);
  });
});

describe('KitFeuilleDeMatch — la partie conservée', () => {
  it('propose de reprendre la partie laissée en plan', async () => {
    const { unmount } = monter('qui-rit-sort', 4);
    await ouvrirLaFeuille();
    await userEvent.click(screen.getByRole('button', { name: /^Joueur 2 a souri/ }));
    unmount();

    monter('qui-rit-sort', 4);
    expect(screen.getByText('Une partie est en cours')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Reprendre la partie/ }));
    expect(
      screen.getByRole('button', { name: 'Joueur 2 a souri — 1 avertissement sur 2' })
    ).toBeInTheDocument();
  });

  it('repart de zéro si on choisit une nouvelle partie', async () => {
    const { unmount } = monter('qui-rit-sort', 4);
    await ouvrirLaFeuille();
    await userEvent.click(screen.getByRole('button', { name: /^Joueur 2 a souri/ }));
    unmount();

    monter('qui-rit-sort', 4);
    await userEvent.click(screen.getByRole('button', { name: /Nouvelle partie/ }));
    expect(screen.getByRole('button', { name: /Ouvrir la feuille/ })).toBeInTheDocument();
  });

  it('efface la partie une fois le classement atteint', async () => {
    monter('qui-rit-sort', 3);
    await ouvrirLaFeuille();
    for (const nom of ['Joueur 1', 'Joueur 3']) {
      const cible = () => screen.getByRole('button', { name: new RegExp(`^${nom}`) });
      await userEvent.click(cible());
      await userEvent.click(cible());
    }

    // Rien à reprendre d'une partie terminée : la proposer serait déroutant.
    expect(window.localStorage.getItem('aquoionjoue:partie')).toBeNull();
  });
});
