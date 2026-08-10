import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

function getModels() {
  const listingModel = (prisma as any).carListing || (prisma as any).listing || prisma.carListing;
  const sellerModel = (prisma as any).seller || prisma.seller;
  const adTransactionModel = (prisma as any).adCreditTransaction || (prisma as any).adTransaction;
  return { listingModel, sellerModel, adTransactionModel };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { listingModel, sellerModel, adTransactionModel } = getModels();

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
        { error: 'Forbidden: You do not have permission to feature this listing' },
        { status: 403 }
      );
    }

    // Check credits
    if ((seller.adCredits || 0) < 1) {
      return NextResponse.json(
        { error: 'Insufficient ad credits. Please purchase ad credits to feature this listing.' },
        { status: 402 }
      );
    }

    const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Deduct 1 credit and feature the listing
    const [updatedSeller, updatedListing] = await prisma.$transaction([
      sellerModel.update({
        where: { id: seller.id },
        data: { adCredits: { decrement: 1 } },
      }),
      listingModel.update({
        where: { id },
        data: {
          isFeatured: true,
          featuredUntil,
        },
      }),
    ]);

    // Create ad credit transaction record if model exists
    if (adTransactionModel) {
      try {
        await adTransactionModel.create({
          data: {
            sellerId: seller.id,
            amount: -1,
            type: 'USAGE',
            description: `Featured listing: ${listing.title || id}`,
          },
        });
      } catch {
        // Ignore if optional transaction logging model fails
      }
    }

    return NextResponse.json(
      {
        message: 'Listing featured successfully for 7 days',
        listing: updatedListing,
        remainingCredits: updatedSeller.adCredits,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error in POST /api/listings/${params?.id}/feature:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
