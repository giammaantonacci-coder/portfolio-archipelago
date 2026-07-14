import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ParkingProsConsProps {
  pros: string[];
  cons: string[];
}

/** Pro in card verde tenue, contro in card rosa tenue (sezione 13). */
export function ParkingProsCons({ pros, cons }: ParkingProsConsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-3xl bg-green-soft p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#2b8f55]">
          <ThumbsUp className="h-4 w-4" aria-hidden />
          Punti a favore
        </h3>
        <ul className="space-y-1.5">
          {pros.length === 0 && <li className="text-sm text-text-secondary">—</li>}
          {pros.map((p) => (
            <li key={p} className="flex gap-2 text-sm text-text-primary">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl bg-pink-soft p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#c23f6c]">
          <ThumbsDown className="h-4 w-4" aria-hidden />
          Da tenere presente
        </h3>
        <ul className="space-y-1.5">
          {cons.length === 0 && (
            <li className="text-sm text-text-secondary">Nessun contro rilevante.</li>
          )}
          {cons.map((c) => (
            <li key={c} className="flex gap-2 text-sm text-text-primary">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
