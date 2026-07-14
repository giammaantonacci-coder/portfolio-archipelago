import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieToSet = { name: string; value: string; options: CookieOptions };
import type { SupabaseClient } from '@supabase/supabase-js';
import { appConfig } from '@/lib/config';

/**
 * Client Supabase per server component / route handler.
 * Restituisce null quando Supabase non è configurato (default demo/OSM).
 * Non usa mai la service role key.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!appConfig.hasSupabase) return null;
  const cookieStore = cookies();

  return createServerClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // chiamato da un server component: la sessione viene aggiornata dal middleware
        }
      },
    },
  });
}
