import type { Parking, SearchPreferences } from '@/types';
import type { ParkingProvider } from './parking-provider';

/**
 * Scheletro NON attivo per future integrazioni con fornitori esterni.
 * Preparato per l'estensione ma volutamente non implementato nell'MVP.
 * Nessuno scraping.
 */
export class ExternalParkingProvider implements ParkingProvider {
  async searchParkings(_preferences: SearchPreferences): Promise<Parking[]> {
    throw new Error('ExternalParkingProvider non è implementato in questo MVP.');
  }

  async getParkingById(_id: string): Promise<Parking | null> {
    throw new Error('ExternalParkingProvider non è implementato in questo MVP.');
  }
}
