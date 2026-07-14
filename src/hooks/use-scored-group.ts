'use client';

import * as React from 'react';
import { useSearchStore } from '@/store/search-store';
import { useSearchResults } from './use-search-results';
import { buildDefaultPreferences } from '@/lib/default-preferences';

/**
 * Restituisce il gruppo di parcheggi valutati per la ricerca corrente
 * (o una ricerca demo di default se si arriva via deep link) insieme alle
 * preferenze RISOLTE — comprensive delle coordinate ottenute dal geocoding.
 */
export function useScoredGroup() {
  const stored = useSearchStore((s) => s.preferences);
  const input = React.useMemo(() => stored ?? buildDefaultPreferences(), [stored]);
  const query = useSearchResults(input);
  // data.preferences contiene le coordinate risolte dal geocoding.
  const preferences = query.data?.preferences ?? input;
  return { preferences, ...query };
}
