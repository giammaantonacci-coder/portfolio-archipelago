'use client';

import * as React from 'react';
import { useSearchStore } from '@/store/search-store';
import { useSearchResults } from './use-search-results';
import { buildDefaultPreferences } from '@/lib/default-preferences';

/**
 * Restituisce il gruppo di parcheggi valutati per la ricerca corrente,
 * oppure per una ricerca demo di default se si arriva via deep link.
 */
export function useScoredGroup() {
  const stored = useSearchStore((s) => s.preferences);
  const preferences = React.useMemo(() => stored ?? buildDefaultPreferences(), [stored]);
  const query = useSearchResults(preferences);
  return { preferences, ...query };
}
