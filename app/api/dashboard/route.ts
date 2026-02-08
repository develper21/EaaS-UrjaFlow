import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  model: string | null;
  serialNumber: string | null;
  capacity: number | null;
  location: string | null;
  installedAt: Date | null;
  userId: string | null;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeviceReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  generationKW: number | null;
  consumptionKW: number | null;
  batteryPercent: number | null;
  temperature: number | null;
  efficiency: number | null;
}

export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's devices
    const devices = await prisma.device.findMany({
      where: { userId },
      take: 10,
    });

    // Get latest readings for each device
    const deviceIds = devices.map((d: Device) => d.id);
    const latestReadings = await prisma.deviceReading.findMany({
      where: {
        deviceId: { in: deviceIds },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // Calculate aggregated stats
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentReadings = latestReadings.filter(
      (r: DeviceReading) => new Date(r.timestamp) > last24h
    );

    const liveGeneration = recentReadings
      .slice(0, 10)
      .reduce((sum: number, r: DeviceReading) => sum + (r.generationKW || 0), 0) / 10;

    const liveConsumption = recentReadings
      .slice(0, 10)
      .reduce((sum: number, r: DeviceReading) => sum + (r.consumptionKW || 0), 0) / 10;

    const batteryReadings = recentReadings.filter((r: DeviceReading) => r.batteryPercent !== null);
    const batteryLevel = batteryReadings.length > 0
      ? batteryReadings.reduce((sum: number, r: DeviceReading) => sum + (r.batteryPercent || 0), 0) / batteryReadings.length
      : 0;

    // Calculate monthly savings (mock calculation)
    const totalGeneration = recentReadings.reduce((sum: number, r: DeviceReading) => sum + (r.generationKW || 0), 0);
    const monthlySavings = totalGeneration * 0.13; // $0.13 per kWh

    // Calculate carbon saved
    const carbonSaved = totalGeneration * 0.417; // kg CO2 per kWh

    // Calculate efficiency
    const efficiencyReadings = recentReadings.filter((r: DeviceReading) => r.efficiency !== null);
    const avgEfficiency = efficiencyReadings.length > 0
      ? efficiencyReadings.reduce((sum: number, r: DeviceReading) => sum + (r.efficiency || 0), 0) / efficiencyReadings.length
      : 0;

    // Generation history (last 7 days)
    const generationHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayReadings = latestReadings.filter((r: DeviceReading) => {
        const rDate = new Date(r.timestamp);
        return rDate.toDateString() === date.toDateString();
      });

      const dayGeneration = dayReadings.reduce((sum: number, r: DeviceReading) => sum + (r.generationKW || 0), 0);
      const dayConsumption = dayReadings.reduce((sum: number, r: DeviceReading) => sum + (r.consumptionKW || 0), 0);

      generationHistory.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        generation: parseFloat(dayGeneration.toFixed(2)),
        consumption: parseFloat(dayConsumption.toFixed(2)),
      });
    }

    // Calculate trends
    const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const previousPeriodReadings = latestReadings.filter(
      (r: DeviceReading) => new Date(r.timestamp) > last48h && new Date(r.timestamp) <= last24h
    );

    const prevLiveGeneration = previousPeriodReadings.length > 0
      ? previousPeriodReadings.slice(0, 10).reduce((sum: number, r: DeviceReading) => sum + (r.generationKW || 0), 0) / 10
      : 0;

    const prevLiveConsumption = previousPeriodReadings.length > 0
      ? previousPeriodReadings.slice(0, 10).reduce((sum: number, r: DeviceReading) => sum + (r.consumptionKW || 0), 0) / 10
      : 0;

    // Calculate trend percentages
    const generationTrend = prevLiveGeneration > 0 ? ((liveGeneration - prevLiveGeneration) / prevLiveGeneration) * 100 : 0;
    const consumptionTrend = prevLiveConsumption > 0 ? ((liveConsumption - prevLiveConsumption) / prevLiveConsumption) * 100 : 0;
    const savingsTrend = generationTrend; // Assuming savings track generation directly

    return NextResponse.json({
      success: true,
      data: {
        liveGeneration: parseFloat(liveGeneration.toFixed(2)),
        liveConsumption: parseFloat(liveConsumption.toFixed(2)),
        batteryLevel: parseFloat(batteryLevel.toFixed(1)),
        monthlySavings: parseFloat(monthlySavings.toFixed(2)),
        carbonSaved: parseFloat(carbonSaved.toFixed(1)),
        efficiency: parseFloat(avgEfficiency.toFixed(1)),
        trends: {
          generation: parseFloat(generationTrend.toFixed(1)),
          consumption: parseFloat(consumptionTrend.toFixed(1)),
          savings: parseFloat(savingsTrend.toFixed(1))
        },
        generationHistory,
        devices,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
