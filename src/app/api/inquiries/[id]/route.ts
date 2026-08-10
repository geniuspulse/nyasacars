import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Forbidden: Only sellers can update inquiry status' },
        { status: 403 }
      );
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        carListing: { select: { sellerId: true } },
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Verify the inquiry belongs to one of this seller's listings
    if (inquiry.carListing?.sellerId !== seller.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update this inquiry' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status: validation.data.status,
      },
    });

    return NextResponse.json(updatedInquiry, { status: 200 });
  } catch (error: any) {
    console.error(`Error in PATCH /api/inquiries/${params?.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
