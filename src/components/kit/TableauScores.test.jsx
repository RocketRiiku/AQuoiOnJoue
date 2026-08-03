import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableauScores from './TableauScores';

/**
 * La brique est censée être commune : ce fichier le vérifie en la montant sans
 * aucun import de jeu. Elle tirait ses colonnes de `troisFoisRien.js`, ce qui
 * la clouait à un jeu tout en la présentant comme partagée — un test qui
 * n'importe que le composant est ce qui empêche le couplage de revenir.
 */
describe('TableauScores', () => {
  const AVEC_MANCHES = [
    { nom: 'Équipe 1', cases: [2, 0, 0], total: 2, retraitPossible: true },
    { nom: 'Équipe 2', cases: [0, 0, 0], total: 0, retraitPossible: false }
  ];
  const COLONNES = [
    { cle: 'a', libelle: 'M1', libelleLong: 'Manche 1 : On parle' },
    { cle: 'b', libelle: 'M2', libelleLong: 'Manche 2 : Un seul mot' },
    { cle: 'c', libelle: 'M3', libelleLong: 'Manche 3 : Mime' }
  ];

  it('affiche une colonne par manche, plus le total', () => {
    render(<TableauScores lignes={AVEC_MANCHES} colonnes={COLONNES} colonneActive={0} />);

    expect(screen.getByRole('columnheader', { name: /Manche 1 : On parle/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Total' })).toBeInTheDocument();
    // Deux équipes, quatre colonnes de chiffres chacune : trois manches + total.
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('se réduit à un classement quand aucune colonne n’est passée', () => {
    // La forme qu'attendent les jeux sans manche : un nom, un total.
    render(
      <TableauScores
        lignes={[
          { nom: 'Joueur 1', total: 5, enTete: true },
          { nom: 'Joueur 2', total: 3 }
        ]}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Joueur' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Manche/ })).not.toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Joueur 1, en tête/ })).toBeInTheDocument();
  });

  it('annonce un joueur sorti sans le retirer du tableau', () => {
    // Chez Qui rit sort, l'éliminé rejoint le public et continue à saboter :
    // le faire disparaître de l'écran le rendrait invisible à la table.
    render(<TableauScores lignes={[{ nom: 'Joueur 3', total: 2, sortie: true }]} />);

    expect(screen.getByRole('rowheader', { name: /Joueur 3, éliminé/ })).toBeInTheDocument();
  });

  it('ne montre les commandes de correction que si on peut corriger', () => {
    const { rerender } = render(<TableauScores lignes={AVEC_MANCHES} colonnes={COLONNES} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <TableauScores
        lignes={AVEC_MANCHES}
        colonnes={COLONNES}
        onAjuster={() => {}}
        onReinitialiser={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Ajouter un point à Équipe 1' })).toBeEnabled();
  });

  it('corrige la ligne désignée, et rien d’autre', async () => {
    const onAjuster = vi.fn();
    const onReinitialiser = vi.fn();
    render(
      <TableauScores
        lignes={AVEC_MANCHES}
        colonnes={COLONNES}
        onAjuster={onAjuster}
        onReinitialiser={onReinitialiser}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un point à Équipe 2' }));
    expect(onAjuster).toHaveBeenCalledWith(1, 1);

    await userEvent.click(screen.getByRole('button', { name: 'Retirer un point à Équipe 1' }));
    expect(onAjuster).toHaveBeenCalledWith(0, -1);

    await userEvent.click(screen.getByRole('button', { name: 'Remettre Équipe 1 à zéro' }));
    expect(onReinitialiser).toHaveBeenCalledWith(0);
  });

  it('interdit de retirer un point là où il n’y en a pas', () => {
    render(
      <TableauScores
        lignes={AVEC_MANCHES}
        colonnes={COLONNES}
        onAjuster={() => {}}
        onReinitialiser={() => {}}
      />
    );

    // Équipe 2 est à zéro sur la manche en cours *et* au total : ni retrait ni
    // remise à zéro n'ont de sens.
    expect(screen.getByRole('button', { name: 'Retirer un point à Équipe 2' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remettre Équipe 2 à zéro' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remettre Équipe 1 à zéro' })).toBeEnabled();
  });
});
