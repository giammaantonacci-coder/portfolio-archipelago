'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Pannello modale accessibile (dialog) che scorre dal basso su mobile. */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full animate-fade-in flex-col rounded-t-3xl bg-surface shadow-soft-lg outline-none sm:max-w-app sm:rounded-3xl',
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="icon" aria-label="Chiudi" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="safe-bottom border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  );
}
