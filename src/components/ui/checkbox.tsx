import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  label: string;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, id, label, className }: CheckboxProps) {
  return (
    <label
      className={cn(
        'touch-target flex cursor-pointer select-none items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-background',
        checked && 'border-primary bg-purple-soft',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-surface',
          checked && 'border-primary bg-primary text-white',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </label>
  );
}
