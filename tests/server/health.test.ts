/** @jest-environment node */

import { GET } from '@/app/api/health/route';

const mockQueryRaw = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: () => mockQueryRaw(),
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    mockQueryRaw.mockReset();
  });

  it('returns a healthy response when the database is reachable', async () => {
    mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'healthy',
      timestamp: expect.any(String),
      database: 'connected',
      environment: 'test',
      version: '1.0.0',
    });
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns a service-unavailable response when the database check fails', async () => {
    mockQueryRaw.mockRejectedValue(new Error('database unavailable'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      status: 'unhealthy',
      timestamp: expect.any(String),
      database: 'disconnected',
      error: 'database unavailable',
    });
  });
});
