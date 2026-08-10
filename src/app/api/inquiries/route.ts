import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carListingId, name, email, phone, message } = body;

    if (!carListingId || !name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the listing exists
    const listing = await prisma.carListing.findUnique({
      where: { id: carListingId },
      select: { id: true, sellerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Save inquiry to database
    const inquiry = await prisma.inquiry.create({
      data: {
        carListingId,
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully',
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error('Inquiry API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
