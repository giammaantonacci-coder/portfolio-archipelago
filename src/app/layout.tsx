import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceWorkerRegister } from '@/components/service-worker-register';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Parqo — Parcheggiare meglio, ogni giorno',
    template: '%s · Parqo',
  },
  description:
    'Parqo confronta prezzo, distanza, tempi e comodità per consigliarti il parcheggio più adatto.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Parqo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Parqo',
  },
};

export const viewport: Viewport = {
  themeColor: '#6754F4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.variable}>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
