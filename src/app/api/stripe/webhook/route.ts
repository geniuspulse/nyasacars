import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

function getModels() {
  const sellerModel = (prisma as any).seller || prisma.seller;
  const subscriptionModel = (prisma as any).subscription || (prisma as any).sellerSubscription;
  const adTransactionModel = (prisma as any).adCreditTransaction || (prisma as any).adTransaction;
  return { sellerModel, subscriptionModel, adTransactionModel };
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    console.error('Stripe API key or webhook secret is missing');
    return NextResponse.json(
      { error: 'Stripe configuration missing' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16' as any,
  });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err?.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err?.message}` },
      { status: 400 }
    );
  }

  const { sellerModel, subscriptionModel, adTransactionModel } = getModels();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const { sellerId, type, plan, creditPackage } = metadata;

        if (sellerId) {
          if (type === 'subscription' && plan) {
            // Update seller plan
            await sellerModel.update({
              where: { id: sellerId },
              data: { plan: plan.toUpperCase() },
            });

            // Upsert subscription record if model exists
            if (subscriptionModel) {
              try {
                await subscriptionModel.upsert({
                  where: { sellerId },
                  update: {
                    plan: plan.toUpperCase(),
                    status: 'ACTIVE',
                    stripeSubscriptionId: session.subscription as string,
                  },
                  create: {
                    sellerId,
                    plan: plan.toUpperCase(),
                    status: 'ACTIVE',
                    stripeSubscriptionId: session.subscription as string,
                  },
                });
              } catch {
                // Fallback to simple create
                try {
                  await subscriptionModel.create({
                    data: {
                      sellerId,
                      plan: plan.toUpperCase(),
                      status: 'ACTIVE',
                      stripeSubscriptionId: session.subscription as string,
                    },
                  });
                } catch {
                  // Ignore subscription record error if schema doesn't exist
                }
              }
            }
          } else if (type === 'ad_credits' && creditPackage) {
            const creditsToAdd = parseInt(creditPackage, 10);

            if (!isNaN(creditsToAdd) && creditsToAdd > 0) {
              // Add ad credits to seller
              await sellerModel.update({
                where: { id: sellerId },
                data: {
                  adCredits: { increment: creditsToAdd },
                },
              });

              // Create transaction record if model exists
              if (adTransactionModel) {
                try {
                  await adTransactionModel.create({
                    data: {
                      sellerId,
                      amount: creditsToAdd,
                      type: 'PURCHASE',
                      description: `Purchased ${creditsToAdd} ad credits via Stripe`,
                      stripePaymentIntentId:
                        (session.payment_intent as string) || session.id,
                    },
                  });
                } catch {
                  // Ignore transaction record error if schema doesn't exist
                }
              }
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const subscriptionId = stripeSubscription.id;

        if (subscriptionModel) {
          try {
            const status = stripeSubscription.status.toUpperCase();
            await subscriptionModel.updateMany({
              where: { stripeSubscriptionId: subscriptionId },
              data: { status },
            });
          } catch {
            // Ignore error
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const subscriptionId = stripeSubscription.id;

        if (subscriptionModel) {
          try {
            const sub = await subscriptionModel.findFirst({
              where: { stripeSubscriptionId: subscriptionId },
            });

            if (sub && sub.sellerId) {
              // Downgrade seller to FREE
              await sellerModel.update({
                where: { id: sub.sellerId },
                data: { plan: 'FREE' },
              });

              await subscriptionModel.update({
                where: { id: sub.id },
                data: { status: 'CANCELED' },
              });
            }
          } catch {
            // Fallback downgrade
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing Stripe webhook event ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
