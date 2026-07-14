'use client';

import { create } from 'zustand';

interface ComparisonState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const MAX_COMPARE = 3;

/** Stato UI per il confronto: massimo 3 parcheggi. */
export const useComparisonStore = create<ComparisonState>((set, get) => ({
  ids: [],
  toggle: (id) =>
    set((state) => {
      if (state.ids.includes(id)) {
        return { ids: state.ids.filter((x) => x !== id) };
      }
      if (state.ids.length >= MAX_COMPARE) return state;
      return { ids: [...state.ids, id] };
    }),
  remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
  clear: () => set({ ids: [] }),
  has: (id) => get().ids.includes(id),
}));
