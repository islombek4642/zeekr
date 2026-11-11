import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Zeekr O'zbekiston — Rasmiy Dilerlik Markazi",
  description: "Zeekr premium elektromobillari O'zbekistonda: 001, 007, 009, X. Rasmiy kafolat, servis va test-drayv.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

