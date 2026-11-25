import type { Metadata } from 'next';
import './globals.css';
import { getCurrentLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: "Zeekr O'zbekiston — Rasmiy Dilerlik Markazi",
  description: "Zeekr premium elektromobillari O'zbekistonda: 001, 007, 009, X. Rasmiy kafolat, servis va test-drayv.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
