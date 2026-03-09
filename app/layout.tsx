import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

// 1. Configure the Inter font
const inter = Inter({ subsets: ['latin'] });

// 2. Update the metadata for SEO and browser tabs
export const metadata: Metadata = {
  title: 'IPC Battlegrounds | Honkai Star Rail PvP',
  description: 'Drafting interface and team builder for Honkai Star Rail PvP matches.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      {/* 3. Apply the font class globally to the body */}
      <body className={inter.className}>
        {/* Providers wrapper for SpacetimeDB connection and context */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}