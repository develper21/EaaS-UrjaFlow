import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use raw query to avoid type issues
    const user = await prisma.$queryRaw`
      SELECT 
        id, 
        email, 
        name, 
        phone, 
        company, 
        address, 
        created_at as "createdAt", 
        role 
      FROM "User" 
      WHERE id = ${session.user.id}
    `;

    if (!user || (user as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (user as any[])[0],
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Use raw query to avoid type issues
    const updatedUser = await prisma.$queryRaw`
      UPDATE "User" 
      SET 
        name = COALESCE(${validatedData.name}, name),
        phone = COALESCE(${validatedData.phone}, phone),
        company = COALESCE(${validatedData.company}, company),
        address = COALESCE(${validatedData.address}, address),
        updated_at = NOW()
      WHERE id = ${session.user.id}
      RETURNING 
        id, 
        email, 
        name, 
        phone, 
        company, 
        address, 
        updated_at as "updatedAt"
    `;

    return NextResponse.json({
      success: true,
      data: (updatedUser as any[])[0],
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
