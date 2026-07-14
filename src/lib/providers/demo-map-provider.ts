import type { Coordinates, GeoLocation, Route } from '@/types';
import type { MapProvider } from './map-provider';
import { DEMO_DESTINATION } from '@/lib/demo/destination';

const EARTH_RADIUS_M = 6_371_000;

function haversineMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

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

/** Polilinea a 3 punti con una leggera curva per un rendering demo gradevole. */
function simplePolyline(a: Coordinates, b: Coordinates): Array<[number, number]> {
  const midLat = (a.latitude + b.latitude) / 2 + (b.longitude - a.longitude) * 0.06;
  const midLng = (a.longitude + b.longitude) / 2 - (b.latitude - a.latitude) * 0.06;
  return [
    [a.longitude, a.latitude],
    [midLng, midLat],
    [b.longitude, b.latitude],
  ];
}
