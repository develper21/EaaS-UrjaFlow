import React from 'react';
import { useRole } from '@/hooks/useRole';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  feature?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, feature, fallback = null }: RoleGuardProps) {
  const { hasRole, canAccess } = useRole();

  // Check by roles
  if (roles && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  // Check by feature
  if (feature && !canAccess(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  children: React.ReactNode;
  roles?: string[];
  feature?: string;
}

export function ConditionalRender({ children, roles, feature }: ConditionalRenderProps) {
  const { hasRole, canAccess } = useRole();

  // Check by roles
  if (roles && !hasRole(roles)) {
    return null;
  }

  // Check by feature
  if (feature && !canAccess(feature)) {
    return null;
  }

  return <>{children}</>;
}
