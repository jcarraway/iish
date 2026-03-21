import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'IISH — Personalized Cancer Vaccine Trial Matching',
  description: 'Find personalized cancer vaccine clinical trials matched to your specific diagnosis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <header className="border-b">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-bold">
                IISH
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground">
                  Learn
                </Link>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/manufacture" className="text-sm text-muted-foreground hover:text-foreground">
                  Manufacture
                </Link>
                <Link href="/auth" className="text-sm font-medium">
                  Sign In
                </Link>
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
