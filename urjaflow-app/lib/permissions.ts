import { User } from '@prisma/client';

export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',

  // Organization Management
  VIEW_ORGANIZATION = 'view_organization',
  UPDATE_ORGANIZATION = 'update_organization',
  MANAGE_ORGANIZATION_SETTINGS = 'manage_organization_settings',
  VIEW_ORGANIZATION_USERS = 'view_organization_users',
  MANAGE_ORGANIZATION_SUBSCRIPTION = 'manage_organization_subscription',

  // Device Management
  VIEW_DEVICES = 'view_devices',
  CREATE_DEVICES = 'create_devices',
  UPDATE_DEVICES = 'update_devices',
  DELETE_DEVICES = 'delete_devices',
  MANAGE_DEVICE_SETTINGS = 'manage_device_settings',

  // Analytics & Reports
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_ADVANCED_ANALYTICS = 'view_advanced_analytics',
  EXPORT_DATA = 'export_data',
  GENERATE_REPORTS = 'generate_reports',
  VIEW_COMPARATIVE_ANALYTICS = 'view_comparative_analytics',

  // Billing & Invoices
  VIEW_INVOICES = 'view_invoices',
  MANAGE_BILLING = 'manage_billing',
  PROCESS_PAYMENTS = 'process_payments',
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',

  // Support
  VIEW_SUPPORT_TICKETS = 'view_support_tickets',
  MANAGE_SUPPORT_TICKETS = 'manage_support_tickets',
  ASSIGN_TICKETS = 'assign_tickets',

  // System Administration
  SYSTEM_SETTINGS = 'system_settings',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  MANAGE_SYSTEM_BACKUPS = 'manage_system_backups',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.values(Permission), // All permissions
  
  ORG_ADMIN: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_ORGANIZATION,
    Permission.UPDATE_ORGANIZATION,
    Permission.MANAGE_ORGANIZATION_SETTINGS,
    Permission.VIEW_ORGANIZATION_USERS,
    Permission.MANAGE_ORGANIZATION_SUBSCRIPTION,
    Permission.VIEW_DEVICES,
    Permission.CREATE_DEVICES,
    Permission.UPDATE_DEVICES,
    Permission.DELETE_DEVICES,
    Permission.MANAGE_DEVICE_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_ADVANCED_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_COMPARATIVE_ANALYTICS,
    Permission.VIEW_INVOICES,
    Permission.MANAGE_BILLING,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.MANAGE_SUPPORT_TICKETS,
    Permission.ASSIGN_TICKETS,
  ],
  
  MANAGER: [
    Permission.VIEW_USERS,
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_ORGANIZATION_USERS,
    Permission.VIEW_DEVICES,
    Permission.CREATE_DEVICES,
    Permission.UPDATE_DEVICES,
    Permission.MANAGE_DEVICE_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_ADVANCED_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.MANAGE_SUPPORT_TICKETS,
    Permission.ASSIGN_TICKETS,
  ],
  
  VIEWER: [
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_DEVICES,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_SUPPORT_TICKETS,
  ],
};

export class PermissionService {
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  }

  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.some(permission => userPermissions.includes(permission));
  }

  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.every(permission => userPermissions.includes(permission));
  }

  static canAccessOrganization(user: User | null, organizationId: string): boolean {
    if (!user) return false;
    
    // Super admins can access any organization
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Users can only access their own organization
    return user.organizationId === organizationId;
  }

  static canManageUser(user: User | null, targetUser: User): boolean {
    if (!user) return false;
    
    // Super admins can manage anyone
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Org admins can manage users in their organization (except other org admins)
    if (user.role === 'ORG_ADMIN' && 
        user.organizationId === targetUser.organizationId && 
        targetUser.role !== 'ORG_ADMIN' && 
        targetUser.role !== 'SUPER_ADMIN') {
      return true;
    }
    
    // Managers can manage viewers in their organization
    if (user.role === 'MANAGER' && 
        user.organizationId === targetUser.organizationId && 
        targetUser.role === 'VIEWER') {
      return true;
    }
    
    return false;
  }

  static getPermissionsByRole(role: string): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  static getRoleHierarchy(): Record<string, number> {
    return {
      'SUPER_ADMIN': 100,
      'ORG_ADMIN': 80,
      'MANAGER': 60,
      'VIEWER': 40,
    };
  }

  static canUpgradeRole(user: User | null, targetRole: string): boolean {
    if (!user) return false;
    
    const hierarchy = this.getRoleHierarchy();
    const userLevel = hierarchy[user.role] || 0;
    const targetLevel = hierarchy[targetRole] || 0;
    
    // Only super admins can assign super admin role
    if (targetRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return false;
    }
    
    // User can only assign roles lower than their own level
    return userLevel > targetLevel;
  }
}
