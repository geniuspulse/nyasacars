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
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
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

function getModels() {
  const sellerModel = (prisma as any).seller || prisma.seller;
  const listingModel = (prisma as any).carListing || (prisma as any).listing || prisma.carListing;
  const inquiryModel = (prisma as any).inquiry || prisma.inquiry;
  return { sellerModel, listingModel, inquiryModel };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sellerModel, listingModel, inquiryModel } = getModels();

    const seller = await sellerModel.findFirst({
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

    // Compute seller stats
    const [listingCount, totalViewsAgg, inquiryCount] = await Promise.all([
      listingModel.count({
        where: { sellerId: seller.id },
      }),
      listingModel.aggregate({
        where: { sellerId: seller.id },
        _sum: { views: true },
      }),
      inquiryModel.count({
        where: {
          OR: [
            { sellerId: seller.id },
            { listing: { sellerId: seller.id } },
          ],
        },
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

    const { sellerModel } = getModels();

    const seller = await sellerModel.findFirst({
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

    // Regenerate shopSlug if shopName changed
    if (dataToUpdate.shopName && dataToUpdate.shopName !== seller.shopName) {
      dataToUpdate.shopSlug = generateShopSlug(dataToUpdate.shopName);
    }

    const updatedSeller = await sellerModel.update({
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
