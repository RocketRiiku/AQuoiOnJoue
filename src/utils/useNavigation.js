import { useCallback, useEffect, useMemo, useState } from 'react';
import { ordreDeroule } from './soiree';

/**
 * Navigation et sélection de soirée, pilotées par l'URL.
 *
 * Un seul propriétaire pour l'URL *et* le stockage local : deux hooks qui
 * écrivent tous les deux dans l'historique finissent immanquablement par se
 * marcher dessus.
 *
 * Schéma d'URL :
 *   /                                → la liste
 *   /?jeu=undercover                 → la fiche d'un jeu
 *   /?soiree=liars-club,undercover   → le programme de la soirée
 *   /?soiree=...&etape=2             → mode « lancer la soirée », 2ᵉ jeu
 *   /?jeu=trois-fois-rien&kit=1      → le kit du jeu affiché
 *   /?soiree=...&etape=2&kit=1       → le kit du jeu en cours de soirée
 *   /?page=mentions-legales          → une page à propos du site
 *
 * Source de vérité de la sélection : le paramètre `soiree` s'il est présent
 * (c'est le cas d'un lien reçu d'un ami — le programme partagé doit primer),
 * sinon le stockage local. Toute modification alimente les deux.
 */
const CLE_STOCKAGE = 'aquoionjoue:soiree';
const P_JEU = 'jeu';
const P_SOIREE = 'soiree';
const P_ETAPE = 'etape';
const P_PAGE = 'page';
const P_KIT = 'kit';

/**
 * Pages à propos du site, hors parcours de jeu. Elles priment sur le reste :
 * on y arrive depuis le pied de page, quelle que soit la vue quittée, et toute
 * autre navigation efface le paramètre.
 */
const PAGES = {
  suggestions: 'Proposer un jeu',
  'mentions-legales': 'Mentions légales'
};

const TITRE_PAR_DEFAUT = 'À quoi on joue ? — Des jeux à sortir en soirée';

// Le stockage local peut lever (navigation privée, cookies bloqués) : la
// sélection est un confort, elle ne doit jamais empêcher le site de marcher.
function lireStockage() {
  try {
    const valeur = JSON.parse(window.localStorage.getItem(CLE_STOCKAGE) ?? '[]');
    return Array.isArray(valeur) ? valeur.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function ecrireStockage(slugs) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(slugs));
  } catch {
    /* stockage indisponible : on continue en mémoire */
  }
}

const lireParams = () => {
  const p = new URLSearchParams(window.location.search);
  return {
    jeu: p.get(P_JEU),
    soiree: p.get(P_SOIREE),
    etape: p.get(P_ETAPE),
    page: p.get(P_PAGE),
    kit: p.get(P_KIT)
  };
};

const decouper = (valeur) => (valeur ? valeur.split(',').filter(Boolean) : []);

export function useNavigation(games) {
  const [params, setParams] = useState(lireParams);

  /**
   * Slugs connus uniquement — un lien partagé peut citer un jeu retiré depuis —
   * et **fils rouges rangés en fin de liste**.
   *
   * Ce second point n'est pas cosmétique : un fil rouge se joue en fond et ne
   * s'ordonnance pas avec le reste. En le gardant à la fin, l'index d'un jeu
   * dans cette liste est aussi sa place dans le programme, ce dont dépendent
   * les boutons monter/descendre. Sans cela, échanger deux jeux séparés par un
   * fil rouge dans la liste brute ne changeait rien à l'affichage.
   */
  const normaliser = useCallback(
    (slugs) => {
      const connus = slugs.filter((slug) => games.some((g) => g.slug === slug));
      const estFilRouge = (slug) => Boolean(games.find((g) => g.slug === slug)?.filRouge);
      return [...connus.filter((s) => !estFilRouge(s)), ...connus.filter(estFilRouge)];
    },
    [games]
  );

  const [slugsSoiree, setSlugsSoiree] = useState(() => {
    const depuisUrl = lireParams().soiree;
    return depuisUrl !== null ? decouper(depuisUrl) : lireStockage();
  });

  // Boutons Précédent / Suivant du navigateur.
  useEffect(() => {
    const onPopState = () => {
      const suivants = lireParams();
      setParams(suivants);
      if (suivants.soiree !== null) setSlugsSoiree(decouper(suivants.soiree));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const soiree = useMemo(
    () => normaliser(slugsSoiree).map((slug) => games.find((g) => g.slug === slug)),
    [slugsSoiree, normaliser, games]
  );

  // Unique point d'écriture du stockage : couvre aussi bien une modification
  // qu'un programme reçu par lien. Sans cela, la soirée d'un ami s'affichait
  // mais disparaissait au rechargement.
  useEffect(() => {
    ecrireStockage(normaliser(slugsSoiree));
  }, [slugsSoiree, normaliser]);

  const jeuAffiche = params.jeu ? (games.find((g) => g.slug === params.jeu) ?? null) : null;

  const enSoiree = params.soiree !== null;
  const etapeBrute = params.etape === null ? null : Number.parseInt(params.etape, 10);
  const enLancement = enSoiree && Number.isFinite(etapeBrute) && soiree.length > 0;

  // Étape bornée : un lien vers `etape=99` doit rester exploitable.
  const etape = enLancement ? Math.min(Math.max(etapeBrute, 1), soiree.length) : null;

  const page = params.page !== null && params.page in PAGES ? params.page : null;

  /**
   * Le kit se greffe sur le jeu affiché — la fiche, ou l'étape en cours du
   * déroulé. Il ne se dit donc pas d'où il vient : le quitter efface `kit` et
   * ramène exactement à l'écran d'où l'on partait.
   */
  const jeuDuKit = jeuAffiche ?? (enLancement ? ordreDeroule(soiree)[etape - 1] : null);
  const enKit = params.kit !== null && jeuDuKit != null;

  const vue =
    page ??
    (enKit
      ? 'kit'
      : enLancement
        ? 'lancement'
        : enSoiree
          ? 'soiree'
          : jeuAffiche
            ? 'jeu'
            : 'liste');

  /** Écrit l'URL et l'état local en un seul endroit. */
  const naviguer = useCallback((prochains, { remplacer = false } = {}) => {
    const url = new URL(window.location.href);
    for (const [cle, valeur] of Object.entries(prochains)) {
      if (valeur === null || valeur === undefined) url.searchParams.delete(cle);
      else url.searchParams.set(cle, valeur);
    }
    const methode = remplacer ? 'replaceState' : 'pushState';
    window.history[methode]({}, '', url);
    setParams(lireParams());
  }, []);

  // Paramètre invalide (jeu inconnu, étape sur une soirée vide) : on nettoie
  // sans ajouter d'entrée à l'historique, et la vue de repli s'affiche.
  useEffect(() => {
    if (params.jeu && !jeuAffiche) naviguer({ [P_JEU]: null }, { remplacer: true });
    else if (params.page && !page) naviguer({ [P_PAGE]: null }, { remplacer: true });
    else if (params.etape !== null && !enLancement) {
      naviguer({ [P_ETAPE]: null }, { remplacer: true });
    } else if (params.kit !== null && !enKit) {
      // `kit` sans jeu auquel se rattacher ne désigne rien.
      naviguer({ [P_KIT]: null }, { remplacer: true });
    }
  }, [
    params.jeu,
    params.etape,
    params.page,
    params.kit,
    jeuAffiche,
    page,
    enLancement,
    enKit,
    naviguer
  ]);

  const titre = useMemo(() => {
    if (page) return `${PAGES[page]} — À quoi on joue ?`;
    if (vue === 'kit') return `${jeuDuKit.title}, on joue — À quoi on joue ?`;
    if (vue === 'lancement') return `Jeu ${etape} sur ${soiree.length} — À quoi on joue ?`;
    if (vue === 'soiree') return `Ma soirée — À quoi on joue ?`;
    if (vue === 'jeu') return `${jeuAffiche.title} — À quoi on joue ?`;
    return TITRE_PAR_DEFAUT;
  }, [vue, page, etape, soiree.length, jeuAffiche, jeuDuKit]);

  useEffect(() => {
    document.title = titre;
  }, [titre]);

  /** Met à jour la sélection, le stockage, et l'URL si elle l'expose déjà. */
  const majSoiree = useCallback(
    (calcul) => {
      setSlugsSoiree((actuels) => {
        const suivants = normaliser(calcul(normaliser(actuels)));
        if (window.location.search.includes(`${P_SOIREE}=`)) {
          // replaceState : réordonner ne doit pas empiler l'historique.
          naviguer({ [P_SOIREE]: suivants.join(','), [P_ETAPE]: null }, { remplacer: true });
        }
        return suivants;
      });
    },
    [normaliser, naviguer]
  );

  const estDansSoiree = useCallback(
    (slug) => normaliser(slugsSoiree).includes(slug),
    [slugsSoiree, normaliser]
  );

  const basculerSoiree = useCallback(
    (game) =>
      majSoiree((actuels) =>
        actuels.includes(game.slug)
          ? actuels.filter((s) => s !== game.slug)
          : [...actuels, game.slug]
      ),
    [majSoiree]
  );

  const retirerDeSoiree = useCallback(
    (slug) => majSoiree((actuels) => actuels.filter((s) => s !== slug)),
    [majSoiree]
  );

  const deplacerDansSoiree = useCallback(
    (slug, delta) =>
      majSoiree((actuels) => {
        const index = actuels.indexOf(slug);
        const cible = index + delta;
        if (index === -1 || cible < 0 || cible >= actuels.length) return actuels;
        const copie = [...actuels];
        [copie[index], copie[cible]] = [copie[cible], copie[index]];
        return copie;
      }),
    [majSoiree]
  );

  const viderSoiree = useCallback(() => majSoiree(() => []), [majSoiree]);

  return {
    vue,
    jeuAffiche,
    soiree,
    etape,

    // Navigation
    // `page` est effacée par toute navigation de jeu : elle prime dans le choix
    // de la vue, et la laisser en place figerait l'écran sur les mentions.
    ouvrirJeu: useCallback(
      (game) =>
        naviguer({
          [P_JEU]: game.slug,
          [P_SOIREE]: null,
          [P_ETAPE]: null,
          [P_PAGE]: null,
          [P_KIT]: null
        }),
      [naviguer]
    ),
    fermerJeu: useCallback(() => naviguer({ [P_JEU]: null }), [naviguer]),

    /**
     * Le kit se pose sur la vue courante et s'en retire : ni `jeu` ni `etape`
     * ne bougent, si bien que le quitter ramène là d'où l'on venait, fiche ou
     * déroulé de soirée.
     */
    jeuDuKit,
    ouvrirKit: useCallback(() => naviguer({ [P_KIT]: '1' }), [naviguer]),
    fermerKit: useCallback(() => naviguer({ [P_KIT]: null }), [naviguer]),
    ouvrirSoiree: useCallback(
      () =>
        naviguer({
          [P_SOIREE]: normaliser(slugsSoiree).join(','),
          [P_JEU]: null,
          [P_ETAPE]: null,
          [P_PAGE]: null,
          [P_KIT]: null
        }),
      [naviguer, slugsSoiree, normaliser]
    ),
    fermerSoiree: useCallback(
      () => naviguer({ [P_SOIREE]: null, [P_ETAPE]: null }),
      [naviguer]
    ),
    lancerSoiree: useCallback(
      () =>
        naviguer({
          [P_SOIREE]: normaliser(slugsSoiree).join(','),
          [P_ETAPE]: '1',
          [P_JEU]: null,
          [P_PAGE]: null,
          [P_KIT]: null
        }),
      [naviguer, slugsSoiree, normaliser]
    ),
    allerEtape: useCallback(
      (n) => naviguer({ [P_ETAPE]: String(n), [P_KIT]: null }),
      [naviguer]
    ),
    quitterLancement: useCallback(
      () => naviguer({ [P_ETAPE]: null, [P_KIT]: null }),
      [naviguer]
    ),

    /** Retour à la liste, d'où que l'on vienne : le titre du site y mène. */
    retourAccueil: useCallback(
      () =>
        naviguer({
          [P_JEU]: null,
          [P_SOIREE]: null,
          [P_ETAPE]: null,
          [P_PAGE]: null,
          [P_KIT]: null
        }),
      [naviguer]
    ),

    // Pages à propos du site
    ouvrirPage: useCallback(
      (nom) =>
        naviguer({
          [P_PAGE]: nom,
          [P_JEU]: null,
          [P_SOIREE]: null,
          [P_ETAPE]: null,
          [P_KIT]: null
        }),
      [naviguer]
    ),
    fermerPage: useCallback(() => naviguer({ [P_PAGE]: null }), [naviguer]),

    // Sélection
    estDansSoiree,
    basculerSoiree,
    retirerDeSoiree,
    deplacerDansSoiree,
    viderSoiree
  };
}
