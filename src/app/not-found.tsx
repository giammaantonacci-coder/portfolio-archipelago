import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-soft text-2xl font-black text-primary">
        404
      </span>
      <h1 className="text-2xl font-extrabold">Pagina non trovata</h1>
      <p className="max-w-sm text-text-secondary">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <Link href="/" className={buttonVariants()}>
        Torna alla home
      </Link>
    </div>
  );
}
