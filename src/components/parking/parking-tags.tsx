import { Badge } from '@/components/ui/badge';

const TAG_TONE: Record<string, 'green' | 'blue' | 'primary' | 'yellow' | 'pink' | 'neutral'> = {
  'No ZTL': 'green',
  Coperto: 'blue',
  Scoperto: 'neutral',
  Prenotabile: 'primary',
  EV: 'green',
  Accessibile: 'blue',
  H24: 'primary',
  'Altezza limitata': 'yellow',
  'Dato verificato': 'green',
  'Dato stimato': 'pink',
};

/** Mostra al massimo 5 tag (requisito di specifica). */
export function ParkingTags({ tags, max = 5 }: { tags: string[]; max?: number }) {
  const visible = tags.slice(0, max);
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Caratteristiche">
      {visible.map((tag) => (
        <li key={tag}>
          <Badge tone={TAG_TONE[tag] ?? 'neutral'}>{tag}</Badge>
        </li>
      ))}
    </ul>
  );
}
