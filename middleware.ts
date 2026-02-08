import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Role-based route access
const roleBasedRoutes = {
  '/admin': ['SUPER_ADMIN'],
  '/organizations': ['SUPER_ADMIN', 'ORG_ADMIN'],
  '/billing': ['SUPER_ADMIN', 'ORG_ADMIN'],
  '/plans': ['SUPER_ADMIN', 'ORG_ADMIN'],
  '/analytics': ['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'VIEWER'],
  '/reports': ['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'VIEWER'],
  '/support': ['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER'],
};

export default withAuth(
  function middleware(req) {
    const start = Date.now();
    const url = req.nextUrl.pathname;
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`${req.method} ${url}`);
    }

    // Allow access to auth pages
    if (url.startsWith('/auth')) {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        logger.success(`${req.method} ${url} - 200 (${duration}ms)`);
      }
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!req.nextauth.token) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Redirecting to signin: ${url}`);
      }
      
      return NextResponse.redirect(signInUrl);
    }

    const userRole = req.nextauth.token.role as string;

    // Check if route requires specific role
    const routeKey = Object.keys(roleBasedRoutes).find(route => 
      url.startsWith(route)
    );

    if (routeKey) {
      const requiredRoles = roleBasedRoutes[routeKey as keyof typeof roleBasedRoutes];
      
      if (!requiredRoles.includes(userRole)) {
        // Redirect to dashboard if user doesn't have required role
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Access denied for ${userRole}: ${url}`);
        }
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      logger.success(`${req.method} ${url} - 200 (${duration}ms) [${userRole}]`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true;
        }
        // Require token for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
