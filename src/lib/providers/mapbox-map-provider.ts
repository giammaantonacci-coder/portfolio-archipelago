import type { Coordinates, GeoLocation, Route } from '@/types';
import type { MapProvider } from './map-provider';
import { appConfig } from '@/lib/config';

/**
 * Adapter Mapbox. La business logic non dipende direttamente da Mapbox:
 * questo file è l'unico punto di contatto con l'API del provider.
 * Usato solo quando NEXT_PUBLIC_MAPBOX_TOKEN è presente.
 */
export class MapboxMapProvider implements MapProvider {
  private readonly token: string;

  constructor(token: string = appConfig.mapboxToken) {
    this.token = token;
  }

  async geocode(query: string): Promise<GeoLocation[]> {
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
    );
    url.searchParams.set('access_token', this.token);
    url.searchParams.set('limit', '5');
    url.searchParams.set('language', 'it');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Geocoding non riuscito');
    const data = (await res.json()) as {
      features: Array<{ place_name: string; text: string; center: [number, number] }>;
    };
    return data.features.map((f) => ({
      name: f.text,
      address: f.place_name,
      coordinates: { longitude: f.center[0], latitude: f.center[1] },
    }));
  }

  async getDrivingRoute(origin: Coordinates, destination: Coordinates): Promise<Route> {
    return this.getRoute(origin, destination, 'driving');
  }

  async getWalkingRoute(origin: Coordinates, destination: Coordinates): Promise<Route> {
    return this.getRoute(origin, destination, 'walking');
  }

  private async getRoute(
    origin: Coordinates,
    destination: Coordinates,
    profile: 'driving' | 'walking',
  ): Promise<Route> {
    const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}`);
    url.searchParams.set('access_token', this.token);
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('overview', 'simplified');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Routing non riuscito');
    const data = (await res.json()) as {
      routes: Array<{
        distance: number;
        duration: number;
        geometry: { coordinates: Array<[number, number]> };
      }>;
    };
    const route = data.routes[0];
    if (!route) throw new Error('Nessun percorso trovato');
    return {
      distanceMeters: Math.round(route.distance),
      durationMinutes: Math.round(route.duration / 60),
      geometry: route.geometry.coordinates,
      mode: profile,
    };
  }
}
