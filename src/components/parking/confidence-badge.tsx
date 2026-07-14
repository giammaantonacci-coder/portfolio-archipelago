import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import type { DataConfidence } from '@/types';
import { Badge } from '@/components/ui/badge';

const CONFIG: Record<
  DataConfidence,
  { label: string; tone: 'green' | 'yellow' | 'pink'; icon: typeof Shield }
> = {
  high: { label: 'Dato verificato', tone: 'green', icon: ShieldCheck },
  medium: { label: 'Dato affidabile', tone: 'yellow', icon: Shield },
  low: { label: 'Dato stimato', tone: 'pink', icon: ShieldAlert },
};

export function ConfidenceBadge({ confidence }: { confidence: DataConfidence }) {
  const { label, tone, icon: Icon } = CONFIG[confidence];
  return (
    <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Badge>
  );
}
