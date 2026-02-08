import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { generateInvoiceNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, planId } = session.metadata || {};

        if (userId && planId) {
          // Create subscription
          const subscription = await prisma.subscription.create({
            data: {
              userId,
              planId,
              status: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });

          // Get plan for invoice
          const plan = await prisma.plan.findUnique({ where: { id: planId } });

          if (plan) {
            // Create invoice
            await prisma.invoice.create({
              data: {
                userId,
                subscriptionId: subscription.id,
                invoiceNumber: generateInvoiceNumber(),
                amount: plan.price,
                currency: plan.currency,
                status: 'PAID',
                dueDate: new Date(),
                paidAt: new Date(),
                stripeInvoiceId: session.invoice as string,
                description: `${plan.name} Plan - Monthly Subscription`,
                metadata: JSON.stringify({
                  items: [{ description: `${plan.name} Plan`, amount: plan.price }],
                }),
              },
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // Update invoice status
        await prisma.invoice.updateMany({
          where: { stripeInvoiceId: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELED',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Cancel subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(),
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
