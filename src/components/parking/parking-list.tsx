import type { ScoredParking } from '@/types';
import { ParkingCard } from './parking-card';

interface ParkingListProps {
  items: ScoredParking[];
  recommendedId?: string;
}

export function ParkingList({ items, recommendedId }: ParkingListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.parking.id}>
          <ParkingCard item={item} recommended={item.parking.id === recommendedId} />
        </li>
      ))}
    </ul>
  );
}
