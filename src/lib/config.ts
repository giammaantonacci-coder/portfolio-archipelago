/**
 * Configurazione runtime e selezione dei provider.
 *
 * Per impostazione predefinita Parqo usa dati REALI:
 * - parcheggi da OpenStreetMap (Overpass) — nessuna chiave necessaria;
 * - geocoding da Nominatim — nessuna chiave necessaria;
 * - mappa interattiva da MapLibre + tile OSM — nessuna chiave.
 *
 * Le integrazioni opzionali si attivano automaticamente quando presenti:
 * - Mapbox (NEXT_PUBLIC_MAPBOX_TOKEN) per geocoding/routing/mappa di qualità;
 * - Supabase (URL + anon key) per autenticazione e sincronizzazione cloud.
 *
 * La modalità demo (dati sintetici, offline) si attiva SOLO esplicitamente con
 * NEXT_PUBLIC_DEMO_MODE=true — utile per sviluppo senza rete.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || '';
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE?.trim() === 'true';

/** Sorgente dati parcheggi: 'demo' | 'osm' | 'supabase'. Default 'osm'. */
const parkingSource = (process.env.NEXT_PUBLIC_PARKING_SOURCE?.trim() || '') as
  'demo' | 'osm' | 'supabase' | '';

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000',
  supabaseUrl,
  supabaseAnonKey,
  mapboxToken,
  hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
  hasMapbox: Boolean(mapboxToken),
  demoMode,
  parkingSource,
} as const;

/** true solo quando la demo è richiesta esplicitamente. */
export const isDemoMode = demoMode;

/** Sorgente parcheggi effettiva. */
export const parkingDataSource: 'demo' | 'osm' | 'supabase' = demoMode
  ? 'demo'
  : appConfig.parkingSource === 'supabase' && appConfig.hasSupabase
    ? 'supabase'
    : appConfig.parkingSource === 'demo'
      ? 'demo'
      : 'osm';

/** La mappa usa il placeholder demo solo in modalità demo. */
export const useDemoMap = demoMode;

/** Con Mapbox configurato usiamo il suo adapter, altrimenti Nominatim/MapLibre. */
export const useMapbox = !demoMode && appConfig.hasMapbox;

/** true quando l'autenticazione/sync Supabase è disponibile. */
export const hasSupabaseAuth = appConfig.hasSupabase;
