import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'demo-user-id'; // Mock for now

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Parse metadata JSON
    const parsedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      metadata: invoice.metadata ? JSON.parse(invoice.metadata) : null,
    }));

    return NextResponse.json({
      success: true,
      data: parsedInvoices,
    });
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
