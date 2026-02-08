import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiLogger } from '@/lib/logger';

// Helper function to get user with organizationId
function getUserWithOrg(session: any) {
  return {
    ...session.user,
    organizationId: session.user.organizationId || null
  };
}

// GET /api/rest/organizations - List organizations
export async function GET(request: NextRequest) {
  try {
    apiLogger.info('Fetching organizations list');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      apiLogger.warn('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const user = getUserWithOrg(session);
    let where = {};
    
    // Role-based filtering
    if (user.role === 'SUPER_ADMIN') {
      // Super admin can see all organizations
      where = {};
    } else if (user.role === 'ORG_ADMIN') {
      // Org admin can see their own organization
      where = { id: user.organizationId };
    } else {
      // Other roles can't see organizations
      return NextResponse.json([], { status: 200 });
    }

    const organizations = await prisma.organization.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            users: true,
            devices: true,
          }
        },
        subscriptions: {
          include: {
            plan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    apiLogger.success(`Found ${organizations.length} organizations`);
    return NextResponse.json(organizations);
  } catch (error) {
    apiLogger.error('Failed to fetch organizations', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/rest/organizations - Create organization
export async function POST(request: NextRequest) {
  try {
    apiLogger.info('Creating new organization');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(getUserWithOrg(session).role)) {
      apiLogger.warn('Unauthorized organization creation attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Create new organization
    const newOrg = await prisma.organization.create({
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

    apiLogger.success(`Organization created: ${newOrg.name}`);
    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    apiLogger.error('Failed to create organization', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
