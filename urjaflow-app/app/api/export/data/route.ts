import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac-middleware';
import { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/export/data - Export data in various formats
export async function GET(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.EXPORT_DATA)(async (req, context) => {
      if (!context?.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);
      const format = searchParams.get('format') || 'json';
      const organizationId = searchParams.get('organizationId') || context?.user?.organizationId;
      const deviceId = searchParams.get('deviceId');
      const dataType = searchParams.get('type') || 'readings';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!organizationId) {
        return NextResponse.json(
          { success: false, error: 'Organization ID is required' },
          { status: 400 }
        );
      }

      // Parse dates
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // Check access
      if (context?.user?.role !== 'SUPER_ADMIN' &&
        organizationId !== context?.user?.organizationId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      let data: string | Record<string, unknown>[] = [];
      let filename: string;
      let contentType: string;

      const targetOrgId = organizationId as string;

      switch (dataType) {
        case 'readings':
          data = await exportReadings(targetOrgId, deviceId, start, end);
          filename = `readings_${new Date().toISOString().split('T')[0]}.${format}`;
          break;
        case 'devices':
          data = await exportDevices(targetOrgId);
          filename = `devices_${new Date().toISOString().split('T')[0]}.${format}`;
          break;
        case 'users':
          data = await exportUsers(targetOrgId);
          filename = `users_${new Date().toISOString().split('T')[0]}.${format}`;
          break;
        case 'invoices':
          data = await exportInvoices(targetOrgId, start, end);
          filename = `invoices_${new Date().toISOString().split('T')[0]}.${format}`;
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid data type' },
            { status: 400 }
          );
      }

      // Format response based on format
      switch (format.toLowerCase()) {
        case 'csv':
          contentType = 'text/csv';
          data = convertToCSV(data as Record<string, unknown>[]);
          break;
        case 'json':
          contentType = 'application/json';
          data = JSON.stringify(data, null, 2);
          break;
        default:
          contentType = 'application/json';
          data = JSON.stringify(data, null, 2);
      }

      return new NextResponse(data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
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

async function exportReadings(organizationId: string, deviceId: string | null, start: Date, end: Date) {
  const where: import('@prisma/client').Prisma.DeviceReadingWhereInput = {
    timestamp: { gte: start, lte: end },
    device: { organizationId }
  };

  if (deviceId) {
    where.deviceId = deviceId;
  }

  const readings = await prisma.deviceReading.findMany({
    where,
    include: {
      device: {
        select: { name: true, type: true }
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  return readings.map(reading => ({
    timestamp: reading.timestamp.toISOString(),
    deviceName: reading.device.name,
    deviceType: reading.device.type,
    generationKW: reading.generationKW || 0,
    consumptionKW: reading.consumptionKW || 0,
    batteryPercent: reading.batteryPercent || 0,
    voltage: reading.voltage || 0,
    current: reading.current || 0,
    temperature: reading.temperature || 0,
    efficiency: reading.efficiency || 0,
    metadata: reading.metadata ? JSON.parse(reading.metadata) : null
  }));
}

async function exportDevices(organizationId: string) {
  const devices = await prisma.device.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { readings: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return devices.map(device => ({
    id: device.id,
    name: device.name,
    type: device.type,
    model: device.model,
    serialNumber: device.serialNumber,
    capacity: device.capacity,
    status: device.status,
    location: device.location ? JSON.parse(device.location) : null,
    installedAt: device.installedAt?.toISOString() || null,
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
    totalReadings: device._count.readings
  }));
}

async function exportUsers(organizationId: string) {
  const users = await prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      company: true,
      address: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { devices: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    company: user.company,
    address: user.address,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    deviceCount: user._count.devices
  }));
}

async function exportInvoices(organizationId: string, start: Date, end: Date) {
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      createdAt: { gte: start, lte: end }
    },
    include: {
      user: { select: { name: true, email: true } },
      subscription: { select: { plan: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return invoices.map(invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    userName: invoice.user?.name || 'Unknown',
    userEmail: invoice.user?.email || 'Unknown',
    planName: invoice.subscription?.plan.name || 'Unknown',
    amount: invoice.amount,
    currency: invoice.currency,
    status: invoice.status,
    dueDate: invoice.dueDate.toISOString(),
    paidAt: invoice.paidAt?.toISOString() || null,
    description: invoice.description,
    metadata: invoice.metadata ? JSON.parse(invoice.metadata) : null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString()
  }));
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).replace(/"/g, '""');
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}
