import type { Coordinates, GeoLocation, Route } from '@/types';
import type { MapProvider } from './map-provider';
import { DEMO_DESTINATION } from '@/lib/demo/destination';
import { haversineMeters, simplePolyline } from '@/lib/geo';

/**
 * Map provider demo: geocoding e routing simulati ma coerenti.
 * Nessuna chiamata di rete. Le geometrie sono polilinee semplificate.
 */
export class DemoMapProvider implements MapProvider {
  async geocode(query: string): Promise<GeoLocation[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    // Restituiamo sempre la destinazione demo, etichettata con la query utente,
    // così il flusso funziona con qualsiasi testo inserito.
    return [
      {
        name: trimmed,
        address: `${trimmed} — posizione dimostrativa`,
        coordinates: { ...DEMO_DESTINATION.coordinates },
        isDemo: true,
      },
    ];
  }

  async getDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<Route> {
    const distance = haversineMeters(origin, destination) * 1.35;
    return {
      distanceMeters: Math.round(distance),
      durationMinutes: Math.max(3, Math.round(distance / 450)), // ~27 km/h urbano
      geometry: simplePolyline(origin, destination),
      mode: 'driving',
      isDemo: true,
    };
  }

  async getWalkingRoute(origin: Coordinates, destination: Coordinates): Promise<Route> {
    const distance = haversineMeters(origin, destination) * 1.2;
    return {
      distanceMeters: Math.round(distance),
      durationMinutes: Math.max(1, Math.round(distance / 80)), // ~4.8 km/h
      geometry: simplePolyline(origin, destination),
      mode: 'walking',
      isDemo: true,
    };
  }
}
