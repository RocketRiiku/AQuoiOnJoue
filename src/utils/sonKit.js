/**
 * Tic-tac et vibration des dernières secondes.
 *
 * Aucun fichier son : deux oscillateurs de quelques millisecondes suffisent, et
 * un `.mp3` de plus serait un aller-retour réseau au pire moment — pendant un
 * tour, sur un téléphone en 4G.
 *
 * Le contexte audio n'est créé qu'au premier appel, donc après un clic : les
 * navigateurs refusent d'en ouvrir un sans geste de l'utilisateur, et le créer
 * au chargement de la page le laisserait suspendu.
 */
let contexte = null;

function obtenirContexte() {
  if (typeof window === 'undefined') return null;
  const Constructeur = window.AudioContext ?? window.webkitAudioContext;
  if (!Constructeur) return null;
  if (!contexte) {
    try {
      contexte = new Constructeur();
    } catch {
      return null;
    }
  }
  if (contexte.state === 'suspended') contexte.resume?.();
  return contexte;
}

/**
 * Un tic. Deux hauteurs alternées font entendre un tic-tac plutôt qu'un bip
 * répété — l'oreille suit une alternance sans avoir à compter.
 */
export function tic({ aigu = true, volume = 0.06 } = {}) {
  const ctx = obtenirContexte();
  if (!ctx) return;

  const oscillateur = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillateur.type = 'sine';
  oscillateur.frequency.value = aigu ? 1180 : 820;

  // Attaque immédiate puis extinction : sans la rampe, la coupure nette
  // produit un claquement audible.
  const debut = ctx.currentTime;
  gain.gain.setValueAtTime(volume, debut);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + 0.07);

  oscillateur.connect(gain).connect(ctx.destination);
  oscillateur.start(debut);
  oscillateur.stop(debut + 0.08);
}

/** Vibration courte. Absente d'iOS Safari : on ne compte jamais dessus seul. */
export function vibrer(millisecondes = 60) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(millisecondes);
  }
}
