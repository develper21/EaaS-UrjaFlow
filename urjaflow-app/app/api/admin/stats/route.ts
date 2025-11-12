import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total devices
    const { count: totalDevices } = await supabase
      .from('devices')
      .select('*', { count: 'exact', head: true });

    // Get total revenue from paid invoices
    const { data: revenueData } = await supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'PAID');

    const totalRevenue = revenueData?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalDevices: totalDevices || 0,
      totalRevenue,
      activeSubscriptions: activeSubscriptions || 0,
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
