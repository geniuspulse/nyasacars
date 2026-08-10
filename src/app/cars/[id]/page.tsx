import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { prisma, MOCK_CARS } from '@/lib/prisma';
import CarImageGallery from '@/components/CarImageGallery';
import InquiryForm from '@/components/InquiryForm';
import { CarListingWithSeller } from '@/types';
import {
  Gauge,
  Fuel,
  MapPin,
  Store,
  CheckCircle,
  Eye,
  Calendar,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  ArrowLeft,
  Check,
  Car as CarIcon,
  Tag,
} from 'lucide-react';

export const revalidate = 30;

interface CarDetailPageProps {
  params: {
    id: string;
  };
}

async function getCar(id: string): Promise<CarListingWithSeller | null> {
  try {
    const car = await prisma.carListing.findUnique({
      where: { id },
      include: { seller: true },
    });
    if (car) return car as unknown as CarListingWithSeller;
  } catch (err) {
    console.warn('Prisma getCar error, checking mock data:', err);
  }

  const mockCar = MOCK_CARS.find((c) => c.id === id);
  return mockCar || null;
}

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const car = await getCar(params.id);
  if (!car) {
    return {
      title: 'Vehicle Not Found — NyasaCars',
    };
  }

  const formattedPrice = new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 0,
  }).format(Number(car.price));

  return {
    title: `${car.year} ${car.make} ${car.model} (${formattedPrice}) for Sale in ${car.location} — NyasaCars`,
    description: car.description || `Buy ${car.year} ${car.make} ${car.model} in ${car.location}, Malawi. Mileage: ${car.mileage}km. Price: ${formattedPrice}.`,
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const car = await getCar(params.id);

  if (!car) {
    notFound();
  }

  // Increment view count asynchronously in background
  try {
    await prisma.carListing.update({
      where: { id: car.id },
      data: { views: { increment: 1 } },
    });
  } catch (err) {
    // Ignore error if database is not active
  }

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const seller = car.seller;
  const sellerSlug = seller?.shopSlug || 'capital-motors';

  const defaultFeatures = [
    'Air Conditioning',
    'Power Windows',
    'Alloy Wheels',
    'Bluetooth Connectivity',
    'ABS Brakes',
    'Airbags',
    'Central Locking',
  ];

  const carFeatures = car.features && car.features.length > 0 ? car.features : defaultFeatures;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-nyasa-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Browse Cars</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-3 py-1 rounded-full">
            <Eye className="h-3.5 w-3.5 text-nyasa-700" />
            <span>{car.views || 1} Views</span>
          </div>
        </div>

        {/* Main Grid: Left (Gallery & Details) + Right (Seller & Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
            <CarImageGallery images={car.images} title={`${car.year} ${car.make} ${car.model}`} />

            {/* Title & Price Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {car.isFeatured && (
                  <span className="inline-flex items-center gap-1 bg-nyasa-700 text-white text-xs font-bold px-3 py-1 rounded-md">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Featured Vehicle
                  </span>
                )}
                <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-white">
                  {car.condition}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-nyasa-700" />
                  {car.location}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {car.year} {car.make} {car.model}
                </h1>
                <p className="mt-2 text-3xl font-black text-nyasa-700">
                  {formatPrice(car.price)}
                </p>
              </div>

              {/* Quick specs pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Mileage</span>
                  <span className="font-bold text-slate-900 text-sm">{car.mileage?.toLocaleString() || 'N/A'} km</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Transmission</span>
                  <span className="font-bold text-slate-900 text-sm">{car.transmission || 'Automatic'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Fuel Type</span>
                  <span className="font-bold text-slate-900 text-sm">{car.fuelType || 'Petrol'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">Body Style</span>
                  <span className="font-bold text-slate-900 text-sm">{car.bodyType || 'SUV'}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications Table Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Full Vehicle Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Make</span>
                  <span className="font-bold text-slate-900">{car.make}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Model</span>
                  <span className="font-bold text-slate-900">{car.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Year</span>
                  <span className="font-bold text-slate-900">{car.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Condition</span>
                  <span className="font-bold text-slate-900">{car.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Engine Size</span>
                  <span className="font-bold text-slate-900">{car.engineSize || '2.0L'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Exterior Color</span>
                  <span className="font-bold text-slate-900">{car.color || 'Pearl White'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Mileage</span>
                  <span className="font-bold text-slate-900">{car.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-bold text-slate-900">{car.location}</span>
                </div>
              </div>
            </div>

            {/* Key Features & Accessories Badges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Key Features &amp; Equipment
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {carFeatures.map((feature, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-nyasa-50 text-nyasa-900 border border-nyasa-100 px-3 py-1.5 text-xs font-bold"
                  >
                    <Check className="h-3.5 w-3.5 text-nyasa-700" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Vehicle Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Seller Description
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                {car.description}
              </p>
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="space-y-6">
            
            {/* Seller Minishop Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-nyasa-700 uppercase tracking-wider">
                  Listed By Dealership
                </span>
                {seller?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Dealer
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={seller?.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                  alt={seller?.shopName || 'Seller'}
                  className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {seller?.shopName || seller?.name || 'Capital Motors Malawi'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{seller?.location || car.location}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-700 border-t border-b border-slate-100 py-3">
                {seller?.phone && (
                  <a
                    href={`tel:${seller.phone}`}
                    className="flex items-center gap-2 hover:text-nyasa-700 transition"
                  >
                    <Phone className="h-4 w-4 text-nyasa-700 shrink-0" />
                    <span>{seller.phone}</span>
                  </a>
                )}
                {seller?.email && (
                  <a
                    href={`mailto:${seller.email}`}
                    className="flex items-center gap-2 hover:text-nyasa-700 transition"
                  >
                    <Mail className="h-4 w-4 text-nyasa-700 shrink-0" />
                    <span className="truncate">{seller.email}</span>
                  </a>
                )}
              </div>

              <Link
                href={`/sellers/${sellerSlug}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-nyasa-700 text-nyasa-700 font-bold text-xs py-2.5 px-4 hover:bg-nyasa-50 transition"
              >
                <Store className="h-4 w-4" />
                <span>Visit Seller Minishop</span>
              </Link>
            </div>

            {/* Inquiry Form Component */}
            <InquiryForm carListingId={car.id} carTitle={`${car.year} ${car.make} ${car.model}`} />

          </div>

        </div>

      </div>
    </div>
  );
}
