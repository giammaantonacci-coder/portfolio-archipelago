import { appConfig, useDemoMap, isDemoMode } from '@/lib/config';
import type { ParkingProvider } from './parking-provider';
import type { MapProvider } from './map-provider';
import { DemoParkingProvider } from './demo-parking-provider';
import { SupabaseParkingProvider } from './supabase-parking-provider';
import { DemoMapProvider } from './demo-map-provider';
import { MapboxMapProvider } from './mapbox-map-provider';

export type { ParkingProvider } from './parking-provider';
export type { MapProvider } from './map-provider';

/**
 * Factory dei provider. Se le variabili d'ambiente non sono presenti (o
 * NEXT_PUBLIC_DEMO_MODE=true) vengono usati automaticamente i provider demo.
 */
export function getParkingProvider(): ParkingProvider {
  if (isDemoMode) return new DemoParkingProvider();
  return new SupabaseParkingProvider();
}

export function getMapProvider(): MapProvider {
  if (useDemoMap) return new DemoMapProvider();
  return new MapboxMapProvider(appConfig.mapboxToken);
}
