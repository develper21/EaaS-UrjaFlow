import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get FAQs
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// Create support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, description, category, priority } = body;

    const userId = session.user.id;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        description,
        category: category || 'General',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Support ticket created successfully',
    });
  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}
