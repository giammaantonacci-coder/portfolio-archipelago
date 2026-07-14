import type { Parking, SearchPreferences } from '@/types';
import type { ParkingProvider } from './parking-provider';

/**
 * Provider parcheggi reale basato su OpenStreetMap (Overpass), via la route
 * same-origin `/api/parkings`. Richiede coordinate della destinazione: lo strato
 * di ricerca fa prima il geocoding e le allega alle preferenze.
 */
export class OsmParkingProvider implements ParkingProvider {
  async searchParkings(preferences: SearchPreferences): Promise<Parking[]> {
    const { destinationLatitude, destinationLongitude } = preferences;
    if (destinationLatitude === undefined || destinationLongitude === undefined) {
      throw new Error('Destinazione non geolocalizzata.');
    }

    const params = new URLSearchParams({
      lat: String(destinationLatitude),
      lng: String(destinationLongitude),
      radius: String(preferences.maxWalkingDistanceMeters ?? 1000),
      duration: String(preferences.durationMinutes),
    });
    if (preferences.originLatitude !== undefined && preferences.originLongitude !== undefined) {
      params.set('originLat', String(preferences.originLatitude));
      params.set('originLng', String(preferences.originLongitude));
    }

    const res = await fetch(`/api/parkings?${params.toString()}`);
    if (!res.ok) throw new Error('Ricerca parcheggi non riuscita.');
    const data = (await res.json()) as { parkings: Parking[] };
    return data.parkings;
  }

  async getParkingById(_id: string): Promise<Parking | null> {
    // Il dettaglio riusa il gruppo della ricerca corrente; nessuna lookup singola.
    return null;
  }
}
