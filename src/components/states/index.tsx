import * as React from 'react';
import { SearchX, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('flex flex-col items-center gap-3 p-8 text-center', className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-soft text-primary">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {action}
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Non siamo riusciti a completare la ricerca.',
  description = 'Riprova tra poco o modifica la destinazione.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center" role="alert">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-soft text-[#c23f6c]">
        <TriangleAlert className="h-7 w-7" aria-hidden />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Riprova
        </Button>
      )}
    </Card>
  );
}

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex gap-4">
            <div className="skeleton h-20 w-24 rounded-2xl" />
            <div className="flex-1 space-y-2 py-1">
              <div className="skeleton h-4 w-2/3 rounded-full" />
              <div className="skeleton h-3 w-1/2 rounded-full" />
              <div className="skeleton h-3 w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
