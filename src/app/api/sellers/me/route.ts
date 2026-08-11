import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const updateSellerSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').optional(),
  shopDescription: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  location: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  businessHours: z.record(z.string()).optional(),
  socialLinks: z.record(z.string()).optional(),
});

function generateShopSlug(shopName: string): string {
  const base = shopName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || 'shop'}-${randomSuffix}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
      include: {
        user: { select: { phone: true, email: true, name: true } },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    const [listingCount, totalViewsAgg, inquiryCount, soldCount] = await Promise.all([
      prisma.carListing.count({
        where: { sellerId: seller.id },
      }),
      prisma.carListing.aggregate({
        where: { sellerId: seller.id },
        _sum: { views: true },
      }),
      prisma.inquiry.count({
        where: {
          carListing: { sellerId: seller.id },
        },
      }),
      prisma.carListing.count({
        where: { sellerId: seller.id, status: 'SOLD' },
      }),
    ]);

    const totalViews = totalViewsAgg._sum.views || 0;

    return NextResponse.json(
      {
        ...seller,
        stats: {
          listingCount,
          totalViews,
          inquiryCount,
          soldCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/sellers/me:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateSellerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate: any = { ...validation.data };

    if (dataToUpdate.shopName && dataToUpdate.shopName !== seller.shopName) {
      dataToUpdate.shopSlug = generateShopSlug(dataToUpdate.shopName);
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedSeller, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/sellers/me:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.seller.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Seller profile already exists', seller: existing },
        { status: 409 }
      );
    }

    const body = await req.json();
    const validation = z.object({
      shopName: z.string().min(2, 'Shop name is required'),
      shopDescription: z.string().optional(),
      location: z.string().optional(),
      logo: z.string().optional(),
      coverImage: z.string().optional(),
      whatsapp: z.string().optional(),
      address: z.string().optional(),
      specialties: z.array(z.string()).optional(),
    }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const shopSlug = generateShopSlug(validation.data.shopName);

    const newSeller = await prisma.seller.create({
      data: {
        ...validation.data,
        shopSlug,
        userId: session.user.id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'SELLER' },
    });

    return NextResponse.json(newSeller, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/sellers/me:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
