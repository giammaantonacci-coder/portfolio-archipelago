'use client';

import { create } from 'zustand';
import type { SearchPreferences } from '@/types';

interface SearchState {
  preferences: SearchPreferences | null;
  recentSearches: SearchPreferences[];
  setPreferences: (prefs: SearchPreferences) => void;
  clear: () => void;
}

const MAX_RECENT = 4;

/** Stato UI globale della ricerca corrente (non persistito lato server). */
export const useSearchStore = create<SearchState>((set) => ({
  preferences: null,
  recentSearches: [],
  setPreferences: (prefs) =>
    set((state) => {
      const withoutDup = state.recentSearches.filter(
        (s) => s.destination !== prefs.destination || s.arrivalTime !== prefs.arrivalTime,
      );
      return {
        preferences: prefs,
        recentSearches: [prefs, ...withoutDup].slice(0, MAX_RECENT),
      };
    }),
  clear: () => set({ preferences: null }),
}));
