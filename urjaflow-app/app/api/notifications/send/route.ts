import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, generateNotificationEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get all users with notification preferences
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, notificationPreferences')
      .not('notificationPreferences', 'is', null);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const results = [];

    for (const user of users || []) {
      try {
        const prefs = JSON.parse(user.notificationPreferences || '{}');

        if (!prefs.emailEnabled) continue;

        // Send energy report if enabled
        if (prefs.energyReports) {
          // Get user's devices first
          const { data: devices } = await supabase
            .from('devices')
            .select('id')
            .eq('userId', user.id);

          if (!devices || devices.length === 0) continue;

          const deviceIds = devices.map(d => d.id);

          const { data: energyData } = await supabase
            .from('device_readings')
            .select('generationKW, consumptionKW, timestamp')
            .in('deviceId', deviceIds)
            .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          if (energyData && energyData.length > 0) {
            const totalGenerated = energyData.reduce((sum, reading) => sum + (reading.generationKW || 0), 0);
            const totalConsumed = energyData.reduce((sum, reading) => sum + (reading.consumptionKW || 0), 0);
            const efficiency = totalGenerated > 0 ? ((totalGenerated - totalConsumed) / totalGenerated * 100).toFixed(1) : '0';
            const savings = (totalGenerated * 0.12).toFixed(2);

            const emailTemplate = generateNotificationEmail('energy', {
              userName: user.name,
              generated: totalGenerated.toFixed(2),
              consumed: totalConsumed.toFixed(2),
              savings,
              efficiency,
            });

            await sendEmail({
              to: user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });

            results.push({ userId: user.id, type: 'energy', status: 'sent' });
          }
        }

        // Send billing notifications if enabled
        if (prefs.billingAlerts) {
          const { data: recentInvoices } = await supabase
            .from('invoices')
            .select(`
              *,
              subscriptions (
                currentPeriodStart,
                currentPeriodEnd
              )
            `)
            .eq('userId', user.id)
            .eq('status', 'PAID')
            .gte('paidAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('paidAt', { ascending: false })
            .limit(1);

          if (recentInvoices && recentInvoices.length > 0) {
            const invoice = recentInvoices[0];
            const subscription = invoice.subscriptions;
            const emailTemplate = generateNotificationEmail('billing', {
              userName: user.name,
              period: subscription ? `${new Date(subscription.currentPeriodStart).toLocaleDateString()} - ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : 'N/A',
              energyConsumed: 'N/A', // Would need to calculate from readings
              amount: invoice.amount.toFixed(2),
              dueDate: new Date(invoice.dueDate).toLocaleDateString(),
            });

            await sendEmail({
              to: user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });

            results.push({ userId: user.id, type: 'billing', status: 'sent' });
          }
        }

      } catch (userError) {
        console.error(`Error sending notification to user ${user.id}:`, userError);
        results.push({ userId: user.id, type: 'error', status: 'failed' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} notifications`,
      results,
    });

  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
