import type { ScoredParking, SearchPreferences } from '@/types';
import { getParkingProvider } from '@/lib/providers';
import { scoreAndRankParkings } from '@/lib/scoring';

export interface SearchResult {
  preferences: SearchPreferences;
  items: ScoredParking[];
}

/**
 * Orchestrazione: recupera i parcheggi dal provider attivo e li valuta con lo
 * scoring engine in base alle preferenze. Restituisce la lista già ordinata.
 */
export async function searchAndScore(preferences: SearchPreferences): Promise<SearchResult> {
  const provider = getParkingProvider();
  const parkings = await provider.searchParkings(preferences);
  const items = scoreAndRankParkings(parkings, preferences);
  return { preferences, items };
}
