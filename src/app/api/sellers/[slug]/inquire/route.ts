import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const inquireSchema = z.object({
  buyerName: z.string().min(2, 'Name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerPhone: z.string().min(7, 'Valid phone number is required'),
  message: z.string().min(5, 'Please enter a message'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { shopSlug: params.slug },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const body = await req.json();
    const validation = inquireSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Create inquiry tied to the seller's most recent listing (or first active listing)
    const listing = seller.listings[0];
    if (!listing) {
      return NextResponse.json(
        { error: 'This dealer has no active listings to inquire about' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        carListingId: listing.id,
        buyerName: validation.data.buyerName,
        buyerEmail: validation.data.buyerEmail,
        buyerPhone: validation.data.buyerPhone,
        message: validation.data.message,
      },
    });

    return NextResponse.json(
      { success: true, inquiry, message: 'Inquiry sent successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/sellers/[slug]/inquire:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
