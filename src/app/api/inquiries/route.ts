import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carListingId, name, email, phone, message } = body;

    if (!carListingId || !name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process inquiry submission (e.g. log / save / send notification)
    console.log('Received Car Inquiry:', { carListingId, name, email, phone, message });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully',
    });
  } catch (error) {
    console.error('Inquiry API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
