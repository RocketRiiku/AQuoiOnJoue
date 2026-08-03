import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KitJeu from './KitJeu';
import { gamesList } from '../../data/games';
import { contenuDuJeu } from '../../data/lancerJeu';
import { rappelDe } from '../../utils/defileur';

const jeu = (slug) => gamesList.find((g) => g.slug === slug);

/**
 * Le câblage du défileur, du rappel de règle à la pile vide.
 *
 * Le parcours dans la pile est couvert à part (defileur.test.js) : ce qui se
 * joue ici, c'est ce que le réducteur ne voit pas — le libellé déduit du type
 * de contenu, le chrono qui n'apparaît que pour les jeux qui en déclarent un,
 * et le fait qu'on aille au bout des cinquante cartes sans se coincer.
 */
const monter = async (slug, { rappel = false, onQuitter = vi.fn() } = {}) => {
  const utilisateur = userEvent.setup({
    delay: null,
    advanceTimers: (ms) => vi.advanceTimersByTime(ms)
  });
  const { unmount } = render(
    <KitJeu game={jeu(slug)} joueurs={6} onQuitter={onQuitter} />
  );
  // Les six jeux ont un rappel : sauf mention contraire, on le traverse pour
  // arriver là où le test veut vraiment être.
  if (!rappel) await utilisateur.click(screen.getByRole('button', { name: /c’est parti/i }));
  return { utilisateur, onQuitter, unmount };
};

const clic = (u, motif) => u.click(screen.getByRole('button', { name: motif }));

const carte = () => screen.getByRole('status').textContent;

describe('kit défileur', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] }));
  afterEach(() => vi.useRealTimers());

  it('rappelle la règle élémentaire avant la première carte', async () => {
    const { utilisateur: u } = await monter('oui-ou-non', { rappel: true });

    expect(screen.getByText(/avant de commencer/i)).toBeInTheDocument();
    expect(screen.getByText(rappelDe('oui-ou-non'))).toBeInTheDocument();
    // Une seule tape, et aucun réglage : ce n'est pas un formulaire.
    expect(screen.queryByText(/proposition 1 sur/i)).toBeNull();

    await clic(u, /c’est parti/i);
    expect(screen.getByText(/proposition 1 sur 50/i)).toBeInTheDocument();
  });

  it('quitte depuis le rappel sans avoir rien tiré', async () => {
    const { utilisateur: u, onQuitter } = await monter('sang-bleu', { rappel: true });
    await clic(u, /retour à la fiche/i);
    expect(onQuitter).toHaveBeenCalled();
  });

  it('tire la première carte sitôt le rappel passé', async () => {
    await monter('oui-ou-non');
    expect(screen.getByText(/proposition 1 sur 50/i)).toBeInTheDocument();
    expect(carte().length).toBeGreaterThan(0);
  });

  // Le libellé du bouton n'est écrit nulle part : il se déduit du `type` de la
  // ligne LancerJeu. Six jeux, six pioches, un seul composant.
  it.each([
    ['le-joker', /question suivante/i],
    ['oui-ou-non', /proposition suivante/i],
    ['tu-preferes', /dilemme suivant/i],
    ['du-coq-a-l-ane', /phrase suivante/i],
    ['qui-de-nous', /question suivante/i],
    ['sang-bleu', /sujet suivant/i]
  ])('accorde le libellé de « %s »', async (slug, motif) => {
    const { unmount } = await monter(slug);
    expect(screen.getByRole('button', { name: motif })).toBeInTheDocument();
    unmount();
  });

  it('change de carte à chaque tirage, et sait revenir en arrière', async () => {
    const { utilisateur: u } = await monter('qui-de-nous');
    const premiere = carte();

    await clic(u, /question suivante/i);
    const deuxieme = carte();
    expect(deuxieme).not.toBe(premiere);
    expect(screen.getByText(/question 2 sur 55/i)).toBeInTheDocument();

    // Une carte tournée par erreur emporte sinon une question que personne
    // n'a entendue.
    await clic(u, /question précédente/i);
    expect(carte()).toBe(premiere);
  });

  it('interdit le retour sur la première carte', async () => {
    await monter('oui-ou-non');
    expect(
      screen.getByRole('button', { name: /proposition précédente/i })
    ).toBeDisabled();
  });

  it('n’affiche un chrono que pour les jeux qui en déclarent un', async () => {
    const { unmount } = await monter('qui-de-nous');
    expect(screen.queryByRole('timer')).toBeNull();
    unmount();

    await monter('tu-preferes');
    expect(screen.getByRole('timer')).toHaveTextContent('60');
  });

  it('lit les cinq minutes de Sang bleu en minutes, pas en secondes', async () => {
    // « 300 s » n'est convertible de tête par personne autour d'une table.
    await monter('sang-bleu');
    expect(screen.getByRole('timer')).toHaveTextContent('5:00');
  });

  it('arrête le chrono, et le remonte à neuf à la carte suivante', async () => {
    const { utilisateur: u } = await monter('tu-preferes');

    await clic(u, /chrono/i);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(screen.getByRole('timer')).not.toHaveTextContent('60');

    // La minute vaut pour le dilemme affiché, pas pour la soirée.
    await clic(u, /dilemme suivant/i);
    expect(screen.getByRole('timer')).toHaveTextContent('60');
    expect(screen.getByRole('button', { name: /^chrono$/i })).toBeInTheDocument();
  });

  it('annonce la pile vide au bout, et la remélange', async () => {
    const { utilisateur: u } = await monter('sang-bleu');
    const total = contenuDuJeu('sang-bleu').length;

    for (let i = 0; i < total; i += 1) {
      await clic(u, /sujet suivant/i);
    }

    expect(screen.getByText(/la pile est vide/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`tour des ${total} sujets`, 'i'))).toBeInTheDocument();

    await clic(u, /remélanger/i);
    expect(screen.getByText(/sujet 1 sur 25/i)).toBeInTheDocument();
  });

  it('quitte vers l’écran d’où l’on vient', async () => {
    const { utilisateur: u, onQuitter } = await monter('le-joker');
    await clic(u, /retour à la fiche/i);
    expect(onQuitter).toHaveBeenCalled();
  });
});
