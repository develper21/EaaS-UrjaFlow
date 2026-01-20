import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac-middleware';
import { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { BenchmarkService } from '@/lib/analytics/benchmarks';

interface DeviceWhereClause {
  organizationId: string;
  id?: string;
}

interface ApiError extends Error {
  status?: number;
}

// GET /api/analytics/benchmarks - Get industry benchmarks and comparisons
export async function GET(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_COMPARATIVE_ANALYTICS)(async (req, context) => {
      const { searchParams } = new URL(req.url);
      const organizationId = searchParams.get('organizationId') || context.user.organizationId;
      const deviceId = searchParams.get('deviceId');
      const period = parseInt(searchParams.get('period') || '30'); // days

      // Get organization data
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
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

      // Get devices and readings
      const where: DeviceWhereClause = { organizationId };
      if (deviceId) {
        where.id = deviceId;
      }

      const devices = await prisma.device.findMany({
        where,
        include: {
          readings: {
            where: {
              timestamp: {
                gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000)
              }
            },
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      const allReadings = devices.flatMap(d => d.readings);

      // Generate industry comparison report
      const industryReport = await BenchmarkService.generateIndustryReport(
        organization,
        devices,
        allReadings
      );

      // Analyze individual devices
      const deviceComparisons = await Promise.all(
        devices.map(device => {
          const deviceReadings = allReadings.filter(r => r.deviceId === device.id);
          return BenchmarkService.analyzeDevicePerformance(device, deviceReadings);
        })
      );

      // Get industry benchmarks
      const benchmarks = BenchmarkService.getAllBenchmarks();

      return NextResponse.json({
        success: true,
        data: {
          industryReport,
          deviceComparisons,
          benchmarks,
          analysis: {
            period: `${period} days`,
            totalDevices: devices.length,
            totalReadings: allReadings.length,
            analysisDate: new Date()
          }
        }
      });
    })(request, {});

    return result;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { success: false, error: apiError.message },
      { status: apiError.status || 500 }
    );
  }
}

// GET /api/analytics/benchmarks/industry - Get industry benchmarks only
export async function INDUSTRY(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_COMPARATIVE_ANALYTICS)(async (req) => {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');

      let benchmarks = BenchmarkService.getAllBenchmarks();
      
      if (category) {
        benchmarks = BenchmarkService.getBenchmarksByCategory(category.toUpperCase());
      }

      return NextResponse.json({
        success: true,
        data: {
          benchmarks,
          categories: [...new Set(benchmarks.map(b => b.category))],
          lastUpdated: new Date()
        }
      });
    })(request, {});

    return result;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { success: false, error: apiError.message },
      { status: apiError.status || 500 }
    );
  }
}

// POST /api/analytics/benchmarks/compare - Compare with peer organizations
export async function POST(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_COMPARATIVE_ANALYTICS)(async (req) => {
      const body = await req.json();
      const { organizationIds, metrics } = body;

      // Get organizations to compare
      const organizations = await prisma.organization.findMany({
        where: {
          id: { in: organizationIds }
        },
        include: {
          devices: {
            include: {
              readings: {
                where: {
                  timestamp: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          }
        }
      });

      // Generate comparison data
      const comparisons = await Promise.all(
        organizations.map(async org => {
          const allReadings = org.devices.flatMap(d => d.readings);
          
          const industryReport = await BenchmarkService.generateIndustryReport(
            org,
            org.devices,
            allReadings
          );

          return {
            organizationId: org.id,
            organizationName: org.name,
            overallScore: industryReport.overallScore,
            industryRanking: industryReport.industryRanking,
            keyMetrics: {
              efficiency: industryReport.industryRanking.efficiency,
              generation: industryReport.industryRanking.generation,
              reliability: industryReport.industryRanking.reliability,
              costEffectiveness: industryReport.industryRanking.costEffectiveness
            }
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          comparisons,
          analysisDate: new Date(),
          peerGroupSize: organizations.length,
          metrics: metrics || ['efficiency', 'generation', 'reliability', 'costEffectiveness']
        }
      });
    })(request, {});

    return result;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { success: false, error: apiError.message },
      { status: apiError.status || 500 }
    );
  }
}
