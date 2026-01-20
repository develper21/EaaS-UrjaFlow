import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac-middleware';
import { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { EnergyPredictionService } from '@/lib/ml/prediction';

// GET /api/ml/predictions - Get predictions for devices
export async function GET(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_ANALYTICS)(async (req, context) => {
      const { searchParams } = new URL(req.url);
      const deviceId = searchParams.get('deviceId');
      const organizationId = searchParams.get('organizationId') || context.user.organizationId;

      // Get devices to predict for
      const where: any = {};
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
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              }
            },
            orderBy: { timestamp: 'desc' },
            take: 200, // Limit training data
          }
        }
      });

      const predictions = [];

      for (const device of devices) {
        if (device.readings.length < 48) { // Need at least 2 days of data
          predictions.push({
            deviceId: device.id,
            deviceName: device.name,
            error: 'Insufficient data for prediction. Need at least 48 readings.',
            predictions: []
          });
          continue;
        }

        try {
          // Train model
          const model = await EnergyPredictionService.trainModel(device.id, device.readings);
          
          // Generate predictions
          const lastReading = device.readings[0]; // Most recent
          const prediction = await EnergyPredictionService.generatePredictions(
            device.id,
            device.name,
            model.generationModel,
            model.consumptionModel,
            lastReading
          );

          predictions.push(prediction);
        } catch (error) {
          predictions.push({
            deviceId: device.id,
            deviceName: device.name,
            error: error instanceof Error ? error.message : 'Prediction failed',
            predictions: []
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: predictions,
        generatedAt: new Date(),
        model: 'Linear Regression',
        horizon: '24 hours'
      });
    })(request, {});

    return result;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}

// POST /api/ml/predictions/train - Retrain prediction models
export async function POST(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_ANALYTICS)(async (req, context) => {
      const body = await req.json();
      const { deviceId, organizationId } = body;

      // Get device with historical data
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: {
          readings: {
            where: {
              timestamp: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              }
            },
            orderBy: { timestamp: 'desc' },
            take: 1000, // Limit training data
          }
        }
      });

      if (!device) {
        return NextResponse.json(
          { success: false, error: 'Device not found' },
          { status: 404 }
        );
      }

      // Check access
      if (context.user.role !== 'SUPER_ADMIN' && 
          device.organizationId !== context.user.organizationId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      if (device.readings.length < 48) {
        return NextResponse.json(
          { success: false, error: 'Insufficient data for training' },
          { status: 400 }
        );
      }

      // Train new model
      const model = await EnergyPredictionService.trainModel(device.id, device.readings);

      // Store model metadata (in a real implementation, you'd store this)
      await prisma.device.update({
        where: { id: deviceId },
        data: {
          // In a real implementation, you'd store model metadata
          // For now, we'll just update a timestamp
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          deviceId,
          trainedAt: model.trainedAt,
          dataPoints: model.dataPoints,
          accuracy: model.accuracy,
          model: 'Linear Regression'
        }
      });
    })(request, {});

    return result;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
