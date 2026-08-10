import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const updateListingSchema = z.object({
  title: z.string().min(3).optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: z.number().positive().optional(),
  mileage: z.number().nonnegative().optional(),
  bodyType: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  condition: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD']).optional(),
});

function getModels() {
  const listingModel = (prisma as any).carListing || (prisma as any).listing || prisma.carListing;
  const sellerModel = (prisma as any).seller || prisma.seller;
  return { listingModel, sellerModel };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { listingModel } = getModels();

    const listing = await listingModel.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            shopName: true,
            shopSlug: true,
            shopDescription: true,
            logo: true,
            coverImage: true,
            phone: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Increment views count asynchronously
    try {
      await listingModel.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    } catch {
      // Ignore increment view error if field doesn't support increment
    }

    return NextResponse.json(listing, { status: 200 });
  } catch (error: any) {
    console.error(`Error in GET /api/listings/${params?.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { listingModel, sellerModel } = getModels();

    const listing = await listingModel.findUnique({ where: { id } });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify ownership
    const seller = await sellerModel.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    if (!seller || listing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify this listing' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = updateListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedListing = await listingModel.update({
      where: { id },
      data: validation.data,
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

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error: any) {
    console.error(`Error in PUT /api/listings/${params?.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { listingModel, sellerModel } = getModels();

    const listing = await listingModel.findUnique({ where: { id } });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify ownership
    const seller = await sellerModel.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    if (!seller || listing.sellerId !== seller.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this listing' },
        { status: 403 }
      );
    }

    await listingModel.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error in DELETE /api/listings/${params?.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
