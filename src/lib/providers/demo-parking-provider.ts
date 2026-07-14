import type { Parking, SearchPreferences } from '@/types';
import { DEMO_PARKINGS } from '@/lib/demo/parkings';
import type { ParkingProvider } from './parking-provider';

/** Provider demo: dati sintetici, nessuna dipendenza esterna. */
export class DemoParkingProvider implements ParkingProvider {
  private readonly parkings: Parking[];

  constructor(parkings: Parking[] = DEMO_PARKINGS) {
    this.parkings = parkings;
  }

  async searchParkings(_preferences: SearchPreferences): Promise<Parking[]> {
    // In demo restituiamo l'intero insieme: filtri e scoring avvengono a valle.
    // Simuliamo una piccola latenza per rendere credibili gli stati di caricamento.
    await delay(180);
    return this.parkings.map((p) => ({ ...p }));
  }

  async getParkingById(id: string): Promise<Parking | null> {
    await delay(80);
    return this.parkings.find((p) => p.id === id) ?? null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
