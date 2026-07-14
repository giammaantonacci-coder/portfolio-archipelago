import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { appConfig } from '@/lib/config';

let cached: SupabaseClient | null | undefined;

/**
 * Client Supabase lato browser. Restituisce null in modalità demo
 * (nessuna URL/anon key configurata). Non usa mai la service role key.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!appConfig.hasSupabase) {
    cached = null;
    return cached;
  }
  cached = createBrowserClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
  return cached;
}
