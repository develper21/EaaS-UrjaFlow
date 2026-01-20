import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: { 
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Find next pending invoice
    const nextInvoice = invoices.find(inv => inv.status === 'PENDING');

    // Mock payment methods (in real app, integrate with Stripe)
    const paymentMethods = [
      {
        id: 'pm_mock',
        type: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
      },
    ];

    // Parse metadata JSON
    const parsedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      metadata: invoice.metadata ? JSON.parse(invoice.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentSubscription,
        nextInvoice,
        invoices: parsedInvoices,
        paymentMethods,
      },
    });
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}
