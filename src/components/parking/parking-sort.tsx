'use client';

import { ArrowUpDown } from 'lucide-react';
import { SORT_LABELS, type SortKey } from '@/lib/filters';
import { Select } from '@/components/ui/select';

interface ParkingSortProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

export function ParkingSort({ value, onChange }: ParkingSortProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Ordina per</span>
      <ArrowUpDown className="h-4 w-4 text-text-secondary" aria-hidden />
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-10 w-auto min-w-[140px] text-sm"
      >
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </Select>
    </label>
  );
}
