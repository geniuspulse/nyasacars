import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma, MOCK_SELLERS, MOCK_CARS } from '@/lib/prisma';
import CarCard from '@/components/CarCard';
import { Seller, CarListingWithSeller } from '@/types';
import {
  Store,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Car,
  Star,
  ShieldCheck,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export const revalidate = 30;

interface SellerMinishopPageProps {
  params: {
    slug: string;
  };
}

async function getSellerWithListings(slug: string): Promise<{ seller: Seller; listings: CarListingWithSeller[] } | null> {
  try {
    const seller = await prisma.seller.findUnique({
      where: { shopSlug: slug },
      include: {
        user: { select: { phone: true, email: true, name: true } },
        listings: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (seller) {
      const formattedSeller = seller as unknown as Seller;
      const formattedListings = (seller.listings || []).map((listing: any) => ({
        ...listing,
        seller: formattedSeller,
      })) as CarListingWithSeller[];

      return {
        seller: formattedSeller,
        listings: formattedListings,
      };
    }
  } catch (err) {
    console.warn('Prisma getSeller error, falling back to mock data:', err);
  }

  // Mock fallback
  const mockSeller = MOCK_SELLERS.find((s) => s.shopSlug === slug);
  if (!mockSeller) return null;

  const mockListings = MOCK_CARS.filter(
    (c) => c.sellerId === mockSeller.id || c.seller?.shopSlug === slug
  );

  return {
    seller: mockSeller,
    listings: mockListings,
  };
}

export async function generateMetadata({ params }: SellerMinishopPageProps): Promise<Metadata> {
  const data = await getSellerWithListings(params.slug);
  if (!data) {
    return {
      title: 'Dealership Not Found — NyasaCars',
    };
  }

  const { seller, listings } = data;
  return {
    title: `${seller.shopName} — Vehicles for Sale in ${seller.location} | NyasaCars`,
    description: seller.shopDescription || `Browse ${listings.length} verified cars for sale at ${seller.shopName} in ${seller.location}, Malawi.`,
  };
}

export default async function SellerMinishopPage({ params }: SellerMinishopPageProps) {
  const data = await getSellerWithListings(params.slug);

  if (!data) {
    notFound();
  }

  const { seller, listings } = data;

  const coverImage =
    seller.coverImage ||
    'https://images.unsplash.com/photo-1562519819-016930ada31b?w=1600&auto=format&fit=crop&q=80';

  const logoImage =
    seller.logo ||
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80';

  const memberYear = seller.createdAt ? new Date(seller.createdAt).getFullYear() : 2023;

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* SHOP COVER BANNER HEADER */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
        <img
          src={coverImage}
          alt={seller.shopName}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Back Link Overlay */}
        <div className="absolute top-4 left-4 sm:left-8 z-10">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Listings</span>
          </Link>
        </div>
      </div>

      {/* SHOP PROFILE CARD OVERLAY */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Logo + Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={logoImage}
                alt={seller.shopName}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
              />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {seller.shopName}
                  </h1>
                  {seller.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-nyasa-50 border border-nyasa-200 text-nyasa-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="h-3.5 w-3.5 text-nyasa-700" />
                      Verified Dealer
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-nyasa-700 shrink-0" />
                  <span>{seller.location}</span>
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium pt-1">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {seller.rating || '4.9'} ({seller.reviewCount || '25'} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Member since {memberYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
              {seller.user?.phone && (
                <a
                  href={`tel:${seller.user?.phone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-nyasa-700 px-5 py-3 text-sm font-bold text-white shadow hover:bg-nyasa-800 transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Dealership</span>
                </a>
              )}
              {seller.user?.email && (
                <a
                  href={`mailto:${seller.user?.email}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
                >
                  <Mail className="h-4 w-4 text-nyasa-700" />
                  <span>Email Shop</span>
                </a>
              )}
            </div>

          </div>

          {/* Description */}
          {seller.shopDescription && (
            <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {seller.shopDescription}
            </p>
          )}

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-semibold">Active Inventory</span>
              <span className="text-xl font-black text-nyasa-700">{listings.length} Cars</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-semibold">Location</span>
              <span className="text-sm font-bold text-slate-900 truncate block mt-0.5">{seller.location}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-semibold">Status</span>
              <span className="text-sm font-bold text-emerald-600 block mt-0.5">Open &amp; Verified</span>
            </div>
          </div>

        </div>

        {/* INVENTORY GRID SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Vehicles Available at {seller.shopName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All vehicles inspected and offered directly by this dealer
              </p>
            </div>
            <span className="text-xs font-bold text-nyasa-700 bg-nyasa-50 px-3 py-1 rounded-full border border-nyasa-200">
              {listings.length} Listings
            </span>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            /* Empty state if dealer has no active listings */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <Car className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No active vehicles listed currently</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This dealer currently has no active inventory. Check back soon or contact them directly.
              </p>
              <div className="pt-2">
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-2 rounded-xl bg-nyasa-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-nyasa-800"
                >
                  Browse Other Cars in Malawi
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
