import { appConfig, parkingDataSource, useDemoMap, useMapbox } from '@/lib/config';
import type { ParkingProvider } from './parking-provider';
import type { MapProvider } from './map-provider';
import { DemoParkingProvider } from './demo-parking-provider';
import { OsmParkingProvider } from './osm-parking-provider';
import { SupabaseParkingProvider } from './supabase-parking-provider';
import { DemoMapProvider } from './demo-map-provider';
import { NominatimMapProvider } from './nominatim-map-provider';
import { MapboxMapProvider } from './mapbox-map-provider';

export type { ParkingProvider } from './parking-provider';
export type { MapProvider } from './map-provider';

/**
 * Factory dei provider dati parcheggi.
 * Default: OpenStreetMap (reale, nessuna chiave). Demo solo se richiesto.
 */
export function getParkingProvider(): ParkingProvider {
  switch (parkingDataSource) {
    case 'demo':
      return new DemoParkingProvider();
    case 'supabase':
      return new SupabaseParkingProvider();
    case 'osm':
    default:
      return new OsmParkingProvider();
  }
}

/**
 * Factory dei provider mappa/geocoding.
 * Default: Nominatim (reale, nessuna chiave). Mapbox se configurato; demo se richiesto.
 */
export function getMapProvider(): MapProvider {
  if (useDemoMap) return new DemoMapProvider();
  if (useMapbox) return new MapboxMapProvider(appConfig.mapboxToken);
  return new NominatimMapProvider();
}
