import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total devices
    const totalDevices = await prisma.device.count();

    // Get total revenue from paid invoices
    const revenueData = await prisma.invoice.findMany({
      where: { status: 'PAID' },
      select: { amount: true },
    });

    const totalRevenue = revenueData.reduce((sum: number, invoice: { amount: number }) => sum + invoice.amount, 0);

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });

    return NextResponse.json({
      totalUsers,
      totalDevices,
      totalRevenue,
      activeSubscriptions,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
