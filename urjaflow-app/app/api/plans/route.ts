import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { priority: 'asc' },
    });

    // Parse features JSON string to array
    const parsedPlans = plans.map((plan) => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
    }));

    return NextResponse.json({
      success: true,
      data: parsedPlans,
    });
  } catch (error) {
    console.error('Plans API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
