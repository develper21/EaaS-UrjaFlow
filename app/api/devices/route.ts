import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse location JSON
    const parsedDevices = devices.map((device) => ({
      ...device,
      location: device.location && typeof device.location === 'string'
        ? JSON.parse(device.location)
        : device.location,
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
