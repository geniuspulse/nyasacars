import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
  typescript: true,
});

export const PLAN_PRICING = {
  FREE: {
    name: 'Free Plan',
    priceUSD: 0,
    priceId: null,
    maxListings: 3,
    features: [
      'Up to 3 active listings',
      'Basic seller profile',
      'Standard customer support',
    ],
  },
  PRO: {
    name: 'Pro Plan',
    priceUSD: 15,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    maxListings: 25,
    features: [
      'Up to 25 active listings',
      'Verified seller badge',
      '5 free monthly ad credits',
      'Priority support',
    ],
  },
  PREMIUM: {
    name: 'Premium Plan',
    priceUSD: 50,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
    maxListings: -1, // Unlimited
    features: [
      'Unlimited active listings',
      'Verified seller badge',
      'Top search placement',
      '20 free monthly ad credits',
      '24/7 dedicated support',
    ],
  },
} as const;

export const AD_CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    credits: 10,
    priceUSD: 5,
    priceId: process.env.STRIPE_CREDITS_10_PRICE_ID || 'price_credits_10',
    description: '10 Ad Credits to feature your listings',
  },
  {
    id: 'credits_25',
    credits: 25,
    priceUSD: 10,
    priceId: process.env.STRIPE_CREDITS_25_PRICE_ID || 'price_credits_25',
    description: '25 Ad Credits (Save 20%)',
  },
  {
    id: 'credits_50',
    credits: 50,
    priceUSD: 18,
    priceId: process.env.STRIPE_CREDITS_50_PRICE_ID || 'price_credits_50',
    description: '50 Ad Credits (Best value - Save 28%)',
  },
] as const;

export interface CreateCheckoutSessionParams {
  sellerId: string;
  customerEmail: string;
  priceId: string;
  mode?: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession({
  sellerId,
  customerEmail,
  priceId,
  mode = 'subscription',
  successUrl,
  cancelUrl,
  metadata = {},
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      sellerId,
      ...metadata,
    },
  });

  return session;
}
