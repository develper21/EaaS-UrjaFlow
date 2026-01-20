import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PermissionService, Permission } from './permissions';
import { prisma } from './prisma';

export interface RBACMiddlewareOptions {
  requiredPermissions?: Permission[];
  requireOrganization?: boolean;
  allowedRoles?: string[];
  skipAuth?: boolean;
}

export async function rbacMiddleware(
  request: NextRequest,
  options: RBACMiddlewareOptions = {}
) {
  const {
    requiredPermissions = [],
    requireOrganization = false,
    allowedRoles = [],
    skipAuth = false
  } = options;

  // Skip authentication if specified
  if (skipAuth) {
    return { user: null, organization: null, authorized: true };
  }

  // Get token from request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: token.email as string },
    include: {
      organization: true
    }
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 401 }
    );
  }

  // Check if user is active
  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 401 }
    );
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient role permissions' },
      { status: 403 }
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasPermission = PermissionService.hasAllPermissions(user, requiredPermissions);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  // Check organization access
  if (requireOrganization) {
    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'Organization membership required' },
        { status: 403 }
      );
    }

    // Get organization from URL or request body
    const url = new URL(request.url);
    const orgIdFromPath = url.pathname.split('/')[2]; // Assuming /org/[orgId]/...
    const orgIdFromQuery = url.searchParams.get('organizationId');
    const organizationId = orgIdFromPath || orgIdFromQuery;

    if (organizationId && !PermissionService.canAccessOrganization(user, organizationId)) {
      return NextResponse.json(
        { error: 'Access denied to this organization' },
        { status: 403 }
      );
    }
  }

  return { 
    user, 
    organization: user.organization,
    authorized: true 
  };
}

// Higher-order function for API routes
export function withRBAC(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: RBACMiddlewareOptions
) {
  return async (request: NextRequest, context: any) => {
    const rbacResult = await rbacMiddleware(request, options);
    
    // If rbacMiddleware returned a NextResponse, it's an error
    if (rbacResult instanceof NextResponse) {
      return rbacResult;
    }

    // Add user and organization to the context
    context.user = rbacResult.user;
    context.organization = rbacResult.organization;

    return handler(request, context);
  };
}

// Permission checking decorators for API routes
export const requirePermission = (permission: Permission) => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { requiredPermissions: [permission] });

export const requirePermissions = (permissions: Permission[]) => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { requiredPermissions: permissions });

export const requireRole = (role: string) => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { allowedRoles: [role] });

export const requireRoles = (roles: string[]) => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { allowedRoles: roles });

export const requireOrganization = () => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { requireOrganization: true });

export const requireOrgAdmin = () => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { allowedRoles: ['SUPER_ADMIN', 'ORG_ADMIN'] });

export const requireManager = () => 
  (handler: (req: NextRequest, context: any) => Promise<NextResponse>) => 
    withRBAC(handler, { allowedRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER'] });
