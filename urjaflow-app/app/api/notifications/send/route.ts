import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generateNotificationEmail } from '@/lib/email';

export async function POST() {
  try {
    // Get all users with notification preferences
    const users = await prisma.user.findMany({
      where: {
        notificationPreferences: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        notificationPreferences: true,
      },
    });

    const results = [];

    for (const user of users) {
      try {
        const prefs = JSON.parse(user.notificationPreferences || '{}');

        if (!prefs.emailEnabled) continue;

        // Send energy report if enabled
        if (prefs.energyReports) {
          // Get user's devices first
          const devices = await prisma.device.findMany({
            where: { userId: user.id },
            select: { id: true },
          });

          if (devices.length === 0) continue;

          const deviceIds = devices.map((d: { id: string }) => d.id);

          const energyData = await prisma.deviceReading.findMany({
            where: {
              deviceId: { in: deviceIds },
              timestamp: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
            select: {
              generationKW: true,
              consumptionKW: true,
              timestamp: true,
            },
          });

          if (energyData.length > 0) {
            const totalGenerated = energyData.reduce((sum: number, reading: { generationKW: number | null }) => sum + (reading.generationKW || 0), 0);
            const totalConsumed = energyData.reduce((sum: number, reading: { consumptionKW: number | null }) => sum + (reading.consumptionKW || 0), 0);
            const efficiency = totalGenerated > 0 ? (((totalGenerated - totalConsumed) / totalGenerated) * 100).toFixed(1) : '0';
            const savings = (totalGenerated * 0.12).toFixed(2);

            const emailTemplate = generateNotificationEmail('energy', {
              userName: user.name || 'User',
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
          const recentInvoices = await prisma.invoice.findMany({
            where: {
              userId: user.id,
              status: 'PAID',
              paidAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
            include: {
              subscription: {
                select: {
                  currentPeriodStart: true,
                  currentPeriodEnd: true,
                },
              },
            },
            orderBy: {
              paidAt: 'desc',
            },
            take: 1,
          });

          if (recentInvoices.length > 0) {
            const invoice = recentInvoices[0];
            const subscription = invoice.subscription;
            const emailTemplate = generateNotificationEmail('billing', {
              userName: user.name || 'User',
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
