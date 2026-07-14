import { Home, CalendarCheck, Heart, User, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/plans', label: 'Piani', icon: CalendarCheck },
  { href: '/favorites', label: 'Preferiti', icon: Heart },
  { href: '/profile', label: 'Profilo', icon: User },
];
