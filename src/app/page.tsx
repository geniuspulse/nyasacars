import React from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, MessageSquare, Car, ArrowRight, Store, CheckCircle, Award, Star } from 'lucide-react';
import { prisma, MOCK_CARS, MOCK_SELLERS } from '@/lib/prisma';
import SearchBar from '@/components/SearchBar';
import CarCard from '@/components/CarCard';
import { CarListingWithSeller, Seller } from '@/types';

export const revalidate = 60; // Refresh cache every minute

export default async function HomePage() {
  let featuredCars: CarListingWithSeller[] = [];
  let featuredSellers: Seller[] = [];

  try {
    const carsResult = await prisma.carListing.findMany({
      where: {
        status: 'ACTIVE',
      },
      take: 6,
      include: {
        seller: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const sellersResult = await prisma.seller.findMany({
      take: 4,
      orderBy: { createdAt: 'asc' },
    });

    if (carsResult && carsResult.length > 0) {
      featuredCars = carsResult as unknown as CarListingWithSeller[];
    } else {
      featuredCars = MOCK_CARS.slice(0, 6);
    }

    if (sellersResult && sellersResult.length > 0) {
      featuredSellers = sellersResult as unknown as Seller[];
    } else {
      featuredSellers = MOCK_SELLERS;
    }
  } catch (error) {
    console.warn('Prisma query fallback to mock data:', error);
    featuredCars = MOCK_CARS.slice(0, 6);
    featuredSellers = MOCK_SELLERS;
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-nyasa-950 via-nyasa-900 to-nyasa-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,106,106,0.3),transparent)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 rounded-full bg-nyasa-800/80 px-4 py-1.5 text-xs font-semibold text-nyasa-100 border border-nyasa-600/50 backdrop-blur-md">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Malawi&apos;s Premier Multi-Tenant Vehicle Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Find Your Next Car in <span className="text-nyasa-500">Malawi</span>
          </h1>

          <p className="text-base sm:text-lg text-nyasa-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Browse verified Japanese direct imports, SUVs, trucks, and pre-owned vehicles from top dealerships in Lilongwe, Blantyre, Mzuzu, and Zomba.
          </p>

          {/* Hero Search Bar Component */}
          <div className="pt-6">
            <SearchBar />
          </div>

          {/* Trust stats row */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-center border-t border-nyasa-800/60 mt-10">
            <div>
              <p className="text-2xl font-black text-white">5,000+</p>
              <p className="text-xs text-nyasa-100/70">Listed Vehicles</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">120+</p>
              <p className="text-xs text-nyasa-100/70">Verified Sellers</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">3 Main Cities</p>
              <p className="text-xs text-nyasa-100/70">LL • BT • MZ</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-nyasa-100/70">Direct Seller Contact</p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED CARS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold text-nyasa-700 tracking-wider uppercase">Handpicked Inventory</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Featured Vehicles
              </h2>
            </div>
            <Link
              href="/cars"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-nyasa-700 hover:text-nyasa-800 transition"
            >
              <span>Explore All Vehicles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Cars Grid */}
          {featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
              <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No featured cars available right now</h3>
              <p className="text-sm text-slate-500 mt-1">Check back soon or browse our full vehicle inventory.</p>
              <Link
                href="/cars"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-nyasa-700 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-nyasa-800"
              >
                Browse All Cars
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-nyasa-700 tracking-wider uppercase">Simple &amp; Transparent</span>
            <h2 className="text-3xl font-black text-slate-900">How NyasaCars Works</h2>
            <p className="text-slate-600 text-sm">
              Connecting buyers directly with verified dealership showrooms and private car owners in 3 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition">
              <div className="h-14 w-14 rounded-2xl bg-nyasa-100 text-nyasa-700 flex items-center justify-center font-bold text-xl shadow-inner">
                <Search className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-nyasa-700 uppercase tracking-widest">Step 01</span>
              <h3 className="text-lg font-bold text-slate-900">Search &amp; Filter</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by make, model, year, transmission, price range in MWK, or location across Lilongwe, Blantyre, and Mzuzu.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition">
              <div className="h-14 w-14 rounded-2xl bg-nyasa-100 text-nyasa-700 flex items-center justify-center font-bold text-xl shadow-inner">
                <MessageSquare className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-nyasa-700 uppercase tracking-widest">Step 02</span>
              <h3 className="text-lg font-bold text-slate-900">Direct Communication</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Send instant inquiries directly to the seller or call the dealership directly without middleman markups.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition">
              <div className="h-14 w-14 rounded-2xl bg-nyasa-100 text-nyasa-700 flex items-center justify-center font-bold text-xl shadow-inner">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-xs font-bold text-nyasa-700 uppercase tracking-widest">Step 03</span>
              <h3 className="text-lg font-bold text-slate-900">Inspect &amp; Purchase</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Verify physical logbooks, arrange a test drive with the dealership, and complete your transaction smoothly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FEATURED SELLERS / MINISHOPS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold text-nyasa-700 tracking-wider uppercase">Verified Partners</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Featured Dealerships
              </h2>
            </div>
            <Link
              href="/sellers"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-nyasa-700 hover:text-nyasa-800 transition"
            >
              <span>Explore All Minishops</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSellers.map((seller) => (
              <Link
                key={seller.id}
                href={`/sellers/${seller.shopSlug}`}
                className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-nyasa-200 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={seller.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                      alt={seller.shopName}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-nyasa-700 transition truncate text-base">
                          {seller.shopName}
                        </h3>
                        {seller.isVerified && (
                          <CheckCircle className="h-4 w-4 text-nyasa-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{seller.location}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {seller.shopDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9 (20)</span>
                  </div>
                  <span className="font-bold text-nyasa-700 group-hover:underline">
                    View Minishop &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* FOR SELLERS CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-nyasa-950 via-nyasa-900 to-nyasa-800 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl bg-nyasa-900/60 border border-nyasa-700/50 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-2 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-nyasa-700 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                <Store className="h-3.5 w-3.5" />
                For Dealers &amp; Private Sellers
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight text-white">
                Sell Your Vehicle on NyasaCars
              </h2>
              <p className="text-nyasa-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                Open your official dealership minishop, manage inventory in real-time, get direct inquiries on phone and email, and connect with serious car buyers across Malawi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/sellers"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-nyasa-900 shadow-lg hover:bg-nyasa-50 transition"
              >
                <Store className="h-4 w-4 text-nyasa-700" />
                <span>Create Seller Account</span>
              </Link>
              <Link
                href="/sellers"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-nyasa-600 bg-nyasa-800/80 px-6 py-3.5 text-sm font-bold text-white hover:bg-nyasa-700 transition"
              >
                <span>Learn Dealer Benefits</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
