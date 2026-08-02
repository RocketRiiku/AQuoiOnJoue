import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KitJeu from './KitJeu';
import { gamesList } from '../../data/games';
import { MANCHES } from '../../utils/troisFoisRien';

const jeu = gamesList.find((g) => g.slug === 'trois-fois-rien');

/**
 * Parcours du kit, du réglage à la dernière manche.
 *
 * Le réducteur est couvert à part (troisFoisRien.test.js) : ce qui se joue ici,
 * c'est le câblage — le décompte d'entrée, le chrono qui rend la main tout
 * seul, la pause qui l'arrête, et le fait qu'on puisse aller au bout sans se
 * coincer.
 */
const monter = ({ joueurs = 4, onQuitter = vi.fn() } = {}) => {
  // `delay: null` : sans lui, chaque clic attend une vraie minuterie, que les
  // minuteries simulées n'avancent jamais.
  const utilisateur = userEvent.setup({
    delay: null,
    advanceTimers: (ms) => vi.advanceTimersByTime(ms)
  });
  render(<KitJeu game={jeu} joueurs={joueurs} onQuitter={onQuitter} />);
  return { utilisateur, onQuitter };
};

const clic = (u, motif) => u.click(screen.getByRole('button', { name: motif }));

/** Avance les minuteries hors du geste de l'utilisateur. */
const attendre = (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

/** Lance un tour et traverse le décompte d'entrée. */
const lancerTour = async (u) => {
  await clic(u, /c’est parti/i);
  await attendre(3200);
};

const motAffiche = () => screen.getByRole('status').textContent;

describe('kit de Trois fois rien', () => {
  // On ne simule que ce dont le jeu a besoin : tout simuler fige aussi
  // l'ordonnanceur de React, et plus rien ne se rend.
  beforeEach(() =>
    vi.useFakeTimers({
      toFake: ['setInterval', 'clearInterval', 'Date']
    })
  );
  afterEach(() => vi.useRealTimers());

  it('règle la partie avant de la commencer', async () => {
    const { utilisateur: u } = monter({ joueurs: 6 });

    // L'effectif du filtre est repris tel quel : on ne le redemande pas.
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText(/30 mots dans le pot/i)).toBeInTheDocument();

    await clic(u, /plus de joueurs/i);
    expect(screen.getByText(/35 mots dans le pot/i)).toBeInTheDocument();

    await clic(u, '3 équipes');
    await clic(u, /remplir le pot/i);

    expect(screen.getByText(/manche 1 sur 3/i)).toBeInTheDocument();
    expect(screen.getByText('Équipe 1')).toBeInTheDocument();
  });

  it('ne descend pas sous le minimum du jeu', async () => {
    const { utilisateur: u } = monter({ joueurs: jeu.minPlayers });
    expect(screen.getByRole('button', { name: /moins de joueurs/i })).toBeDisabled();
    await clic(u, /plus de joueurs/i);
    expect(screen.getByRole('button', { name: /moins de joueurs/i })).toBeEnabled();
  });

  it('décompte avant de lâcher le chrono', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await clic(u, /c’est parti/i);

    // Le chrono ne bouge pas tant que le décompte tourne : sans cela, les
    // premières secondes s'écoulent pendant qu'on lève encore le téléphone.
    expect(screen.getByText('Prêts ?')).toBeInTheDocument();
    await attendre(1500);
    expect(screen.getByRole('timer')).toHaveTextContent(String(jeu.chronoTour));

    await attendre(2000);
    expect(screen.queryByText('Prêts ?')).not.toBeInTheDocument();
    await attendre(2000);
    expect(screen.getByRole('timer')).not.toHaveTextContent(String(jeu.chronoTour));
  });

  it('compte les mots trouvés et rend la main quand le temps tombe', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    await clic(u, /trouvé/i);
    await clic(u, /trouvé/i);
    expect(screen.getByText(/encore 18 mots dans le pot/i)).toBeInTheDocument();

    // Le chrono mène le tour : personne n'a à cliquer pour l'arrêter.
    await attendre(jeu.chronoTour * 1000 + 500);
    expect(screen.getByText(/temps écoulé/i)).toBeInTheDocument();
    expect(screen.getByText(/Équipe 1 : 2 mots sur ce tour/i)).toBeInTheDocument();

    await clic(u, /Équipe 2, à vous/i);
    expect(screen.getByText('Équipe 2')).toBeInTheDocument();
  });

  it('montre le score du tour monter pendant le jeu', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    // « 0 trouvé » au singulier, « 2 trouvés » au pluriel : le libellé bouge.
    const compteur = () =>
      screen.getByText(/^trouvés?$/).previousElementSibling.textContent;
    expect(compteur()).toBe('0');

    await clic(u, /trouvé/i);
    await clic(u, /trouvé/i);
    expect(compteur()).toBe('2');
  });

  it('annule le dernier geste, pendant deux secondes et demie', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    const premier = motAffiche();
    // Rien à annuler avant d'avoir joué.
    expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument();

    await clic(u, /trouvé/i);
    await clic(u, /annuler/i);

    // Le mot revient en tête et le point est repris.
    expect(motAffiche()).toBe(premier);
    expect(screen.getByText(/encore 20 mots dans le pot/i)).toBeInTheDocument();

    await clic(u, /trouvé/i);
    await attendre(3000);
    // Passé la fenêtre, l'offre disparaît : on ne défait pas un tour entier.
    expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument();
  });

  it('rappelle la consigne de la manche pendant le tour', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    // « ON PARLE » seul est elliptique pour qui découvre le jeu.
    expect(screen.getByText(MANCHES[0].consigne)).toBeInTheDocument();
  });

  it('met le jeu en pause sans perdre le temps restant', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    await attendre(5000);
    const avant = screen.getByRole('timer').textContent;

    await clic(u, /mettre le jeu en pause/i);
    await attendre(8000);
    // Le chrono est gelé : huit secondes de discussion ne coûtent rien.
    expect(screen.getByRole('timer')).toHaveTextContent(avant);

    await clic(u, /reprendre/i);
    await attendre(2000);
    expect(screen.getByRole('timer')).not.toHaveTextContent(avant);
  });

  it('corrige un point de trop, et remet une équipe à zéro', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    await clic(u, /trouvé/i);
    await clic(u, /trouvé/i);
    await attendre(jeu.chronoTour * 1000 + 500);

    const ligne = screen.getByRole('row', { name: /Équipe 1/i });
    expect(within(ligne).getByRole('rowheader')).toBeInTheDocument();

    // Le pouce a glissé : on retire le point sans quitter la partie.
    await clic(u, /retirer un point à Équipe 1/i);
    expect(screen.getByText(/Équipe 1 : 1 mot sur ce tour/i)).toBeInTheDocument();

    await clic(u, /ajouter un point à Équipe 1/i);
    expect(screen.getByText(/Équipe 1 : 2 mots sur ce tour/i)).toBeInTheDocument();

    await clic(u, /remettre Équipe 1 à zéro/i);
    expect(screen.getByRole('button', { name: /remettre Équipe 1 à zéro/i })).toBeDisabled();
  });

  it('recommence la partie depuis la pause', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);
    await clic(u, /trouvé/i);

    await clic(u, /mettre le jeu en pause/i);
    await clic(u, /recommencer la partie/i);

    // Pot neuf, scores à zéro, et on repart de l'écran d'annonce.
    expect(screen.getByText(/20 mots dans le pot/i)).toBeInTheDocument();
    expect(screen.getByText(/manche 1 sur 3/i)).toBeInTheDocument();
  });

  it('rejoue les mêmes mots à la manche suivante', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);

    const mots = [];
    // 4 joueurs × 5 mots = 20 : on vide le pot en trouvant tout.
    for (let i = 0; i < 20; i += 1) {
      mots.push(motAffiche());
      await clic(u, /trouvé/i);
    }

    expect(screen.getByText(/le pot est vide/i)).toBeInTheDocument();
    await clic(u, new RegExp(`manche 2 — ${MANCHES[1].titre}`, 'i'));

    expect(screen.getByText(/manche 2 sur 3/i)).toBeInTheDocument();
    expect(screen.getByText(MANCHES[1].consigne)).toBeInTheDocument();
    await lancerTour(u);

    // Les mêmes vingt mots reviennent, dans un autre ordre.
    expect(mots).toContain(motAffiche());
  });

  it('désigne le vainqueur au bout des trois manches', async () => {
    const { utilisateur: u, onQuitter } = monter();
    await clic(u, /remplir le pot/i);

    for (let manche = 0; manche < MANCHES.length; manche += 1) {
      await lancerTour(u);
      for (let i = 0; i < 20; i += 1) await clic(u, /trouvé/i);
      await clic(u, manche === MANCHES.length - 1 ? /voir le résultat/i : /^manche/i);
    }

    // Les manches alternent l'équipe qui ouvre : Équipe 1 en joue deux sur
    // trois, et rafle 40 des 60 mots.
    expect(screen.getByText(/Équipe 1 l’emporte/i)).toBeInTheDocument();
    expect(screen.getByText(/40 mots devinés/i)).toBeInTheDocument();

    await clic(u, /retour à la fiche/i);
    expect(onQuitter).toHaveBeenCalled();
  });

  it('ne propose pas de passer le dernier mot', async () => {
    const { utilisateur: u } = monter();
    await clic(u, /remplir le pot/i);
    await lancerTour(u);
    for (let i = 0; i < 19; i += 1) await clic(u, /trouvé/i);

    // Passer ferait tourner le pot sur lui-même sans que rien ne bouge.
    expect(screen.getByRole('button', { name: /passer/i })).toBeDisabled();
  });
});
