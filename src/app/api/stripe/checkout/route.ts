import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Stripe from 'stripe';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const checkoutSchema = z
  .object({
    type: z.enum(['subscription', 'ad_credits']),
    plan: z.enum(['PRO', 'PREMIUM']).optional(),
    creditPackage: z.union([z.number(), z.string()]).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'subscription') {
        return !!data.plan && ['PRO', 'PREMIUM'].includes(data.plan);
      }
      if (data.type === 'ad_credits') {
        const pkg = Number(data.creditPackage);
        return [10, 25, 50].includes(pkg);
      }
      return true;
    },
    {
      message: 'Subscription requires plan (PRO|PREMIUM). Ad credits require creditPackage (10|25|50).',
    }
  );

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe API key is not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, plan, creditPackage } = validation.data;

    const sellerModel = (prisma as any).seller || prisma.seller;
    const seller = await sellerModel.findFirst({
      where: {
        OR: [
          ...(session.user.sellerId ? [{ id: session.user.sellerId }] : []),
          { userId: session.user.id },
        ],
      },
    });

    const sellerId = seller?.id || session.user.sellerId || '';

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16' as any,
    });

    const origin =
      req.headers.get('origin') ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000';

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let mode: Stripe.Checkout.SessionCreateParams.Mode = 'payment';

    if (type === 'subscription' && plan) {
      mode = 'subscription';
      const amount = plan === 'PRO' ? 1500 : 5000; // $15 or $50

      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Nyasacars ${plan} Plan Subscription`,
              description: `Monthly subscription for ${plan} seller tier`,
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];
    } else if (type === 'ad_credits' && creditPackage) {
      mode = 'payment';
      const credits = Number(creditPackage);
      const creditPrices: Record<number, number> = {
        10: 500, // $5
        25: 1000, // $10
        50: 1800, // $18
      };

      const amount = creditPrices[credits];

      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits} Nyasacars Ad Credits`,
              description: `Package of ${credits} ad credits for featuring car listings`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ];
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
      customer_email: session.user.email || undefined,
      metadata: {
        sellerId,
        userId: session.user.id,
        type,
        plan: plan || '',
        creditPackage: creditPackage ? String(creditPackage) : '',
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/stripe/checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
