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

/**
 * Traverse les phases d'un tour jusqu'au vote.
 *
 * Un tour du Liars Club se joue en trois écrans successifs — le récit, les
 * questions, le vote — et non sur un empilement. Chaque phase offre de passer à
 * la suivante sans lancer son chrono : la table finit avant le temps aussi
 * souvent que l'inverse.
 */
const allerAuVote = async () => {
  await userEvent.click(screen.getByRole('button', { name: /Passer aux questions/ }));
  await userEvent.click(screen.getByRole('button', { name: /Passer au vote/ }));
};

/** Ouvre le tableau des scores, replié derrière son bandeau. */
const ouvrirLesScores = async () => {
  await userEvent.click(screen.getByRole('button', { name: /Voir les scores/ }));
};

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
    expect(screen.getByText(/as vaut 11/i)).toBeInTheDocument();
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
      screen.getByRole('button', { name: 'Joueur 2 a souri, 1 avertissement sur 2' })
    ).toBeInTheDocument();
  });

  it('élimine au seuil sans retirer le joueur de l’écran', async () => {
    monter('qui-rit-sort', 4);
    await ouvrirLaFeuille();

    const cible = () => screen.getByRole('button', { name: /^Joueur 2/ });
    await userEvent.click(cible());
    await userEvent.click(cible());

    // Il rejoint le public, d'où il continue à saboter : il reste affiché.
    expect(screen.getByRole('button', { name: 'Joueur 2, éliminé' })).toBeDisabled();
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
      screen.getByRole('button', { name: 'Joueur 2 a souri, 0 avertissement sur 2' })
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
      screen.getByRole('button', { name: 'Joueur 2 a souri, 1 avertissement sur 2' })
    ).toBeInTheDocument();
  });
});

describe('KitFeuilleDeMatch — le tour qu’on résout (Le Liars Club)', () => {
  it('joue le tour dans l’ordre de la table : récit, questions, vote', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();

    // L'écran suivait l'ordre inverse du jeu : on y votait avant que le conteur
    // ait parlé. Chaque phase prend maintenant l'écran, dans l'ordre réel.
    expect(screen.getByText('Le récit')).toBeInTheDocument();
    expect(screen.getByText(/Joueur 1 raconte/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Compter les points/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Passer aux questions/ }));
    expect(screen.getByText('Les questions')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Passer au vote/ }));
    // Le vote nomme celui dont on juge les anecdotes, et la question dit ce qu'on
    // cherche : le libellé « Le vote » ne portait ni l'un ni l'autre.
    expect(screen.getByText('Joueur 1 a raconté')).toBeInTheDocument();
    expect(screen.getByText('Qui a trouvé la vraie histoire ?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compter les points/ })).toBeInTheDocument();
  });

  it('ne chronomètre pas le récit, et dit si le chrono des questions tourne', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();

    // Personne ne met un conteur sous pression pendant qu'il raconte sa vie, et
    // les règles ne prévoient de minute que pour l'interrogatoire.
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Passer aux questions/ }));

    // Un décompte figé sur sa durée pleine ne se distingue pas d'un décompte en
    // attente : l'écran le dit, et le bouton nomme le geste.
    expect(screen.getByText('Le chrono attend votre signal.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Lancer le chrono/ }));
    expect(screen.getByText('Le chrono tourne.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Le chrono est en pause.')).toBeInTheDocument();
  });

  it('revient à la phase précédente, jusqu’au récit', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();

    // Rien ne permettait de revenir : une phase sautée par erreur emportait tout
    // le tour.
    expect(screen.getByRole('button', { name: /Précédent/ })).toBeDisabled();

    await allerAuVote();
    await userEvent.click(screen.getByRole('button', { name: /Les questions/ }));
    expect(screen.getByText('Les questions')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Le récit/ }));
    expect(screen.getByText(/Joueur 1 raconte/)).toBeInTheDocument();
  });

  it('donne à la phase de questions la minute du catalogue', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();
    await userEvent.click(screen.getByRole('button', { name: /Passer aux questions/ }));

    // chronoTour = 60 s, et les règles disent « une minute » d'interrogation.
    expect(screen.getByRole('timer')).toHaveTextContent('60');
  });

  it('déduit les points du conteur du nombre de trouveurs', async () => {
    monter('liars-club', 4);
    await ouvrirLaFeuille();
    await allerAuVote();

    // Un seul démasque : le conteur a trompé les deux autres.
    await userEvent.click(screen.getByRole('button', { name: /^Joueur 3 a trouvé/ }));
    await userEvent.click(screen.getByRole('button', { name: /Compter les points/ }));

    // Le tour passe au suivant, et le bandeau annonce qui mène.
    expect(screen.getByText(/Joueur 2 raconte/)).toBeInTheDocument();
    await ouvrirLesScores();
    expect(within(ligneDe('Joueur 1')).getByText('2')).toBeInTheDocument();
    expect(within(ligneDe('Joueur 3')).getByText('1')).toBeInTheDocument();
  });

  it('montre ce que « Compter les points » va faire', async () => {
    const { container } = monter('liars-club', 4);
    await ouvrirLaFeuille();
    await allerAuVote();
    const apercu = () => container.querySelector('[aria-live="polite"]').textContent;

    // Personne de désigné : l'aperçu dit ce que ça vaut au conteur, ce qui est
    // justement le calcul qu'on a retiré à la table. Rien ne l'annonçait, et on
    // validait sans savoir ce qu'on déclenchait.
    expect(apercu()).toContain('Joueur 1');
    expect(apercu()).toContain('+3');

    await userEvent.click(screen.getByRole('button', { name: /^Joueur 3 a trouvé/ }));
    // Le conteur n'a plus trompé que deux personnes, et le trouveur marque.
    expect(apercu()).toContain('+2');
    expect(apercu()).toContain('+1');
    expect(apercu()).toContain('Joueur 3');
  });

  it('affiche le tour de table en cours, puis signale qu’il est complet', async () => {
    monter('liars-club', 3);
    await ouvrirLaFeuille();

    expect(screen.getByText('Tour 1 sur 3')).toBeInTheDocument();
    for (let tour = 0; tour < 3; tour += 1) {
      await allerAuVote();
      await userEvent.click(screen.getByRole('button', { name: /Compter les points/ }));
    }

    expect(screen.getByText('Tour de table complet')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Tout le monde est passé/ }));
    expect(screen.getByRole('table', { name: /Classement par joueur/ })).toBeInTheDocument();
  });

  it('annonce qui doit imiter, et suit le tour de table', async () => {
    /**
     * Tudum ne déclare aucune phase : l'écran de vote est le seul écran d'un tour,
     * et il n'annonçait nulle part le joueur dont c'était le tour. On lisait « Qui
     * a reconnu le son ? » sans savoir qui devait le produire — l'impression d'un
     * écran manquant, alors que `roleCourant` existait déjà et n'était lu par
     * personne.
     */
    monter('tudum', 3);
    await ouvrirLaFeuille();

    expect(screen.getByText('Joueur 1 imite')).toBeInTheDocument();
    // Et celui qui imite ne figure pas parmi ceux qu'on désigne.
    expect(screen.queryByRole('button', { name: /^Joueur 1 a trouvé$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Joueur 2 a trouvé$/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Compter les points/ }));
    expect(screen.getByText('Joueur 2 imite')).toBeInTheDocument();
  });

  it('replie le tableau derrière son bandeau, correction comprise', async () => {
    monter('tudum', 3);
    await ouvrirLaFeuille();

    // Le tableau occupait la moitié de l'écran en permanence, pour une
    // correction qui sert une fois sur vingt.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/Scores à zéro/)).toBeInTheDocument();

    await ouvrirLesScores();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ajouter un point à Joueur 3' })
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Corriger un score/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un point à Joueur 3' }));
    expect(within(ligneDe('Joueur 3')).getByText('1')).toBeInTheDocument();
    expect(within(ligneDe('Joueur 2')).getByText('0')).toBeInTheDocument();
  });
});

describe('KitFeuilleDeMatch — le duel (Avez-vous confiance ?)', () => {
  const tirerLeDuel = async () => {
    monter('avez-vous-confiance', 4);
    await ouvrirLaFeuille();
    await userEvent.click(screen.getByRole('button', { name: /Tirer deux duellistes/ }));
  };

  it('présente les quatre cases du barème, une seule tape chacune', async () => {
    await tirerLeDuel();

    expect(screen.getByText(/contre/)).toBeInTheDocument();
    // Quatre cases, et pas cinq boutons de prose : chaque combinaison d'étiquettes
    // a la sienne, y compris la trahison unilatérale dans les deux sens.
    const cases = screen.getAllByRole('button', { name: /pose (CONFIANCE|TRAHIR)/ });
    expect(cases).toHaveLength(4);
  });

  it('donne trois points à chacun quand les deux font confiance', async () => {
    await tirerLeDuel();

    await userEvent.click(
      screen.getByRole('button', { name: /pose CONFIANCE et .* pose CONFIANCE/ })
    );
    // Le bandeau dit l'essentiel sans qu'on déplie le tableau.
    expect(screen.getByText('Égalité · 3 points')).toBeInTheDocument();

    await ouvrirLesScores();
    expect(screen.getAllByText('3')).toHaveLength(2);
  });

  it('distingue le traître de sa victime sans le demander deux fois', async () => {
    await tirerLeDuel();

    // La case dit qui a posé quoi : cinq points pour le traître, zéro pour
    // l'autre, en une tape.
    const [cinqPourLePremier] = screen.getAllByRole('button', {
      name: /pose TRAHIR et .* pose CONFIANCE/
    });
    await userEvent.click(cinqPourLePremier);

    await ouvrirLesScores();
    expect(screen.getByText('5')).toBeInTheDocument();
    // Le reste de la table n'a rien touché : trois zéros pour quatre joueurs.
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('laisse un point à chacun quand les deux trahissent', async () => {
    await tirerLeDuel();

    await userEvent.click(screen.getByRole('button', { name: /pose TRAHIR et .* pose TRAHIR/ }));
    // Le pot a brûlé : deux points distribués sur les six.
    await ouvrirLesScores();
    expect(screen.getAllByText('1')).toHaveLength(2);
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
      screen.getByRole('button', { name: 'Joueur 2 a souri, 1 avertissement sur 2' })
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
