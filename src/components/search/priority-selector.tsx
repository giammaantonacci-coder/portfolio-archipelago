'use client';

import type { Priority } from '@/types';
import { PRIORITIES } from '@/lib/priorities';
import { cn } from '@/lib/utils';

interface PriorityCardProps {
  value: Priority;
  selected: boolean;
  onSelect: (value: Priority) => void;
}

export function PriorityCard({ value, selected, onSelect }: PriorityCardProps) {
  const meta = PRIORITIES.find((p) => p.value === value)!;
  const Icon = meta.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
      className={cn(
        'touch-target flex w-full flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors',
        selected ? 'border-primary bg-purple-soft' : 'border-border bg-surface hover:bg-background',
      )}
    >
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', meta.tone)}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-sm font-bold text-text-primary">{meta.label}</span>
      <span className="text-xs leading-snug text-text-secondary">{meta.description}</span>
    </button>
  );
}

interface PrioritySelectorProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div role="radiogroup" aria-label="Priorità" className="grid grid-cols-2 gap-3">
      {PRIORITIES.map((p) => (
        <PriorityCard
          key={p.value}
          value={p.value}
          selected={value === p.value}
          onSelect={onChange}
        />
      ))}
    </div>
  );
}
