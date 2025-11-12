import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'demo-user-id'; // Mock for now

    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse location JSON
    const parsedDevices = devices.map((device: any) => ({
      ...device,
      location: device.location ? JSON.parse(device.location) : null,
    }));

    return NextResponse.json({
      success: true,
      data: parsedDevices,
    });
  } catch (error) {
    console.error('Devices API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}
