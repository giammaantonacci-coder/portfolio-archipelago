import type { Parking, SearchPreferences } from '@/types';

/**
 * Astrazione indipendente dal provider dati.
 * La business logic (scoring, UI) dipende solo da questa interfaccia.
 */
export interface ParkingProvider {
  searchParkings(preferences: SearchPreferences): Promise<Parking[]>;
  getParkingById(id: string): Promise<Parking | null>;
}
