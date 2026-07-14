'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/utils';

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigazione principale"
      className="bg-surface/95 safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-app items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'touch-target flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium',
                  active ? 'text-primary' : 'text-text-secondary',
                )}
              >
                <Icon className="h-6 w-6" aria-hidden strokeWidth={active ? 2.4 : 1.8} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
