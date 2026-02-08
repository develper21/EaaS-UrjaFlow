import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac-middleware';
import { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { EnergyPredictionService } from '@/lib/ml/prediction';

// GET /api/ml/anomalies - Detect anomalies in device readings
export async function GET(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_ANALYTICS)(async (req, context) => {
      const { searchParams } = new URL(req.url);
      const deviceId = searchParams.get('deviceId');
      const organizationId = searchParams.get('organizationId') || context?.user?.organizationId;
      const hours = parseInt(searchParams.get('hours') || '24'); // Default to last 24 hours

      if (!organizationId) {
        return NextResponse.json(
          { success: false, error: 'Organization ID is required' },
          { status: 400 }
        );
      }

      // Get devices to analyze
      const where: import('@prisma/client').Prisma.DeviceWhereInput = {};
      if (deviceId) {
        where.id = deviceId;
      } else {
        where.organizationId = organizationId;
      }

      const devices = await prisma.device.findMany({
        where,
        include: {
          readings: {
            where: {
              timestamp: {
                gte: new Date(Date.now() - hours * 60 * 60 * 1000)
              }
            },
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      const anomalyResults = [];

      for (const device of devices) {
        if (device.readings.length < 10) {
          anomalyResults.push({
            deviceId: device.id,
            deviceName: device.name,
            error: 'Insufficient data for anomaly detection. Need at least 10 readings.',
            anomalies: [],
            stats: { totalReadings: device.readings.length, anomalyCount: 0, anomalyRate: 0 }
          });
          continue;
        }

        // Detect anomalies
        const anomalyDetection = EnergyPredictionService.detectAnomalies(device.readings);

        anomalyResults.push({
          deviceId: device.id,
          deviceName: device.name,
          ...anomalyDetection
        });
      }

      // Create alerts for high-priority anomalies
      const alerts = [];
      for (const result of anomalyResults) {
        if (result.anomalies) {
          const highPriorityAnomalies = result.anomalies.filter(a => a.severity === 'HIGH');

          for (const anomaly of highPriorityAnomalies) {
            alerts.push({
              deviceId: result.deviceId,
              deviceName: result.deviceName,
              type: 'ANOMALY_DETECTED',
              severity: anomaly.severity,
              title: `Critical Anomaly: ${anomaly.type}`,
              message: anomaly.description,
              timestamp: anomaly.timestamp,
              metadata: {
                anomalyType: anomaly.type,
                value: anomaly.value,
                expectedValue: anomaly.expectedValue
              }
            });
          }
        }
      }

      // Store alerts in database if any
      if (alerts.length > 0) {
        await prisma.notification.createMany({
          data: alerts.map(alert => ({
            title: alert.title,
            message: alert.message,
            type: 'ALERT',
            organizationId,
            metadata: JSON.stringify(alert.metadata)
          }))
        });
      }

      return NextResponse.json({
        success: true,
        data: anomalyResults,
        summary: {
          totalDevices: devices.length,
          devicesWithAnomalies: anomalyResults.filter(r => r.anomalies && r.anomalies.length > 0).length,
          totalAnomalies: anomalyResults.reduce((sum, r) => sum + (r.anomalies?.length || 0), 0),
          alertsGenerated: alerts.length,
          analysisPeriod: `${hours} hours`,
          analyzedAt: new Date()
        }
      });
    })(request, {});

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

// POST /api/ml/anomalies/configure - Configure anomaly detection rules
export async function POST(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.MANAGE_DEVICE_SETTINGS)(async (req, context) => {
      const body = await req.json();
      const { deviceId, rules } = body;

      // Validate device access
      const device = await prisma.device.findUnique({
        where: { id: deviceId }
      });

      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }

      if (context?.user?.role !== 'SUPER_ADMIN' &&
        device.organizationId !== context?.user?.organizationId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // In a real implementation, you'd store these rules in the database
      // For now, we'll just return success

      const defaultRules = {
        spikeThreshold: 0.5, // 50% change
        dropThreshold: 0.3,  // 30% change
        outlierMultiplier: 1.5, // IQR multiplier
        flatlineDuration: 6, // 6 consecutive readings
        enableRealTimeAlerts: true,
        alertChannels: ['email', 'notification']
      };

      const configuredRules = { ...defaultRules, ...rules };

      return NextResponse.json({
        success: true,
        data: {
          deviceId,
          rules: configuredRules,
          configuredAt: new Date(),
          configuredBy: context?.user?.email
        }
      });
    })(request, {});

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
