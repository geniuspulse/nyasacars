import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gauge, Fuel, MapPin, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import { CarListingWithSeller } from '@/types';

interface CarCardProps {
  car: CarListingWithSeller;
}

export default function CarCard({ car }: CarCardProps) {
  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const primaryImage = car.images && car.images.length > 0 
    ? car.images[0] 
    : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80';

  const sellerName = car.seller?.shopName || car.seller?.shopName || 'Verified Dealer';

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group border border-slate-200/90 rounded-lg shadow hover:shadow-md transition-all duration-200 bg-white overflow-hidden flex flex-col h-full hover:border-nyasa-200"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {car.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-nyasa-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
          <span
            className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md shadow backdrop-blur-md ${
              car.condition === 'NEW'
                ? 'bg-emerald-600/90 text-white'
                : car.condition === 'CERTIFIED_PRE_OWNED'
                ? 'bg-blue-600/90 text-white'
                : 'bg-slate-900/80 text-slate-100'
            }`}
          >
            {car.condition}
          </span>
        </div>

        {/* Location badge on image */}
        {car.location && (
          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded flex items-center gap-1 font-medium">
            <MapPin className="h-3 w-3 text-nyasa-500" />
            <span>{car.location}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-nyasa-700 transition-colors line-clamp-1">
            {car.year} {car.make} {car.model}
          </h3>

          {/* Price */}
          <p className="mt-1 text-lg font-black text-nyasa-700">
            {formatPrice(car.price)}
          </p>

          {/* Key specs */}
          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600 border-t border-b border-slate-100 py-2">
            <div className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span>{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5 text-slate-400" />
              <span>{car.transmission || 'Auto'} • {car.fuelType || 'Petrol'}</span>
            </div>
          </div>
        </div>

        {/* Seller Info Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 truncate max-w-[85%]">
            <Store className="h-3.5 w-3.5 text-nyasa-700 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">{sellerName}</span>
            {car.seller?.isVerified && (
              <CheckCircle2 className="h-3.5 w-3.5 text-nyasa-600 shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-nyasa-700 font-semibold group-hover:underline shrink-0">
            Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
