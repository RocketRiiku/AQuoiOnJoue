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
    expect(await screen.findByText('Lien copié !')).toBeInTheDocument();
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
    expect(screen.getByRole('button')).toHaveTextContent('Partager');
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
