import { NextResponse } from 'next/server';
import type { GeoLocation } from '@/types';

export const runtime = 'nodejs';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'Parqo/0.1 (assistente parcheggio; contatto: parqo.app)';

interface NominatimResult {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

/**
 * Geocoding reale via Nominatim (OpenStreetMap). Chiamato lato client tramite
 * same-origin: il server aggiunge lo User-Agent richiesto e mette in cache.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] as GeoLocation[] });
  }

  const url = new URL(NOMINATIM);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'it' },
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'geocoding_failed' }, { status: 502 });
    }
    const data = (await res.json()) as NominatimResult[];
    const results: GeoLocation[] = data.map((r) => ({
      name: r.name || r.display_name.split(',')[0] || query,
      address: r.display_name,
      coordinates: { latitude: Number.parseFloat(r.lat), longitude: Number.parseFloat(r.lon) },
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'geocoding_unreachable' }, { status: 502 });
  }
}
