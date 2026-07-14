import type { DataConfidence, Parking, SearchPreferences } from '@/types';
import type { ParkingProvider } from './parking-provider';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Provider parcheggi da Supabase (tabella `parkings`), usato quando
 * NEXT_PUBLIC_PARKING_SOURCE=supabase. L'operatore popola la tabella con dati
 * verificati; il filtro avviene per `city_query`.
 */
export class SupabaseParkingProvider implements ParkingProvider {
  async searchParkings(preferences: SearchPreferences): Promise<Parking[]> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('parkings')
      .select('*')
      .ilike('city_query', `%${preferences.destination}%`)
      .limit(50);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRow);
  }

  async getParkingById(id: string): Promise<Parking | null> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from('parkings').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapRow(data);
  }
}

/** Mappa una riga snake_case della tabella `parkings` nel dominio Parking. */
function mapRow(row: Record<string, unknown>): Parking {
  const s = (key: string): string | undefined =>
    typeof row[key] === 'string' ? (row[key] as string) : undefined;
  const n = (key: string): number | undefined =>
    typeof row[key] === 'number' ? (row[key] as number) : undefined;
  const b = (key: string): boolean => row[key] === true;

  return {
    id: String(row.id),
    name: s('name') ?? 'Parcheggio',
    slug: s('slug') ?? String(row.id),
    description: s('description'),
    address: s('address') ?? '',
    city: s('city') ?? '',
    latitude: n('latitude') ?? 0,
    longitude: n('longitude') ?? 0,
    pricePerHour: n('price_per_hour'),
    dailyMaxPrice: n('daily_max_price'),
    estimatedTotalPrice: n('estimated_total_price') ?? 0,
    hasKnownPrice: n('estimated_total_price') !== undefined,
    currency: 'EUR',
    walkingDistanceMeters: n('walking_distance_meters') ?? 0,
    walkingDurationMinutes: n('walking_duration_minutes') ?? 0,
    drivingDurationMinutes: n('driving_duration_minutes') ?? 0,
    totalDurationMinutes: n('total_duration_minutes') ?? 0,
    isCovered: b('is_covered'),
    isBookable: b('is_bookable'),
    hasEvCharging: b('has_ev_charging'),
    isAccessible: b('is_accessible'),
    isOpen24Hours: b('is_open_24_hours'),
    isOutsideZtl: b('is_outside_ztl'),
    openingTime: s('opening_time'),
    closingTime: s('closing_time'),
    maxVehicleHeightCm: n('max_vehicle_height_cm'),
    totalSpaces: n('total_spaces'),
    dataConfidence: (s('data_confidence') as DataConfidence) ?? 'medium',
    dataSource: s('data_source') ?? 'supabase',
    lastVerifiedAt: s('last_verified_at'),
    imageUrl: s('image_url'),
    externalUrl: s('external_url'),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    isDemo: b('is_demo'),
  };
}
