import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export const dynamic = 'force-dynamic';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NyasaCars — Buy and Sell Cars in Malawi',
  description:
    'Malawi\'s premier multi-tenant car marketplace. Discover new and pre-owned Toyota, Nissan, Honda, SUVs, trucks and luxury cars from verified dealerships and private sellers in Lilongwe, Blantyre, and Mzuzu.',
  keywords: [
    'Cars in Malawi',
    'NyasaCars',
    'Buy car Lilongwe',
    'Buy car Blantyre',
    'Toyota Malawi',
    'Malawi car marketplace',
    'Direct imports Malawi',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased`}>
        <Navbar />
        <main className="flex-1 w-full"><Providers>{children}</Providers></main>
        <Footer />
      </body>
    </html>
  );
}
