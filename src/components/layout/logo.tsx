import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-bold', className)}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-soft"
      >
        P
      </span>
      <span className="text-xl tracking-tight text-text-primary">Parqo</span>
    </span>
  );
}
