'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Favorite } from '@/types';

interface FavoritesState {
  favorites: Favorite[];
  add: (fav: Favorite) => void;
  remove: (id: string) => void;
  hasParking: (parkingId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      add: (fav) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === fav.id)) return state;
          return { favorites: [fav, ...state.favorites] };
        }),
      remove: (id) => set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) })),
      hasParking: (parkingId) =>
        get().favorites.some((f) => f.kind === 'parking' && f.parking?.id === parkingId),
    }),
    { name: 'parqo:favorites' },
  ),
);
