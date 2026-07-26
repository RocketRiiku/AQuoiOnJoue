import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

// jsdom n'implémente pas le défilement : sans ce bouchon, chaque changement de
// vue polluerait la sortie des tests d'un « Not implemented ».
window.scrollTo = vi.fn();

// Absent de jsdom, mais requis par le curseur de durée (Radix), qui mesure sa
// piste au montage.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Utilisé par Framer Motion pour prefers-reduced-motion.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  });
}

// Chaque test repart d'une page vierge : l'URL et le stockage local portent
// l'état de navigation et la sélection de soirée, ils fuiteraient d'un test
// à l'autre.
beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.clearAllMocks();
});
