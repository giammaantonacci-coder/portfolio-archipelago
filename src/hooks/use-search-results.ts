'use client';

import { useQuery } from '@tanstack/react-query';
import type { SearchPreferences } from '@/types';
import { searchAndScore } from '@/lib/search-service';

/** Recupera e valuta i parcheggi per le preferenze date (via TanStack Query). */
export function useSearchResults(preferences: SearchPreferences | null) {
  return useQuery({
    queryKey: ['search', preferences],
    queryFn: () => searchAndScore(preferences as SearchPreferences),
    enabled: preferences !== null,
  });
}
