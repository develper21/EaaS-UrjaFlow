import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
