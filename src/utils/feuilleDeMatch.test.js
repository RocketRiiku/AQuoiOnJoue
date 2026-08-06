import { describe, expect, it } from 'vitest';
import {
  enJeu,
  etatInitial,
  nomsJoueurs,
  reducteur,
  reglesDe,
  reprendre,
  tousPasses,
  vainqueurs
} from './feuilleDeMatch';

/**
 * La mécanique se teste sans monter une ligne de DOM : c'est ce qui rend
 * vérifiables les règles délicates — le seuil qui élimine, le survivant qui
 * clôt la partie, le barème du conteur qui se déduit du nombre de trouveurs.
 */
const partie = (nombre, options = {}) =>
  etatInitial({ joueurs: nomsJoueurs(nombre), ...options });

const marquer = (etat, gains, reste = {}) =>
  reducteur(etat, { type: 'marquer', gains, ...reste });

describe('feuille de match — les gains', () => {
  it('distribue des gains à plusieurs joueurs d’un seul geste', () => {
    const etat = marquer(partie(4), [
      { joueur: 0, points: 3 },
      { joueur: 2, points: 1 }
    ]);
    expect(etat.scores).toEqual([3, 0, 1, 0]);
  });

  it('ne descend jamais un score sous zéro', () => {
    const etat = marquer(partie(3), [{ joueur: 1, points: -5 }]);
    expect(etat.scores).toEqual([0, 0, 0]);
  });

  it('cumule les gains d’un même joueur dans un seul geste', () => {
    // Le barème de Tudum donne un point au trouveur, et le proposeur peut être
    // désigné deux fois si un jeu s'y prête : la somme doit tenir.
    const etat = marquer(partie(3), [
      { joueur: 0, points: 1 },
      { joueur: 0, points: 2 }
    ]);
    expect(etat.scores[0]).toBe(3);
  });

  it('marque qui vient de passer, et fait tourner le joueur courant', () => {
    const etat = marquer(partie(3, { forme: 'parTour' }), [], {
      passes: [0],
      avancer: true
    });
    expect(etat.passes).toEqual([true, false, false]);
    expect(etat.courant).toBe(1);
  });

  it('signale quand tout le monde est passé', () => {
    let etat = partie(3, { forme: 'parTour' });
    expect(tousPasses(etat)).toBe(false);
    for (const joueur of [0, 1, 2]) {
      etat = marquer(etat, [], { passes: [joueur], avancer: true });
    }
    expect(tousPasses(etat)).toBe(true);
  });
});

describe('feuille de match — l’annulation', () => {
  it('défait le dernier geste en entier, joueurs multiples compris', () => {
    const depart = partie(4, { forme: 'parTour' });
    const apres = marquer(depart, [
      { joueur: 0, points: 2 },
      { joueur: 1, points: 1 }
    ], { passes: [0], avancer: true });

    const defait = reducteur(apres, { type: 'annuler' });
    expect(defait.scores).toEqual(depart.scores);
    expect(defait.passes).toEqual(depart.passes);
    expect(defait.courant).toBe(depart.courant);
  });

  it('ne remonte jamais plus d’un geste', () => {
    let etat = marquer(partie(3), [{ joueur: 0, points: 1 }]);
    etat = marquer(etat, [{ joueur: 0, points: 1 }]);
    etat = reducteur(etat, { type: 'annuler' });
    expect(etat.scores[0]).toBe(1);

    // Le second appel ne trouve plus rien à défaire.
    expect(reducteur(etat, { type: 'annuler' }).scores[0]).toBe(1);
  });

  it('fait rentrer un joueur éliminé par erreur', () => {
    const etat = marquer(partie(3, { seuil: 2 }), [{ joueur: 1, points: 2 }]);
    expect(etat.sortis[1]).toBe(true);

    expect(reducteur(etat, { type: 'annuler' }).sortis[1]).toBe(false);
  });

  it('oublie le geste en attente quand la partie est reprise', () => {
    const etat = marquer(partie(3), [{ joueur: 0, points: 1 }]);
    expect(reprendre(etat).dernier).toBeNull();
    // Le score, lui, ne bouge pas.
    expect(reprendre(etat).scores[0]).toBe(1);
  });
});

describe('feuille de match — le seuil', () => {
  it('élimine au seuil, et pas avant', () => {
    let etat = partie(4, { seuil: 2 });
    etat = marquer(etat, [{ joueur: 0, points: 1 }]);
    expect(etat.sortis[0]).toBe(false);

    etat = marquer(etat, [{ joueur: 0, points: 1 }]);
    expect(etat.sortis[0]).toBe(true);
  });

  it('garde l’éliminé dans la liste', () => {
    // Chez Qui rit sort, il rejoint le public et continue à saboter : le
    // retirer de l'état le ferait disparaître de l'écran.
    const etat = marquer(partie(3, { seuil: 2 }), [{ joueur: 1, points: 2 }]);
    expect(etat.joueurs).toHaveLength(3);
    expect(enJeu(etat)).toEqual([0, 2]);
  });

  it('termine la partie quand il ne reste qu’un joueur', () => {
    let etat = partie(3, { seuil: 1 });
    etat = marquer(etat, [{ joueur: 0, points: 1 }]);
    expect(etat.phase).toBe('partie');

    etat = marquer(etat, [{ joueur: 2, points: 1 }]);
    expect(etat.phase).toBe('fin');
    expect(vainqueurs(etat)).toEqual([1]);
  });

  it('saute les éliminés en faisant tourner le joueur courant', () => {
    let etat = partie(4, { seuil: 1, forme: 'parTour' });
    etat = marquer(etat, [{ joueur: 1, points: 1 }]);
    etat = marquer(etat, [], { avancer: true });
    // Le joueur 1 est sorti : le tour passe au 2.
    expect(etat.courant).toBe(2);
  });

  it('n’élimine personne quand il n’y a pas de seuil', () => {
    const etat = marquer(partie(3), [{ joueur: 0, points: 50 }]);
    expect(etat.sortis).toEqual([false, false, false]);
    expect(etat.phase).toBe('partie');
  });

  it('ramène un joueur remis à zéro dans la partie', () => {
    const etat = marquer(partie(3, { seuil: 2 }), [{ joueur: 0, points: 2 }]);
    const corrige = reducteur(etat, { type: 'reinitialiser', joueur: 0 });
    expect(corrige.scores[0]).toBe(0);
    expect(corrige.sortis[0]).toBe(false);
  });
});

describe('feuille de match — les vainqueurs', () => {
  it('sans seuil, c’est le plus gros total', () => {
    const etat = marquer(partie(3), [
      { joueur: 0, points: 2 },
      { joueur: 2, points: 5 }
    ]);
    expect(vainqueurs(etat)).toEqual([2]);
  });

  it('avec seuil, c’est le dernier debout le moins puni', () => {
    let etat = partie(4, { seuil: 3 });
    etat = marquer(etat, [{ joueur: 0, points: 2 }]);
    etat = marquer(etat, [{ joueur: 1, points: 1 }]);
    etat = marquer(etat, [{ joueur: 3, points: 3 }]);
    // Le 3 est sorti ; parmi les trois autres, le 2 n'a rien encaissé.
    expect(vainqueurs(etat)).toEqual([2]);
  });

  it('rend toutes les équipes à égalité', () => {
    const etat = marquer(partie(3), [
      { joueur: 0, points: 2 },
      { joueur: 1, points: 2 }
    ]);
    expect(vainqueurs(etat)).toEqual([0, 1]);
  });
});

describe('feuille de match — les duels', () => {
  it('tire deux joueurs encore en course', () => {
    const etat = reducteur(partie(4, { seuil: 2 }), {
      type: 'tirerDuel',
      melanger: (liste) => liste
    });
    expect(etat.duel).toEqual([0, 1]);
  });

  it('ne tire jamais un joueur éliminé', () => {
    let etat = marquer(partie(3, { seuil: 1 }), [{ joueur: 0, points: 1 }]);
    etat = reducteur(etat, { type: 'tirerDuel', melanger: (liste) => liste });
    expect(etat.duel).toEqual([1, 2]);
  });

  it('referme le duel une fois les points distribués', () => {
    let etat = reducteur(partie(4), { type: 'tirerDuel', melanger: (liste) => liste });
    etat = marquer(etat, [{ joueur: 0, points: 6 }], { passes: [0, 1] });
    expect(etat.duel).toBeNull();
    expect(etat.passes).toEqual([true, true, false, false]);
  });
});

describe('feuille de match — clore et rejouer', () => {
  it('clôt la partie à la demande', () => {
    const etat = reducteur(partie(3), { type: 'clore' });
    expect(etat.phase).toBe('fin');
  });

  it('ne clôt pas deux fois', () => {
    const fini = reducteur(partie(3), { type: 'clore' });
    expect(reducteur(fini, { type: 'clore' })).toBe(fini);
  });

  it('ignore les gains une fois la partie finie', () => {
    const fini = reducteur(partie(3), { type: 'clore' });
    expect(marquer(fini, [{ joueur: 0, points: 1 }])).toBe(fini);
  });

  it('rejoue avec les mêmes joueurs et le même seuil', () => {
    let etat = partie(3, { seuil: 2, forme: 'parTour' });
    etat = marquer(etat, [{ joueur: 0, points: 2 }], { passes: [0], avancer: true });
    const neuve = reducteur(etat, { type: 'rejouer' });

    expect(neuve.joueurs).toEqual(etat.joueurs);
    expect(neuve.seuil).toBe(2);
    expect(neuve.scores).toEqual([0, 0, 0]);
    expect(neuve.sortis).toEqual([false, false, false]);
    expect(neuve.passes).toEqual([false, false, false]);
    expect(neuve.courant).toBe(0);
  });
});

describe('feuille de match — les barèmes écrits jeu par jeu', () => {
  const enJeuTous = [0, 1, 2, 3];

  it('Le Liars Club : le conteur marque ce qu’il a trompé', () => {
    const { resoudre } = reglesDe('liars-club');
    // Quatre joueurs, trois auditeurs : un seul a démasqué la vraie, donc le
    // conteur en a trompé deux.
    expect(resoudre({ courant: 0, trouveurs: [2], enJeu: enJeuTous })).toEqual([
      { joueur: 2, points: 1 },
      { joueur: 0, points: 2 }
    ]);
  });

  it('Le Liars Club : personne n’est dupe, le conteur ne marque rien', () => {
    const { resoudre } = reglesDe('liars-club');
    const gains = resoudre({ courant: 0, trouveurs: [1, 2, 3], enJeu: enJeuTous });
    expect(gains.at(-1)).toEqual({ joueur: 0, points: 0 });
  });

  it('Tudum : le bonus du proposeur se substitue, il ne s’ajoute pas', () => {
    const { resoudre } = reglesDe('tudum');
    const bonus = (trouveurs) =>
      resoudre({ courant: 0, trouveurs, enJeu: enJeuTous }).at(-1).points;

    // Trois auditeurs : tous → 3, la moitié (2 sur 3) → 2, un seul → rien.
    expect(bonus([1, 2, 3])).toBe(3);
    expect(bonus([1, 2])).toBe(2);
    expect(bonus([1])).toBe(0);
    expect(bonus([])).toBe(0);
  });

  /**
   * Ce test verrouille le *game design*, pas le code.
   *
   * Le barème d'origine — 3/3, 6/0, 0/0 — n'était pas un dilemme : avec P = S,
   * trahir ne coûtait jamais rien, donc tout le monde trahissait et personne ne
   * marquait. Les deux conditions ci-dessous sont ce qui distingue un dilemme du
   * prisonnier d'un jeu mort, et rien d'autre ne les rappellerait si un jour
   * quelqu'un retouche les chiffres.
   */
  it('Avez-vous confiance ? : la matrice est un vrai dilemme du prisonnier', () => {
    const { gains } = reglesDe('avez-vous-confiance').matrice;
    // Du point de vue du premier duelliste : coopérer d'abord, trahir ensuite.
    const [R, S] = [gains[0][0][0], gains[0][1][0]];
    const [T, P] = [gains[1][0][0], gains[1][1][0]];

    expect(T).toBeGreaterThan(R); // trahir seul rapporte plus que coopérer
    expect(R).toBeGreaterThan(P); // coopérer à deux vaut mieux que se méfier à deux
    expect(P).toBeGreaterThan(S); // se méfier à deux vaut mieux que se faire avoir
    expect(2 * R).toBeGreaterThan(T + S); // coopérer maximise le total distribué
  });

  it('Avez-vous confiance ? : la matrice est symétrique et ne crée aucun point', () => {
    const { etiquettes, gains } = reglesDe('avez-vous-confiance').matrice;
    expect(etiquettes).toHaveLength(2);

    for (const [i, ligne] of gains.entries()) {
      for (const [j, points] of ligne.entries()) {
        // Six points sur la table, jamais davantage.
        expect(points[0] + points[1]).toBeLessThanOrEqual(6);
        // Échanger les deux joueurs échange leurs gains : aucune place n'est
        // avantagée, alors que le tirage désigne l'ordre au hasard.
        expect([...gains[j][i]].reverse()).toEqual(points);
      }
    }
  });

  it('les cinq jeux de la famille ont leurs règles, et personne d’autre', () => {
    for (const slug of [
      'liars-club',
      'avez-vous-confiance',
      'tudum',
      'qui-rit-sort',
      'sur-parole'
    ]) {
      expect(reglesDe(slug), slug).not.toBeNull();
    }
    expect(reglesDe('trois-fois-rien')).toBeNull();
  });

  it('les deux jeux à élimination portent le seuil que disent leurs règles', () => {
    expect(reglesDe('qui-rit-sort').seuil).toBe(2);
    expect(reglesDe('sur-parole').seuil).toBe(3);
  });

  it('tout jeu joué par tours nomme celui dont c’est le tour', () => {
    // `roleCourant` a vécu un temps déclaré et jamais lu : l'écran de vote
    // demandait « Qui a reconnu le son ? » sans dire qui l'avait produit, et
    // Tudum, qui ne déclare aucune phase, n'annonçait son joueur courant nulle
    // part de toute la partie. Un champ mort ne se voit pas — celui-ci, oui.
    for (const slug of ['liars-club', 'tudum']) {
      const regles = reglesDe(slug);
      expect(regles.forme, slug).toBe('parTour');
      expect(regles.roleCourant, slug).toBeTruthy();
    }
  });
});
