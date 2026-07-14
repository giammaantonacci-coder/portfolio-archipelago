/**
 * Configurazione runtime e rilevamento della modalità demo.
 *
 * L'app deve funzionare senza token Mapbox, senza Supabase e senza account.
 * Quando le variabili non sono presenti (o DEMO_MODE=true) i provider demo
 * vengono usati automaticamente.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || '';
const forcedDemo = process.env.NEXT_PUBLIC_DEMO_MODE?.trim() === 'true';

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000',
  supabaseUrl,
  supabaseAnonKey,
  mapboxToken,
  /** Supabase è configurato solo se URL e anon key sono presenti. */
  hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
  hasMapbox: Boolean(mapboxToken),
  /** Demo forzato via env oppure quando manca del tutto la configurazione. */
  forcedDemo,
} as const;

/** In demo se forzato oppure se non è configurato alcun backend dati. */
export const isDemoMode = appConfig.forcedDemo || !appConfig.hasSupabase;

/** La mappa usa il provider demo se manca il token o siamo in demo forzato. */
export const useDemoMap = appConfig.forcedDemo || !appConfig.hasMapbox;
