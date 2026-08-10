import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive('Price must be positive'),
  mileage: z.number().nonnegative().optional(),
  bodyType: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  condition: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  location: z.string().optional(),
});

const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 15,
  PREMIUM: Infinity,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const bodyType = searchParams.get('bodyType');
    const transmission = searchParams.get('transmission');
    const fuelType = searchParams.get('fuelType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 100);

    const pageNum = isNaN(page) || page < 1 ? 1 : page;
    const limitNum = isNaN(limit) || limit < 1 ? 12 : limit;
    const skip = (pageNum - 1) * limitNum;

    // Filter conditions for active listings
    const where: any = {
      status: 'ACTIVE',
    };

    if (make) {
      where.make = { contains: make, mode: 'insensitive' };
    }
    if (model) {
      where.model = { contains: model, mode: 'insensitive' };
    }
    if (bodyType) {
      where.bodyType = { equals: bodyType, mode: 'insensitive' };
    }
    if (transmission) {
      where.transmission = { equals: transmission, mode: 'insensitive' };
    }
    if (fuelType) {
      where.fuelType = { equals: fuelType, mode: 'insensitive' };
    }
    if (condition) {
      where.condition = { equals: condition, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const listingModel = (prisma as any).carListing || (prisma as any).listing || prisma.carListing;

    const [data, total] = await Promise.all([
      listingModel.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          seller: {
            select: {
              id: true,
              shopName: true,
              shopSlug: true,
              logo: true,
              phone: true,
            },
          },
        },
      }),
      listingModel.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return NextResponse.json({
      data,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error in GET /api/listings:', error);
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

    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Forbidden: Only registered sellers can create listings' },
        { status: 403 }
      );
    }

    const sellerModel = (prisma as any).seller || prisma.seller;
    const listingModel = (prisma as any).carListing || (prisma as any).listing || prisma.carListing;

    // Find seller profile
    const seller = await sellerModel.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found. Please register as a seller.' },
        { status: 404 }
      );
    }

    // Check seller plan limits
    const currentListingCount = await listingModel.count({
      where: {
        sellerId: seller.id,
        status: 'ACTIVE',
      },
    });

    const plan = (seller.plan || 'FREE').toUpperCase();
    const maxAllowed = PLAN_LIMITS[plan] ?? 3;

    if (currentListingCount >= maxAllowed) {
      return NextResponse.json(
        {
          error: `Plan limit reached. Your current ${plan} plan allows up to ${maxAllowed} active listings. Please upgrade your plan to add more.`,
          currentCount: currentListingCount,
          limit: maxAllowed,
          plan,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const listing = await listingModel.create({
      data: {
        ...validation.data,
        sellerId: seller.id,
        status: 'ACTIVE',
      },
      include: {
        seller: {
          select: {
            id: true,
            shopName: true,
            shopSlug: true,
            logo: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/listings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
