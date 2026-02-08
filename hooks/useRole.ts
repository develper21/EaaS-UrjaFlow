import { useSession } from 'next-auth/react';

export function useRole() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'VIEWER';

  const hasRole = (role: string | string[]) => {
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.includes(userRole);
  };

  const hasAllRoles = (roles: string[]) => {
    return roles.every(role => userRole === role);
  };

  const isAdmin = () => {
    return ['SUPER_ADMIN', 'ORG_ADMIN'].includes(userRole);
  };

  const isSuperAdmin = () => {
    return userRole === 'SUPER_ADMIN';
  };

  const isOrgAdmin = () => {
    return userRole === 'ORG_ADMIN';
  };

  const isManager = () => {
    return userRole === 'MANAGER';
  };

  const isViewer = () => {
    return userRole === 'VIEWER';
  };

  const canAccess = (feature: string) => {
    const permissions = {
      SUPER_ADMIN: [
        'admin', 'organizations', 'billing', 'plans', 'analytics', 
        'reports', 'support', 'users', 'devices'
      ],
      ORG_ADMIN: [
        'organizations', 'billing', 'plans', 'analytics', 
        'reports', 'support', 'users', 'devices'
      ],
      MANAGER: [
        'analytics', 'reports', 'support', 'devices'
      ],
      VIEWER: [
        'analytics', 'reports'
      ]
    };

    return permissions[userRole as keyof typeof permissions]?.includes(feature) || false;
  };

  return {
    role: userRole,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isSuperAdmin,
    isOrgAdmin,
    isManager,
    isViewer,
    canAccess
  };
}
