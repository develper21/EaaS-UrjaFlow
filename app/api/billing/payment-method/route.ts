import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';

// Get payment methods
export async function GET() {
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

    if (!user || !user.subscriptions[0]?.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        data: { paymentMethods: [] },
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.subscriptions[0].stripeCustomerId,
      type: 'card',
    });

    return NextResponse.json({
      success: true,
      data: { paymentMethods: paymentMethods.data },
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// Create setup intent for adding new payment method
export async function POST() {
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let customerId = user.subscriptions[0]?.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        customerId,
      },
    });
  } catch (error) {
    console.error('Create setup intent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}

// Delete payment method
export async function DELETE(request: NextRequest) {
  try {
    const authSession = await getServerSession();
    
    if (!authSession || !authSession.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method ID required' },
        { status: 400 }
      );
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
