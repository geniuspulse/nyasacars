import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Store, MapPin, ShieldCheck, Car, ArrowRight, Search } from 'lucide-react';
import { prisma, MOCK_SELLERS, MOCK_CARS } from '@/lib/prisma';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Car Dealerships in Malawi — NyasaCars',
  description: 'Browse verified car dealerships across Lilongwe, Blantyre, and Mzuzu. Visit their minishops to see available inventory.',
};

async function getAllSellers() {
  try {
    const sellers = await prisma.seller.findMany({
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
      include: {
        user: { select: { phone: true, email: true, name: true } },
        listings: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
      },
    });

    if (sellers && sellers.length > 0) {
      return sellers.map((s: any) => ({
        id: s.id,
        shopName: s.shopName,
        shopSlug: s.shopSlug,
        shopDescription: s.shopDescription,
        logo: s.logo,
        coverImage: s.coverImage,
        isVerified: s.isVerified,
        location: s.location,
        plan: s.plan,
        createdAt: s.createdAt.toISOString(),
        inventoryCount: s.listings?.length || 0,
      }));
    }
  } catch (err) {
    console.warn('Prisma error, using mock data:', err);
  }

  return MOCK_SELLERS.map((s: any) => ({
    id: s.id,
    shopName: s.shopName,
    shopSlug: s.shopSlug,
    shopDescription: s.shopDescription,
    logo: s.logo,
    coverImage: s.coverImage,
    isVerified: s.isVerified,
    location: s.location,
    plan: s.plan,
    createdAt: new Date(s.createdAt).toISOString(),
    inventoryCount: MOCK_CARS.filter((c: any) => c.sellerId === s.id).length,
  }));
}

export default async function SellersPage() {
  const sellers = await getAllSellers();

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-nyasa-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-nyasa-800/80 px-4 py-1.5 text-xs font-semibold text-nyasa-100 border border-nyasa-600/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Verified Dealerships</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Car Dealerships in Malawi
          </h1>
          <p className="text-sm text-nyasa-100/80 max-w-xl mx-auto">
            Browse verified dealerships across Lilongwe, Blantyre, and Mzuzu. Visit their minishops to see full inventory.
          </p>
        </div>
      </div>

      {/* Dealer Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        {sellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller: any) => (
              <Link
                key={seller.id}
                href={`/sellers/${seller.shopSlug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-nyasa-200 transition-all duration-200"
              >
                {/* Cover */}
                <div className="relative h-28 bg-slate-800 overflow-hidden">
                  <img
                    src={seller.coverImage || 'https://images.unsplash.com/photo-1562519819-016930ada31b?w=600&auto=format&fit=crop&q=80'}
                    alt={seller.shopName}
                    className="h-full w-full object-cover opacity-70 group-hover:opacity-90 transition"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  {seller.isVerified && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={seller.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=80'}
                      alt={seller.shopName}
                      className="h-14 w-14 rounded-xl object-cover border-2 border-white shadow -mt-8 shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1 pt-1">
                      <h2 className="font-bold text-slate-900 group-hover:text-nyasa-700 transition truncate text-lg">
                        {seller.shopName}
                      </h2>
                      {seller.location && (
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {seller.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {seller.shopDescription && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {seller.shopDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-nyasa-700 bg-nyasa-50 px-2.5 py-1 rounded-full border border-nyasa-100">
                      <Car className="h-3.5 w-3.5" />
                      {seller.inventoryCount} {seller.inventoryCount === 1 ? 'vehicle' : 'vehicles'}
                    </span>
                    <span className="text-xs font-bold text-nyasa-700 group-hover:underline flex items-center gap-1">
                      Visit Minishop
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Store className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No dealerships yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Be the first dealership to join NyasaCars and get your own minishop.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-nyasa-700 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-nyasa-800 transition"
            >
              Create Seller Account
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-nyasa-950 to-nyasa-800 rounded-2xl p-8 text-center text-white space-y-4">
          <Store className="h-10 w-10 text-nyasa-400 mx-auto" />
          <h2 className="text-xl sm:text-2xl font-black">Are you a car dealer in Malawi?</h2>
          <p className="text-sm text-nyasa-100/80 max-w-lg mx-auto">
            Join NyasaCars and get your own branded minishop. List unlimited vehicles, manage inquiries, and reach buyers nationwide.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-nyasa-900 shadow-lg hover:bg-nyasa-50 transition"
          >
            Create Seller Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
