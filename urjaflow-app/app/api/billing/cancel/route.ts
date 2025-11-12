import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authSession = await getServerSession();
    
    if (!authSession || !authSession.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: authSession.user.email },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || !user.subscriptions[0]) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const subscription = user.subscriptions[0];

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    // Cancel subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      data: {
        cancelAt: new Date(canceledSubscription.cancel_at! * 1000),
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
