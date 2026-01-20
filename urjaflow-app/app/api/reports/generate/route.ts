import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac-middleware';
import { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ReportGenerator, ReportConfig } from '@/lib/reports/generator';

// POST /api/reports/generate - Generate custom reports
export async function POST(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.GENERATE_REPORTS)(async (req, context) => {
      const body = await req.json();
      const {
        organizationId,
        format = 'PDF',
        period = 30,
        deviceIds,
        includeCharts = true,
        includeRecommendations = true,
        sections = ['summary', 'devices', 'readings']
      } = body;

      // Get organization
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId || context.user.organizationId }
      });

      if (!organization) {
        return NextResponse.json(
          { success: false, error: 'Organization not found' },
          { status: 404 }
        );
      }

      // Check access
      if (context.user.role !== 'SUPER_ADMIN' &&
        organization.id !== context.user.organizationId) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get devices
      const deviceWhere: import('@prisma/client').Prisma.DeviceWhereInput = { organizationId: organization.id };
      if (deviceIds && deviceIds.length > 0) {
        deviceWhere.id = { in: deviceIds };
      }

      const devices = await prisma.device.findMany({
        where: deviceWhere
      });

      // Get readings for the period
      const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const readings = await prisma.deviceReading.findMany({
        where: {
          deviceId: { in: devices.map(d => d.id) },
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      // Prepare report data
      const reportData = {
        organization,
        devices,
        readings,
        period: {
          startDate,
          endDate
        }
      };

      // Configure report
      const reportConfig: ReportConfig = {
        title: `Energy Report - ${organization.name}`,
        format: format.toUpperCase() as 'PDF' | 'EXCEL',
        includeCharts,
        includeRecommendations,
        sections
      };

      // Generate report
      const reportBuffer = await ReportGenerator.generateReport(reportData, reportConfig);

      // Set appropriate headers
      const contentType = format === 'PDF'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const filename = `${organization.name.replace(/[^a-zA-Z0-9]/g, '_')}_energy_report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;

      return new NextResponse(new Uint8Array(reportBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': reportBuffer.length.toString()
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

// GET /api/reports/generate/templates - Get available report templates
export async function GET(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.GENERATE_REPORTS)(async () => {
      const templates = [
        {
          id: 'monthly_summary',
          name: 'Monthly Energy Summary',
          description: 'Comprehensive monthly energy performance report',
          format: ['PDF', 'EXCEL'],
          sections: ['summary', 'devices', 'readings', 'analytics'],
          period: 30
        },
        {
          id: 'weekly_performance',
          name: 'Weekly Performance Report',
          description: 'Detailed weekly performance analysis',
          format: ['PDF', 'EXCEL'],
          sections: ['summary', 'devices', 'analytics'],
          period: 7
        },
        {
          id: 'quarterly_review',
          name: 'Quarterly Review',
          description: 'In-depth quarterly analysis with trends',
          format: ['PDF', 'EXCEL'],
          sections: ['summary', 'devices', 'readings', 'analytics', 'recommendations'],
          period: 90
        },
        {
          id: 'annual_report',
          name: 'Annual Energy Report',
          description: 'Complete annual energy performance report',
          format: ['PDF', 'EXCEL'],
          sections: ['summary', 'devices', 'readings', 'analytics', 'recommendations', 'benchmarks'],
          period: 365
        },
        {
          id: 'device_specific',
          name: 'Device-Specific Report',
          description: 'Report for specific devices',
          format: ['PDF', 'EXCEL'],
          sections: ['devices', 'readings', 'analytics'],
          period: 30
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          templates,
          formats: ['PDF', 'EXCEL'],
          sections: [
            'summary',
            'devices',
            'readings',
            'analytics',
            'recommendations',
            'benchmarks'
          ]
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
