import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KitJeu from './KitJeu';
import { gamesList } from '../../data/games';
import { contenuDuJeu } from '../../data/lancerJeu';
import { reglesDe } from '../../utils/quizAnimateur';

const jeu = (slug) => gamesList.find((g) => g.slug === slug);

/**
 * Le câblage du quiz d'animateur, du réglage au classement.
 *
 * Le déroulé lui-même est couvert à part (quizAnimateur.test.js) : ce qui se joue
 * ici, c'est ce que le réducteur ne voit pas — la coupure entre chercher et
 * compter, le barème traduit en tapes, la bascule du Fitch, et le fait que la
 * réponse ne fuite pas avant qu'on la demande.
 */
const monter = async (slug, { joueurs = 3, onQuitter = vi.fn() } = {}) => {
  const utilisateur = userEvent.setup({
    delay: null,
    advanceTimers: (ms) => vi.advanceTimersByTime(ms)
  });
  const { unmount } = render(
    <KitJeu game={jeu(slug)} joueurs={joueurs} onQuitter={onQuitter} onRetourAccueil={vi.fn()} />
  );
  return { utilisateur, onQuitter, unmount };
};

const clic = (u, motif) => u.click(screen.getByRole('button', { name: motif }));

/** Traverse l'écran de réglage pour arriver sur la première carte. */
const commencer = async (slug, options) => {
  const rendu = await monter(slug, options);
  await clic(rendu.utilisateur, /première carte/i);
  return rendu;
};

/**
 * Ce que la région live annonce.
 *
 * Il n'y en a qu'une à la fois, et c'est voulu : la carte tant que la réponse est
 * cachée, la réponse ensuite. Le Fitch garde sa carte, qui porte les deux textes.
 */
const carteAffichee = () => screen.getByRole('status').textContent;

describe('kit quiz d’animateur', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
  });
  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('demande l’effectif et rappelle la règle avant la première carte', async () => {
    await monter('le-souffleur');

    expect(screen.getByText(reglesDe('le-souffleur').rappel)).toBeInTheDocument();
    expect(screen.getByText(/combien êtes-vous/i)).toBeInTheDocument();
    // Aucune carte tirée tant qu'on n'a pas dit combien on est.
    expect(screen.queryByText(/réplique 1 sur/i)).toBeNull();
  });

  it('reprend l’effectif du filtre « Joueurs » de la liste', async () => {
    await monter('le-souffleur', { joueurs: 5 });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('ouvre sur la première carte, réponse cachée', async () => {
    await commencer('le-souffleur');

    expect(screen.getByText(/réplique 1 sur 156/i)).toBeInTheDocument();
    expect(carteAffichee().length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /révéler la réponse/i })
    ).toBeInTheDocument();
    // La réponse ne doit pas être là avant qu'on la demande : c'est toute la
    // mécanique de la famille.
    expect(screen.queryByRole('button', { name: /compter les points/i })).toBeNull();
  });

  it('ne montre les joueurs qu’une fois la réponse révélée', async () => {
    const { utilisateur: u } = await commencer('le-souffleur');
    expect(screen.queryByRole('button', { name: /joueur 1/i })).toBeNull();

    await clic(u, /révéler la réponse/i);
    expect(screen.getByText(reglesDe('le-souffleur').question)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /joueur 1/i })).toBeInTheDocument();
  });

  it('affiche la réponse de la carte tirée, et pas une autre', async () => {
    const { utilisateur: u } = await commencer('le-souffleur');
    const enonce = carteAffichee();
    const attendue = contenuDuJeu('le-souffleur').find((l) => l.contenu === enonce).reponse;

    await clic(u, /révéler la réponse/i);
    // La carte porte successivement les deux textes : une seule à l'écran, donc
    // le bouton principal reste atteignable même avec un résumé de mille signes.
    expect(carteAffichee()).toBe(attendue);
  });

  it('bascule de la réponse à l’énoncé, et revient', async () => {
    // On annonce la réponse, puis on relit l'énoncé pour montrer le piège.
    const { utilisateur: u } = await commencer('le-souffleur');
    const enonce = carteAffichee();

    await clic(u, /révéler la réponse/i);
    expect(carteAffichee()).not.toBe(enonce);

    await clic(u, /^l’énoncé$/i);
    expect(carteAffichee()).toBe(enonce);

    await clic(u, /^la réponse$/i);
    expect(carteAffichee()).not.toBe(enonce);
  });

  it('repart sur la réponse à la carte suivante', async () => {
    // Une carte reprise sur l'énoncé de la précédente perdrait le fil.
    const { utilisateur: u } = await commencer('le-souffleur');
    await clic(u, /révéler la réponse/i);
    await clic(u, /^l’énoncé$/i);
    await clic(u, /compter les points/i);
    await clic(u, /révéler la réponse/i);
    expect(screen.getByRole('button', { name: /^l’énoncé$/i })).toBeInTheDocument();
  });

  it('marque un point et enchaîne sur la carte suivante', async () => {
    const { utilisateur: u } = await commencer('le-souffleur');
    const premiere = carteAffichee();

    await clic(u, /révéler la réponse/i);
    await u.click(screen.getByRole('button', { name: /joueur 2 a trouvé/i }));
    await clic(u, /compter les points/i);

    expect(screen.getByText(/réplique 2 sur 156/i)).toBeInTheDocument();
    expect(carteAffichee()).not.toBe(premiere);
    // Le bandeau annonce qui mène.
    expect(screen.getByText(/joueur 2 · 1 point/i)).toBeInTheDocument();
  });

  it('n’oblige personne à marquer : une carte peut ne rien rapporter', async () => {
    const { utilisateur: u } = await commencer('le-souffleur');

    await clic(u, /révéler la réponse/i);
    expect(screen.getByText(/personne ne marque de point/i)).toBeInTheDocument();
    await clic(u, /compter les points/i);

    expect(screen.getByText(/réplique 2 sur 156/i)).toBeInTheDocument();
    expect(screen.getByText(/scores à zéro/i)).toBeInTheDocument();
  });

  it('défait la dernière carte, points rendus', async () => {
    const { utilisateur: u } = await commencer('le-souffleur');

    await clic(u, /révéler la réponse/i);
    await u.click(screen.getByRole('button', { name: /joueur 1 a trouvé/i }));
    await clic(u, /compter les points/i);
    expect(screen.getByText(/réplique 2 sur 156/i)).toBeInTheDocument();

    await clic(u, /annuler la dernière carte/i);
    // C'est le tour entier qu'on reprend : la carte revient, et la réponse avec.
    expect(screen.getByText(/réplique 1 sur 156/i)).toBeInTheDocument();
    expect(screen.getByText(/scores à zéro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compter les points/i })).toBeInTheDocument();
  });

  it('retire « Annuler » au bout de deux secondes et demie', async () => {
    // Même fenêtre que la feuille de match et l'écran de tour : c'est une règle
    // d'interaction du site, pas un réglage d'écran.
    const { utilisateur: u } = await commencer('le-souffleur');
    await clic(u, /révéler la réponse/i);
    await clic(u, /compter les points/i);

    expect(screen.getByRole('button', { name: /annuler la dernière carte/i })).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2600);
    });
    expect(screen.queryByRole('button', { name: /annuler la dernière carte/i })).toBeNull();
  });

  // Le libellé du bouton de tirage n'est écrit nulle part : il se déduit du
  // `type` de la ligne LancerJeu, comme chez le défileur.
  it.each([
    ['sorry-mon-french', /morceau 1 sur 85/i],
    ['lost-in-translation', /titre 1 sur 85/i],
    ['le-fitch', /résumé 1 sur 65/i],
    ['le-souffleur', /réplique 1 sur 156/i],
    ['soyez-logique', /énigme 1 sur 85/i]
  ])('accorde le compteur de « %s »', async (slug, motif) => {
    const { unmount } = await commencer(slug);
    expect(screen.getByText(motif)).toBeInTheDocument();
    unmount();
  });

  it('donne deux points à qui trouve le titre et l’artiste', async () => {
    // Sorry mon french : une tape pour le titre, deux pour les deux. Le second
    // point n'a pas de second contrôle, il tient dans la même cible.
    const { utilisateur: u } = await commencer('sorry-mon-french');
    await clic(u, /révéler la réponse/i);

    await u.click(screen.getByRole('button', { name: /joueur 1 a trouvé/i }));
    await u.click(screen.getByRole('button', { name: /joueur 1, 1 point/i }));
    expect(screen.getByRole('button', { name: /joueur 1, 2 points/i })).toBeInTheDocument();

    await clic(u, /compter les points/i);
    expect(screen.getByText(/joueur 1 · 2 points/i)).toBeInTheDocument();
  });

  it('revient à zéro à la tape d’après le maximum', async () => {
    const { utilisateur: u } = await commencer('sorry-mon-french');
    await clic(u, /révéler la réponse/i);

    await u.click(screen.getByRole('button', { name: /joueur 1 a trouvé/i }));
    await u.click(screen.getByRole('button', { name: /joueur 1, 1 point/i }));
    await u.click(screen.getByRole('button', { name: /joueur 1, 2 points/i }));
    expect(screen.getByRole('button', { name: /joueur 1 a trouvé/i })).toBeInTheDocument();
  });

  it('annonce le thème de Lost in translation avant le titre', async () => {
    // « film » ou « série » se lit dans le `type` de la ligne : rien n'est écrit
    // par slug, et les règles le font annoncer avant le titre québécois.
    await commencer('lost-in-translation');
    expect(screen.getByText(/^(Film|Série)$/)).toBeInTheDocument();
  });

  it('nomme la bascule avec les mots du Fitch', async () => {
    // Les libellés appartiennent au jeu : « Le résumé » et « Les cinq erreurs »
    // disent quelque chose que « L'énoncé » et « La réponse » ne disent pas.
    const { utilisateur: u } = await commencer('le-fitch');
    const resume = carteAffichee();

    await clic(u, /révéler la réponse/i);
    const correction = carteAffichee();
    expect(correction).not.toBe(resume);
    expect(screen.queryByRole('button', { name: /^l’énoncé$/i })).toBeNull();

    await clic(u, /le résumé/i);
    expect(carteAffichee()).toBe(resume);

    await clic(u, /les cinq erreurs/i);
    expect(carteAffichee()).toBe(correction);
  });

  it('compte le solde du Fitch au compteur, pas à la tape', async () => {
    // Cinq erreurs moins les fausses alertes : c'est une saisie de nombre, et le
    // solde peut descendre sous zéro.
    const { utilisateur: u } = await commencer('le-fitch');
    await clic(u, /révéler la réponse/i);

    const plus = screen.getByRole('button', { name: /augmenter : points de joueur 1/i });
    await u.click(plus);
    await u.click(plus);
    await u.click(plus);
    await clic(u, /compter les points/i);

    expect(screen.getByText(/joueur 1 · 3 points/i)).toBeInTheDocument();
    // Aucune ligne à taper : la désignation n'a pas de sens ici.
    expect(screen.queryByRole('button', { name: /joueur 1 a trouvé/i })).toBeNull();
  });

  it('n’affiche un chrono que pour le jeu qui en déclare un', async () => {
    const { unmount } = await commencer('le-souffleur');
    expect(screen.queryByRole('timer')).toBeNull();
    unmount();

    await commencer('soyez-logique');
    expect(screen.getByRole('timer')).toHaveTextContent('60');
  });

  it('retire le chrono une fois la réponse révélée', async () => {
    // La minute sert à chercher. Passé la révélation, elle n'a plus d'objet et
    // ne fait que voler la place des joueurs à désigner.
    const { utilisateur: u } = await commencer('soyez-logique');
    await clic(u, /révéler la réponse/i);
    expect(screen.queryByRole('timer')).toBeNull();
  });

  it('compte les cinq questions du juste chiffre, et propose de conclure', async () => {
    const { utilisateur: u } = await commencer('le-juste-chiffre');

    // Une seule échelle : la partie annonce cinq questions, pas cent vingt cartes.
    expect(screen.getByText(/tour 1 sur 5/i)).toBeInTheDocument();
    expect(screen.queryByText(/question 1 sur 120/i)).toBeNull();

    for (let i = 0; i < 5; i += 1) {
      await clic(u, /révéler la réponse/i);
      await u.click(screen.getByRole('button', { name: /joueur 1 a trouvé/i }));
      await clic(u, /compter les points/i);
    }

    expect(screen.getByText(/tour de table complet/i)).toBeInTheDocument();
    await clic(u, /les 5 questions sont passées/i);
    expect(screen.getByText(/joueur 1 l’emporte/i)).toBeInTheDocument();
    expect(screen.getByText(/5 points/i)).toBeInTheDocument();
  });

  it('garde la partie entre deux visites, et propose de la reprendre', async () => {
    const { utilisateur: u, unmount } = await commencer('le-souffleur');
    await clic(u, /révéler la réponse/i);
    await u.click(screen.getByRole('button', { name: /joueur 3 a trouvé/i }));
    await clic(u, /compter les points/i);
    unmount();

    const { utilisateur: u2 } = await monter('le-souffleur');
    expect(screen.getByText(/une partie est en cours/i)).toBeInTheDocument();
    await clic(u2, /reprendre la partie/i);
    expect(screen.getByText(/joueur 3 · 1 point/i)).toBeInTheDocument();
    // La reprise repart sur l'énoncé : la correction d'il y a une heure ne doit
    // pas s'afficher avant la question.
    expect(screen.getByRole('button', { name: /révéler la réponse/i })).toBeInTheDocument();
  });

  it('permet de repartir de zéro plutôt que de reprendre', async () => {
    const { utilisateur: u, unmount } = await commencer('le-souffleur');
    await clic(u, /révéler la réponse/i);
    await u.click(screen.getByRole('button', { name: /joueur 1 a trouvé/i }));
    await clic(u, /compter les points/i);
    unmount();

    const { utilisateur: u2 } = await monter('le-souffleur');
    await clic(u2, /nouvelle partie/i);
    expect(screen.getByText(/combien êtes-vous/i)).toBeInTheDocument();
  });

  it('corrige un score depuis le menu de la partie', async () => {
    const { utilisateur: u } = await commencer('le-souffleur');
    await clic(u, /autres actions/i);
    const menu = screen.getByRole('dialog');
    await u.click(within(menu).getByRole('button', { name: /corriger les scores/i }));

    const scores = screen.getByRole('dialog');
    await u.click(within(scores).getByRole('button', { name: /ajouter un point à joueur 2/i }));
    await u.click(within(scores).getByRole('button', { name: /fermer/i }));
    expect(screen.getByText(/joueur 2 · 1 point/i)).toBeInTheDocument();
  });

  it('quitte vers l’écran d’où l’on vient', async () => {
    const { utilisateur: u, onQuitter } = await commencer('le-souffleur');
    await clic(u, /autres actions/i);
    const menu = screen.getByRole('dialog');
    await u.click(within(menu).getByRole('button', { name: /retour à la fiche/i }));
    expect(onQuitter).toHaveBeenCalled();
  });
});
