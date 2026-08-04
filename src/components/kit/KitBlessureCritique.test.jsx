import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KitJeu from './KitJeu';
import { gamesList } from '../../data/games';
import { contenuDuJeu } from '../../data/lancerJeu';

const jeu = gamesList.find((g) => g.slug === 'la-blessure-critique');
const EFFETS = contenuDuJeu(jeu.slug).map((ligne) => ligne.contenu);

/**
 * Le câblage du jet de dé.
 *
 * Le tirage lui-même est couvert à part (blessureCritique.test.js) : ce qui se
 * joue ici, c'est le roulement — que le résultat arrive bien au bout, qu'une
 * double pression ne lance pas deux jets, et que le réglage « réduire les
 * animations » saute l'attente au lieu de la raccourcir.
 */
const monter = ({ onQuitter = vi.fn() } = {}) => {
  const utilisateur = userEvent.setup({
    delay: null,
    advanceTimers: (ms) => vi.advanceTimersByTime(ms)
  });
  render(<KitJeu game={jeu} joueurs={6} onQuitter={onQuitter} />);
  return { utilisateur, onQuitter };
};

const clic = (u, motif) => u.click(screen.getByRole('button', { name: motif }));

/**
 * Ouvre le menu de l'en-tête et y clique une entrée.
 *
 * La sortie et l'effacement des jets ont quitté la barre du bas : ils servent
 * une fois par soirée, là où le lancer se répète (cf. `MenuPartie`).
 */
const parLeMenu = async (u, motif) => {
  await clic(u, /autres actions/i);
  const menu = screen.getByRole('dialog');
  await u.click(within(menu).getByRole('button', { name: motif }));
};

const attendre = (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

/** Impose la face du dé : le hasard n'a rien à prouver ici. */
const truquer = (face) =>
  vi.spyOn(Math, 'random').mockReturnValue((face - 1) / 20 + 0.001);

describe('kit de La blessure critique', () => {
  // On ne simule que ce dont le jeu a besoin : prendre aussi `setTimeout` fige
  // l'ordonnanceur de React, et plus rien ne se rend.
  beforeEach(() =>
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
  );
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('attend un jet avant de montrer quoi que ce soit', () => {
    monter();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lancer le dé/i })).toBeInTheDocument();
  });

  it('affiche la face tirée et l’effet qui lui correspond', async () => {
    truquer(7);
    const { utilisateur: u } = monter();

    await clic(u, /lancer le dé/i);
    await attendre(900);

    expect(screen.getByRole('status')).toHaveTextContent('7');
    expect(screen.getByText(EFFETS[6])).toBeInTheDocument();
  });

  it('rend la même face deux fois de suite — le dé a de la mémoire, pas la pile', async () => {
    truquer(13);
    const { utilisateur: u } = monter();

    await clic(u, /lancer le dé/i);
    await attendre(900);
    await clic(u, /relancer le dé/i);
    await attendre(900);

    // C'est ce qui interdit de faire passer ce jeu par le défileur.
    expect(screen.getAllByText(EFFETS[12]).length).toBeGreaterThan(0);
    expect(screen.getByText(/jets précédents \(1\)/i)).toBeInTheDocument();
  });

  it('verrouille le dé pendant le roulement', async () => {
    truquer(4);
    const { utilisateur: u } = monter();

    await clic(u, /lancer le dé/i);
    expect(screen.getByRole('button', { name: /lancer le dé/i })).toBeDisabled();

    await attendre(900);
    expect(screen.getByRole('button', { name: /relancer le dé/i })).not.toBeDisabled();
  });

  it('garde les jets précédents, et les efface sur demande', async () => {
    const { utilisateur: u } = monter();
    truquer(2);
    await clic(u, /lancer le dé/i);
    await attendre(900);
    truquer(9);
    await clic(u, /relancer le dé/i);
    await attendre(900);

    await clic(u, /jets précédents/i);
    expect(screen.getByText(EFFETS[1])).toBeInTheDocument();

    await parLeMenu(u, /effacer les jets/i);
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.queryByText(/jets précédents/i)).toBeNull();
  });

  it('donne le résultat sans attendre quand les animations sont réduites', async () => {
    const matchMediaInitial = window.matchMedia;
    window.matchMedia = (requete) => ({ ...matchMediaInitial(requete), matches: true });
    truquer(20);

    try {
      const { utilisateur: u } = monter();
      await clic(u, /lancer le dé/i);
      // Aucune minuterie avancée : le résultat doit déjà être là.
      expect(screen.getByRole('status')).toHaveTextContent('20');
      expect(screen.getByText(EFFETS[19])).toBeInTheDocument();
    } finally {
      window.matchMedia = matchMediaInitial;
    }
  });

  it('quitte vers l’écran d’où l’on vient', async () => {
    const { utilisateur: u, onQuitter } = monter();
    await parLeMenu(u, /retour à la fiche/i);
    expect(onQuitter).toHaveBeenCalled();
  });
});
