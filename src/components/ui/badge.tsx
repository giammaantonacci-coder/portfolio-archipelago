import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
  {
    variants: {
      tone: {
        neutral: 'bg-background text-text-secondary border border-border',
        primary: 'bg-purple-soft text-primary',
        green: 'bg-green-soft text-[#2b8f55]',
        pink: 'bg-pink-soft text-[#c23f6c]',
        blue: 'bg-blue-soft text-[#2f6dbd]',
        yellow: 'bg-[#fff5e5] text-[#b5791b]',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
