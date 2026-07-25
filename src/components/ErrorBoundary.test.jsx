import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Explose() {
  throw new Error('champ manquant dans le catalogue');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React journalise l'erreur rattrapée : on garde la sortie de test lisible.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('laisse passer le contenu quand tout va bien', () => {
    render(
      <ErrorBoundary>
        <p>La liste des jeux</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('La liste des jeux')).toBeInTheDocument();
  });

  it('affiche un écran de repli au lieu de planter', () => {
    render(
      <ErrorBoundary>
        <Explose />
      </ErrorBoundary>
    );
    expect(screen.getByRole('heading')).toHaveTextContent(/la partie s'est arrêtée/i);
    expect(screen.getByRole('button', { name: /revenir à la liste/i })).toBeInTheDocument();
  });

  it('expose le détail technique pour le débogage', () => {
    render(
      <ErrorBoundary>
        <Explose />
      </ErrorBoundary>
    );
    expect(screen.getByText(/champ manquant dans le catalogue/)).toBeInTheDocument();
  });
});
