import type { SearchPreferences } from '@/types';
import { DEMO_DESTINATION } from '@/lib/demo/destination';

/** Preferenze di ricerca di riposo usate quando si arriva via deep link. */
export function buildDefaultPreferences(): SearchPreferences {
  return {
    destination: DEMO_DESTINATION.name,
    destinationLatitude: DEMO_DESTINATION.coordinates.latitude,
    destinationLongitude: DEMO_DESTINATION.coordinates.longitude,
    arrivalDate: new Date().toISOString().slice(0, 10),
    arrivalTime: '10:00',
    durationMinutes: 120,
    priority: 'balanced',
  };
}
