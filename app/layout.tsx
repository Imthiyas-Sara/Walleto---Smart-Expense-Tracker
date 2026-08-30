import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // ← This must be here
import { Providers } from './providers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Walleto - Expense Tracker',
  description: 'Track your expenses, manage your budget, and achieve your financial goals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}