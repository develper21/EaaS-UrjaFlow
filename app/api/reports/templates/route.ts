import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const REPORT_TEMPLATES = [
  {
    id: 'energy-summary',
    name: 'Energy Summary Report',
    description: 'Comprehensive overview of energy generation, consumption, and efficiency metrics',
    format: 'PDF',
    sections: ['overview', 'generation', 'consumption', 'efficiency'],
    includeCharts: true,
    includeRecommendations: true,
  },
  {
    id: 'performance-analysis',
    name: 'Performance Analysis',
    description: 'Detailed analysis of device performance and optimization opportunities',
    format: 'EXCEL',
    sections: ['devices', 'readings', 'anomalies', 'predictions'],
    includeCharts: true,
    includeRecommendations: false,
  },
  {
    id: 'billing-report',
    name: 'Billing & Cost Analysis',
    description: 'Financial report including costs, savings, and ROI calculations',
    format: 'PDF',
    sections: ['billing', 'savings', 'roi', 'forecast'],
    includeCharts: true,
    includeRecommendations: true,
  },
  {
    id: 'compliance-report',
    name: 'Compliance & Audit Report',
    description: 'Regulatory compliance and audit trail documentation',
    format: 'PDF',
    sections: ['compliance', 'audit', 'security', 'documentation'],
    includeCharts: false,
    includeRecommendations: false,
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(REPORT_TEMPLATES);
  } catch (error) {
    console.error('Failed to fetch report templates:', error);
    return NextResponse.json({ error: 'Failed to fetch report templates' }, { status: 500 });
  }
}
