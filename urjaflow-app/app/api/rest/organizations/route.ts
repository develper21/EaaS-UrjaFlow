import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac-middleware';
import { Permission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/rest/organizations - List organizations
export async function GET(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.VIEW_ORGANIZATION)(async (req, context) => {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const skip = (page - 1) * limit;

      const where = context.user.role === 'SUPER_ADMIN' 
        ? {} 
        : { id: context.user.organizationId };

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                users: true,
                devices: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.organization.count({ where })
      ]);

      return NextResponse.json({
        success: true,
        data: organizations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
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

// POST /api/rest/organizations - Create organization
export async function POST(request: NextRequest) {
  try {
    const result = await requirePermission(Permission.UPDATE_ORGANIZATION)(async (req, context) => {
      const body = await req.json();
      
      // Validate input
      if (!body.name || !body.slug) {
        return NextResponse.json(
          { success: false, error: 'Name and slug are required' },
          { status: 400 }
        );
      }

      // Check if slug is unique
      const existing = await prisma.organization.findUnique({
        where: { slug: body.slug }
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Organization slug already exists' },
          { status: 409 }
        );
      }

      const organization = await prisma.organization.create({
        data: {
          name: body.name,
          slug: body.slug,
          domain: body.domain,
          logo: body.logo,
          primaryColor: body.primaryColor || '#3b82f6',
          secondaryColor: body.secondaryColor || '#64748b',
          plan: body.plan || 'BASIC',
          maxUsers: body.maxUsers || 5,
          maxDevices: body.maxDevices || 10,
          settings: body.settings ? JSON.stringify(body.settings) : null,
        },
        include: {
          _count: {
            select: {
              users: true,
              devices: true,
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: organization
      }, { status: 201 });
    })(request, {});

    return result;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
