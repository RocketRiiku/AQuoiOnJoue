import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useIntroduction } from './useIntroduction';

const CLE = 'aquoionjoue:intro-vue';

describe('useIntroduction', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('est dépliée à la première visite', () => {
    expect(renderHook(() => useIntroduction()).result.current.visible).toBe(true);
  });

  it('reste repliée aux visites suivantes', () => {
    const { result } = renderHook(() => useIntroduction());
    act(() => result.current.masquer());
    expect(result.current.visible).toBe(false);

    // Nouvelle visite : le hook est remonté de zéro.
    expect(renderHook(() => useIntroduction()).result.current.visible).toBe(false);
  });

  it('peut être rouverte à la demande', () => {
    window.localStorage.setItem(CLE, 'vue');
    const { result } = renderHook(() => useIntroduction());
    expect(result.current.visible).toBe(false);

    act(() => result.current.afficher());
    expect(result.current.visible).toBe(true);
  });

  it('reste utilisable si le stockage est indisponible', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });

    const { result } = renderHook(() => useIntroduction());
    expect(result.current.visible).toBe(true);
    // Ne doit pas lever : la fermeture marche pour la session en cours.
    act(() => result.current.masquer());
    expect(result.current.visible).toBe(false);
  });
});
