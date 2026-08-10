import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Forbidden: Seller profile not found or user is not a seller' },
        { status: 403 }
      );
    }

    const sellerId = seller.id;

    // Execute queries in parallel
    const [
      totalListings,
      activeListings,
      totalViewsAgg,
      inquiriesCount,
      recentListings,
      recentInquiries,
    ] = await Promise.all([
      prisma.carListing.count({
        where: { sellerId },
      }),
      prisma.carListing.count({
        where: { sellerId, status: 'ACTIVE' },
      }),
      prisma.carListing.aggregate({
        where: { sellerId },
        _sum: { views: true },
      }),
      prisma.inquiry.count({
        where: {
          carListing: { sellerId },
        },
      }),
      prisma.carListing.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.inquiry.findMany({
        where: {
          carListing: { sellerId },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          carListing: {
            select: {
              id: true,
              title: true,
              price: true,
            },
          },
        },
      }),
    ]);

    const totalViews = totalViewsAgg._sum.views || 0;

    return NextResponse.json(
      {
        totalListings,
        activeListings,
        totalViews,
        inquiriesCount,
        recentListings,
        recentInquiries,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
