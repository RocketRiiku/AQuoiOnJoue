import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareButton from './ShareButton';

const LIEN = 'https://exemple.fr/?jeu=undercover';

describe('ShareButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete navigator.share;
    delete navigator.canShare;
    vi.restoreAllMocks();
  });

  it('utilise le partage natif quand il est disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    navigator.share = share;

    render(<ShareButton url={LIEN} titre="Undercover" texte="On joue ?" />);
    await userEvent.click(screen.getByRole('button'));

    expect(share).toHaveBeenCalledWith({
      title: 'Undercover',
      text: 'On joue ?',
      url: LIEN
    });
  });

  it('retombe sur le presse-papier sans partage natif', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton url={LIEN} />);
    await userEvent.click(screen.getByRole('button'));

    expect(writeText).toHaveBeenCalledWith(LIEN);
    expect(await screen.findByText('Message copié !')).toBeInTheDocument();
  });

  it('copie le message entier, et non la seule adresse', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton url={LIEN} texte="On joue à Undercover ?" />);
    await userEvent.click(screen.getByRole('button'));

    // Un lien nu collé dans une conversation n'annonce pas ce qu'il y a au bout.
    expect(writeText).toHaveBeenCalledWith(`On joue à Undercover ?\n${LIEN}`);
  });

  it('retombe sur la copie quand le navigateur refuse ces données', async () => {
    navigator.share = vi.fn();
    navigator.canShare = vi.fn().mockReturnValue(false);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton url={LIEN} texte="On joue ?" />);
    await userEvent.click(screen.getByRole('button'));

    // Sans ce garde-fou, l'appel échouait et le partage était perdu.
    expect(navigator.share).not.toHaveBeenCalled();
    expect(writeText).toHaveBeenCalled();
  });

  it('ne signale rien si l’utilisateur annule le partage natif', async () => {
    const abort = Object.assign(new Error('annulé'), { name: 'AbortError' });
    navigator.share = vi.fn().mockRejectedValue(abort);
    const writeText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton url={LIEN} libelle="Partager" />);
    await userEvent.click(screen.getByRole('button'));

    // Ni copie de repli, ni message d'erreur : l'annulation est volontaire.
    expect(writeText).not.toHaveBeenCalled();
    // Le bouton est réduit à une icône : son libellé est le nom accessible.
    expect(screen.getByRole('button')).toHaveAccessibleName('Partager');
  });

  it('avertit quand même la copie échoue', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('refusé')) }
    });

    render(<ShareButton url={LIEN} />);
    await userEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('Copie impossible')).toBeInTheDocument();
  });
});
