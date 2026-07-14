import { NextResponse } from 'next/server';
import { buildOverpassQuery, overpassToParkings, type OverpassElement } from '@/lib/osm/parse';

export const runtime = 'nodejs';

const OVERPASS = 'https://overpass-api.de/api/interpreter';

function num(value: string | null): number | undefined {
  if (value === null) return undefined;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Parcheggi reali via Overpass (OpenStreetMap) entro un raggio dalla destinazione.
 * Distanze/tempi sono derivati dalle coordinate reali; le tariffe assenti restano
 * marcate come non note (nessun prezzo inventato).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const lat = num(searchParams.get('lat'));
  const lng = num(searchParams.get('lng'));
  const radius = num(searchParams.get('radius')) ?? 800;
  const duration = num(searchParams.get('duration')) ?? 120;
  const originLat = num(searchParams.get('originLat'));
  const originLng = num(searchParams.get('originLng'));

  if (lat === undefined || lng === undefined) {
    return NextResponse.json({ error: 'missing_coordinates' }, { status: 400 });
  }

  const query = buildOverpassQuery(lat, lng, radius);

  try {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'overpass_failed' }, { status: 502 });
    }
    const data = (await res.json()) as { elements?: OverpassElement[] };
    const parkings = overpassToParkings(data.elements ?? [], {
      destination: { latitude: lat, longitude: lng },
      origin:
        originLat !== undefined && originLng !== undefined
          ? { latitude: originLat, longitude: originLng }
          : undefined,
      durationMinutes: duration,
    });
    return NextResponse.json({ parkings });
  } catch {
    return NextResponse.json({ error: 'overpass_unreachable' }, { status: 502 });
  }
}
