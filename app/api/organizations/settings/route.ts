import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = (session.user as { organizationId?: string }).organizationId;
    let organization = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!organization) {
      return NextResponse.json({
        name: 'UrjaFlow Energy Corp',
        domain: 'app.urjaflow.com',
        logo: '',
        primaryColor: '#10b981',
        secondaryColor: '#3b82f6',
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        emergencyContacts: ['support@urjaflow.com'],
        maintenanceWindow: {
          start: '22:00',
          end: '06:00',
          days: ['Saturday', 'Sunday'],
        },
      });
    }

    let parsedSettings = {};
    if (organization.settings) {
      try {
        parsedSettings = JSON.parse(organization.settings);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      name: organization.name,
      domain: organization.domain || `${organization.slug}.urjaflow.com`,
      logo: organization.logo || '',
      primaryColor: organization.primaryColor || '#10b981',
      secondaryColor: organization.secondaryColor || '#3b82f6',
      timezone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      emergencyContacts: ['operations@urjaflow.com'],
      maintenanceWindow: {
        start: '22:00',
        end: '06:00',
        days: ['Saturday', 'Sunday'],
      },
      ...parsedSettings,
    });
  } catch (error) {
    console.error('Failed to fetch organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = (session.user as { organizationId?: string }).organizationId;
    const body = await request.json();

    if (orgId) {
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          name: body.name,
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          settings: JSON.stringify(body),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings saved' });
  } catch (error) {
    console.error('Failed to update organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}
