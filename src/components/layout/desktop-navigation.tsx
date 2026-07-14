'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <header className="bg-surface/90 sticky top-0 z-40 hidden border-b border-border backdrop-blur lg:block">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-3">
        <Link href="/" aria-label="Parqo home">
          <Logo />
        </Link>
        <nav aria-label="Navigazione principale">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-purple-soft text-primary'
                        : 'text-text-secondary hover:bg-background',
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
