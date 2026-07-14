'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { usePlansStore } from '@/store/plans-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useProfileStore } from '@/store/profile-store';
import {
  deleteFavoriteRemote,
  deletePlanRemote,
  pullFavorites,
  pullPlans,
  pullProfile,
  pushFavorite,
  pushPlan,
  pushProfile,
} from '@/lib/supabase/sync';

/**
 * Sincronizzazione cloud (best-effort) con Supabase quando l'utente è loggato.
 * - Al login: scarica piani, preferiti e profilo e li fonde con lo storage locale.
 * - Alle modifiche locali: rispecchia su Supabase (upsert/delete).
 * Completamente inerte quando Supabase non è configurato o non c'è sessione.
 */
export function CloudSync() {
  const { user, isConfigured } = useAuth();
  const userId = user?.id ?? null;

  // Pull iniziale al login.
  React.useEffect(() => {
    if (!isConfigured || !userId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let active = true;

    (async () => {
      const [plans, favorites, profile] = await Promise.all([
        pullPlans(supabase, userId).catch(() => []),
        pullFavorites(supabase, userId).catch(() => []),
        pullProfile(supabase, userId).catch(() => null),
      ]);
      if (!active) return;

      // Merge piani (remoto prevale per id).
      const localPlans = usePlansStore.getState().plans;
      const mergedPlans = mergeById([...plans, ...localPlans]);
      usePlansStore.setState({ plans: mergedPlans });

      // Merge preferiti.
      const localFavs = useFavoritesStore.getState().favorites;
      const mergedFavs = mergeById([...favorites, ...localFavs]);
      useFavoritesStore.setState({ favorites: mergedFavs });

      if (profile) {
        useProfileStore.setState((s) => ({ profile: { ...profile, ...s.profile } }));
      }
    })();

    return () => {
      active = false;
    };
  }, [isConfigured, userId]);

  // Mirror delle modifiche locali → Supabase.
  React.useEffect(() => {
    if (!isConfigured || !userId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const seenPlans = new Map(usePlansStore.getState().plans.map((p) => [p.id, JSON.stringify(p)]));
    const seenFavs = new Map(
      useFavoritesStore.getState().favorites.map((f) => [f.id, JSON.stringify(f)]),
    );

    const unsubPlans = usePlansStore.subscribe((state) => {
      const current = new Map(state.plans.map((p) => [p.id, p]));
      for (const [id, plan] of current) {
        const json = JSON.stringify(plan);
        if (seenPlans.get(id) !== json) {
          seenPlans.set(id, json);
          void pushPlan(supabase, userId, plan).catch(() => {});
        }
      }
      for (const id of seenPlans.keys()) {
        if (!current.has(id)) {
          seenPlans.delete(id);
          void deletePlanRemote(supabase, id).catch(() => {});
        }
      }
    });

    const unsubFavs = useFavoritesStore.subscribe((state) => {
      const current = new Map(state.favorites.map((f) => [f.id, f]));
      for (const [id, fav] of current) {
        const json = JSON.stringify(fav);
        if (seenFavs.get(id) !== json) {
          seenFavs.set(id, json);
          void pushFavorite(supabase, userId, fav).catch(() => {});
        }
      }
      for (const id of seenFavs.keys()) {
        if (!current.has(id)) {
          seenFavs.delete(id);
          void deleteFavoriteRemote(supabase, id).catch(() => {});
        }
      }
    });

    let profileTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubProfile = useProfileStore.subscribe((state) => {
      clearTimeout(profileTimer);
      profileTimer = setTimeout(() => {
        void pushProfile(supabase, userId, state.profile).catch(() => {});
      }, 800);
    });

    return () => {
      unsubPlans();
      unsubFavs();
      unsubProfile();
      clearTimeout(profileTimer);
    };
  }, [isConfigured, userId]);

  return null;
}

function mergeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) if (!map.has(item.id)) map.set(item.id, item);
  return Array.from(map.values());
}
