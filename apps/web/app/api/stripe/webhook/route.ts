import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const item = sub.items.data[0];
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          subscriptionStatus: sub.status,
          subscriptionCurrentPeriodEnd: item.current_period_end
            ? new Date(item.current_period_end * 1000)
            : null,
          stripePriceId: item.price.id,
        },
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { subscriptionStatus: 'canceled', subscriptionCurrentPeriodEnd: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
