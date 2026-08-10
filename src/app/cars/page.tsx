import React from 'react';
import Link from 'next/link';
import { prisma, MOCK_CARS } from '@/lib/prisma';
import CarCard from '@/components/CarCard';
import FilterSidebar from '@/components/FilterSidebar';
import SortDropdown from '@/components/SortDropdown';
import { CarListingWithSeller } from '@/types';
import { Car, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const revalidate = 30;

interface CarsPageProps {
  searchParams: {
    make?: string;
    model?: string;
    bodyType?: string;
    transmission?: string;
    fuelType?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
    page?: string;
  };
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;

  const make = searchParams.make;
  const model = searchParams.model;
  const bodyType = searchParams.bodyType;
  const transmission = searchParams.transmission;
  const fuelType = searchParams.fuelType;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const condition = searchParams.condition;
  const sort = searchParams.sort || 'newest';

  // Construct Prisma orderBy
  let orderBy: Record<string, string> = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'mileage_asc') orderBy = { mileage: 'asc' };

  let cars: CarListingWithSeller[] = [];
  let totalCount = 0;

  try {
    const bodyTypesArr = bodyType ? bodyType.split(',') : undefined;
    const transmissionsArr = transmission ? transmission.split(',') : undefined;
    const fuelTypesArr = fuelType ? fuelType.split(',') : undefined;

    const whereClause: any = {
      status: 'ACTIVE',
      ...(make ? { make: { contains: make, mode: 'insensitive' } } : {}),
      ...(model ? { model: { contains: model, mode: 'insensitive' } } : {}),
      ...(bodyTypesArr && bodyTypesArr.length > 0 ? { bodyType: { in: bodyTypesArr } } : {}),
      ...(transmissionsArr && transmissionsArr.length > 0 ? { transmission: { in: transmissionsArr } } : {}),
      ...(fuelTypesArr && fuelTypesArr.length > 0 ? { fuelType: { in: fuelTypesArr } } : {}),
      ...(condition ? { condition } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    };

    const [dbCars, count] = await Promise.all([
      prisma.carListing.findMany({
        where: whereClause,
        include: { seller: true },
        orderBy,
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.carListing.count({ where: whereClause }),
    ]);

    cars = dbCars as unknown as CarListingWithSeller[];
    totalCount = count;
  } catch (err) {
    console.warn('Prisma query error, filtering mock data:', err);
  }

  // Fallback to MOCK_CARS filtering if DB is empty or unmigrated
  if (cars.length === 0 && totalCount === 0) {
    let filtered = [...MOCK_CARS];

    if (make) {
      filtered = filtered.filter((c) => c.make.toLowerCase().includes(make.toLowerCase()));
    }
    if (model) {
      filtered = filtered.filter((c) => c.model.toLowerCase().includes(model.toLowerCase()));
    }
    if (bodyType) {
      const btArr = bodyType.split(',');
      filtered = filtered.filter((c) => btArr.includes(c.bodyType));
    }
    if (transmission) {
      const transArr = transmission.split(',');
      filtered = filtered.filter((c) => transArr.includes(c.transmission));
    }
    if (fuelType) {
      const ftArr = fuelType.split(',');
      filtered = filtered.filter((c) => ftArr.includes(c.fuelType));
    }
    if (condition) {
      filtered = filtered.filter((c) => c.condition === condition);
    }
    if (minPrice !== undefined) {
      filtered = filtered.filter((c) => c.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((c) => c.price <= maxPrice);
    }

    // Sort mock data
    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'mileage_asc') filtered.sort((a, b) => a.mileage - b.mileage);
    else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    totalCount = filtered.length;
    cars = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Build helper to generate pagination URLs
  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value);
    });
    params.set('page', pageNum.toString());
    return `/cars?${params.toString()}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Page Title & Breadcrumb */}
        <div className="space-y-1 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-nyasa-700">Home</Link>
            <span>/</span>
            <span className="text-nyasa-700 font-bold">Browse Cars</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Browse Vehicles in Malawi
            </h1>
            <span className="text-sm font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm self-start sm:self-auto">
              {totalCount} {totalCount === 1 ? 'car' : 'cars'} available
            </span>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>

          {/* Right Column: Listings Header & Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar: Results count & Sort dropdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">
                Showing{' '}
                <span className="text-slate-900 font-bold">
                  {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="text-slate-900 font-bold">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                of <span className="text-nyasa-700 font-bold">{totalCount}</span> results
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 shrink-0">Sort By:</span>
                <SortDropdown currentSort={sort} />
              </div>
            </div>

            {/* Cars Grid */}
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="h-16 w-16 bg-nyasa-50 text-nyasa-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Car className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No vehicles match your search criteria</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Try adjusting your price range, clearing specific body types or makes to discover more cars across Malawi.
                </p>
                <div className="pt-2">
                  <Link
                    href="/cars"
                    className="inline-flex items-center gap-2 rounded-xl bg-nyasa-700 px-6 py-3 text-sm font-bold text-white shadow hover:bg-nyasa-800 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Clear All Filters</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-2 shadow-sm">
                
                {/* Prev Button */}
                {currentPage > 1 ? (
                  <Link
                    href={createPageUrl(currentPage - 1)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-nyasa-700 hover:text-nyasa-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-300 px-3 py-2 cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </span>
                )}

                {/* Page Number Indicators */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={createPageUrl(p)}
                      className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-bold transition ${
                        p === currentPage
                          ? 'bg-nyasa-700 text-white shadow'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>

                {/* Next Button */}
                {currentPage < totalPages ? (
                  <Link
                    href={createPageUrl(currentPage + 1)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-nyasa-700 hover:text-nyasa-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-300 px-3 py-2 cursor-not-allowed">
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
