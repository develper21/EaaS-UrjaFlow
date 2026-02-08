import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// This middleware will show custom logs during development
export function middleware(request: NextRequest) {
  const start = Date.now();
  const url = request.nextUrl.pathname;
  
  // Log incoming requests in development
  if (process.env.NODE_ENV === 'development') {
    logger.info(`${request.method} ${url}`);
    
    // Log API calls with more detail
    if (url.startsWith('/api/')) {
      logger.api(`API Request: ${request.method} ${url}`);
    }
  }

  const response = NextResponse.next();

  // Log response time in development
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - start;
    const status = response.status || 200;
    
    if (status >= 400) {
      logger.error(`${request.method} ${url} - ${status} (${duration}ms)`);
    } else if (status >= 300) {
      logger.warn(`${request.method} ${url} - ${status} (${duration}ms)`);
    } else {
      logger.success(`${request.method} ${url} - ${status} (${duration}ms)`);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
