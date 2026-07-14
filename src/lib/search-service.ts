import type { ScoredParking, SearchPreferences } from '@/types';
import { getMapProvider, getParkingProvider } from '@/lib/providers';
import { scoreAndRankParkings } from '@/lib/scoring';
import { parkingDataSource } from '@/lib/config';

export interface SearchResult {
  preferences: SearchPreferences;
  items: ScoredParking[];
}

export class DestinationNotFoundError extends Error {
  constructor() {
    super('Destinazione non riconosciuta.');
    this.name = 'DestinationNotFoundError';
  }
}

/**
 * Orchestrazione: geocoding della destinazione (quando servono coordinate reali)
 * + recupero dei parcheggi dal provider attivo + scoring. Restituisce la lista
 * già ordinata.
 */
export async function searchAndScore(preferences: SearchPreferences): Promise<SearchResult> {
  let prefs = preferences;

  // In modalità non-demo servono coordinate reali per interrogare la sorgente dati.
  if (parkingDataSource !== 'demo' && prefs.destinationLatitude === undefined) {
    const map = getMapProvider();
    const matches = await map.geocode(prefs.destination);
    const best = matches[0];
    if (!best) throw new DestinationNotFoundError();
    prefs = {
      ...prefs,
      destination: best.name || prefs.destination,
      destinationLatitude: best.coordinates.latitude,
      destinationLongitude: best.coordinates.longitude,
    };

    // Geocoding della partenza (facoltativo, best-effort).
    if (prefs.origin && prefs.originLatitude === undefined) {
      try {
        const originMatches = await map.geocode(prefs.origin);
        const originBest = originMatches[0];
        if (originBest) {
          prefs = {
            ...prefs,
            originLatitude: originBest.coordinates.latitude,
            originLongitude: originBest.coordinates.longitude,
          };
        }
      } catch {
        // ignoriamo: la partenza è opzionale
      }
    }
  }

  const provider = getParkingProvider();
  const parkings = await provider.searchParkings(prefs);
  const items = scoreAndRankParkings(parkings, prefs);
  return { preferences: prefs, items };
}
