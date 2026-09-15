import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sampleGeneratedReports = [
      {
        id: 'rep-001',
        title: 'Monthly Energy Summary - September 2026',
        format: 'PDF',
        generatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        size: 1024 * 340, // 340 KB
        downloadUrl: '#',
      },
      {
        id: 'rep-002',
        title: 'Quarterly Performance Analysis Q3',
        format: 'EXCEL',
        generatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        size: 1024 * 180, // 180 KB
        downloadUrl: '#',
      },
      {
        id: 'rep-003',
        title: 'System Efficiency & Audit Report',
        format: 'PDF',
        generatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        size: 1024 * 512, // 512 KB
        downloadUrl: '#',
      },
    ];

    return NextResponse.json(sampleGeneratedReports);
  } catch (error) {
    console.error('Failed to fetch generated reports:', error);
    return NextResponse.json({ error: 'Failed to fetch generated reports' }, { status: 500 });
  }
}
