import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const DEFAULT_ALERT_RULES = [
  {
    id: 'rule-001',
    name: 'Critical Voltage Drop',
    description: 'Triggers when inverter or meter voltage drops below 210V',
    type: 'VOLTAGE',
    threshold: 210,
    condition: 'LESS_THAN' as const,
    enabled: true,
    channels: ['email', 'push'] as ('email' | 'push' | 'sms')[],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-002',
    name: 'Battery Depletion Alert',
    description: 'Triggers when home battery storage falls below 20%',
    type: 'BATTERY',
    threshold: 20,
    condition: 'LESS_THAN' as const,
    enabled: true,
    channels: ['push'] as ('email' | 'push' | 'sms')[],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-003',
    name: 'Peak Consumption Spike',
    description: 'Alerts when consumption exceeds 6.0 kW unexpectedly',
    type: 'CONSUMPTION',
    threshold: 6.0,
    condition: 'GREATER_THAN' as const,
    enabled: true,
    channels: ['email', 'push'] as ('email' | 'push' | 'sms')[],
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(DEFAULT_ALERT_RULES);
  } catch (error) {
    console.error('Failed to fetch alert rules:', error);
    return NextResponse.json({ error: 'Failed to fetch alert rules' }, { status: 500 });
  }
}
