import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma, MOCK_SELLERS, MOCK_CARS } from '@/lib/prisma';
import SellerStorefront from '@/components/SellerStorefront';

export const revalidate = 30;

interface SellerMinishopPageProps {
  params: {
    slug: string;
  };
}

async function getSellerWithListings(slug: string) {
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
      // Serialize for client component (convert Decimal/Dates to plain types)
      const serializedSeller = {
        id: seller.id,
        shopName: seller.shopName,
        shopSlug: seller.shopSlug,
        shopDescription: seller.shopDescription,
        logo: seller.logo,
        coverImage: seller.coverImage,
        isVerified: seller.isVerified,
        location: seller.location,
        plan: seller.plan,
        whatsapp: (seller as any).whatsapp,
        address: (seller as any).address,
        specialties: (seller as any).specialties || [],
        businessHours: (seller as any).businessHours,
        socialLinks: (seller as any).socialLinks,
        totalSold: (seller as any).totalSold || 0,
        totalViews: (seller as any).totalViews || 0,
        createdAt: seller.createdAt.toISOString(),
        user: seller.user,
      };

      const serializedListings = (seller.listings || []).map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        price: Number(listing.price),
        currency: listing.currency,
        condition: listing.condition,
        bodyType: listing.bodyType,
        transmission: listing.transmission,
        fuelType: listing.fuelType,
        mileage: listing.mileage,
        color: listing.color,
        location: listing.location,
        images: listing.images || [],
        status: listing.status,
        isFeatured: listing.isFeatured,
        views: listing.views,
        createdAt: listing.createdAt.toISOString(),
        seller: serializedSeller,
      }));

      return { seller: serializedSeller, listings: serializedListings };
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

  // Serialize mock data
  const serializedSeller = {
    id: mockSeller.id,
    shopName: mockSeller.shopName,
    shopSlug: mockSeller.shopSlug,
    shopDescription: mockSeller.shopDescription,
    logo: mockSeller.logo,
    coverImage: mockSeller.coverImage,
    isVerified: mockSeller.isVerified,
    location: mockSeller.location,
    plan: mockSeller.plan,
    whatsapp: (mockSeller as any).whatsapp || null,
    address: (mockSeller as any).address || null,
    specialties: (mockSeller as any).specialties || [],
    businessHours: (mockSeller as any).businessHours || null,
    socialLinks: (mockSeller as any).socialLinks || null,
    totalSold: (mockSeller as any).totalSold || 0,
    totalViews: (mockSeller as any).totalViews || 0,
    createdAt: new Date(mockSeller.createdAt).toISOString(),
    user: {
      phone: mockSeller.user?.phone || null,
      email: mockSeller.user?.email || null,
      name: mockSeller.user?.name || null,
    },
  };

  const serializedListings = mockListings.map((car: any) => ({
    id: car.id,
    title: car.title,
    make: car.make,
    model: car.model,
    year: car.year,
    price: Number(car.price),
    currency: car.currency || 'MWK',
    condition: car.condition,
    bodyType: car.bodyType,
    transmission: car.transmission,
    fuelType: car.fuelType,
    mileage: car.mileage,
    color: car.color,
    location: car.location,
    images: car.images || [],
    status: car.status,
    isFeatured: car.isFeatured,
    views: car.views,
    createdAt: new Date(car.createdAt).toISOString(),
    seller: serializedSeller,
  }));

  return { seller: serializedSeller, listings: serializedListings };
}

export async function generateMetadata({ params }: SellerMinishopPageProps): Promise<Metadata> {
  const data = await getSellerWithListings(params.slug);
  if (!data) {
    return { title: 'Dealership Not Found — NyasaCars' };
  }

  const { seller, listings } = data;
  return {
    title: `${seller.shopName} — Vehicles for Sale in ${seller.location || 'Malawi'} | NyasaCars`,
    description: seller.shopDescription || `Browse ${listings.length} verified cars for sale at ${seller.shopName} in ${seller.location || 'Malawi'}.`,
  };
}

export default async function SellerMinishopPage({ params }: SellerMinishopPageProps) {
  const data = await getSellerWithListings(params.slug);

  if (!data) {
    notFound();
  }

  return <SellerStorefront seller={data.seller as any} listings={data.listings as any} />;
}
