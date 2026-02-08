import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Invoice {
  id: string;
  userId: string | null;
  organizationId: string | null;
  subscriptionId: string | null;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: string;
  stripeInvoiceId?: string | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedInvoice {
  id: string;
  userId: string | null;
  organizationId: string | null;
  subscriptionId: string | null;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: string;
  stripeInvoiceId?: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
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

    // Get payment methods from database
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    // Parse metadata JSON
    const parsedInvoices = invoices.map((invoice: Invoice) => ({
      ...invoice,
      metadata: invoice.metadata ? JSON.parse(invoice.metadata) : null,
    })) as ParsedInvoice[];

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
