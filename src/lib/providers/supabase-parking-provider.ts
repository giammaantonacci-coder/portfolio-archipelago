import type { Parking, SearchPreferences } from '@/types';
import type { ParkingProvider } from './parking-provider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Provider Supabase: legge i parcheggi dalla tabella `parkings`.
 * Nota: prezzi e tempi in un MVP reale andrebbero calcolati con un servizio
 * di routing rispetto alla destinazione; qui restituiamo i valori memorizzati.
 */
export class SupabaseParkingProvider implements ParkingProvider {
  async searchParkings(preferences: SearchPreferences): Promise<Parking[]> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('parkings')
      .select('*')
      .eq('city_query', preferences.destination)
      .limit(50);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRow);
  }

  async getParkingById(id: string): Promise<Parking | null> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from('parkings').select('*').eq('id', id).single();
    if (error) return null;
    return data ? mapRow(data) : null;
  }
}

// Il mapping dal row DB al dominio è isolato qui.
function mapRow(row: Record<string, unknown>): Parking {
  return row as unknown as Parking;
}
