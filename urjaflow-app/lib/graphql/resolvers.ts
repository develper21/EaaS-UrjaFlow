import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { PermissionService, Permission } from '../permissions';

const prisma = new PrismaClient();

export interface GraphQLContext {
  user: User | null;
  prisma: PrismaClient;
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

interface DeviceFilter {
  type?: string;
  status?: string;
  organizationId?: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

type GenericInput = Record<string, unknown>;

export const resolvers = {
  Query: {
    // Authentication
    me: async (_: unknown, __: unknown, { user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Authentication required');
      return user;
    },

    // Organizations
    organizations: async (_: unknown, __: unknown, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_ORGANIZATION)) {
        throw new GraphQLError('Insufficient permissions');
      }

      if (user?.role === 'SUPER_ADMIN') {
        return prisma.organization.findMany();
      }

      return prisma.organization.findMany({
        where: { id: user?.organizationId || undefined }
      });
    },

    organization: async (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_ORGANIZATION)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const org = await prisma.organization.findUnique({ where: { id } });
      if (!org) throw new GraphQLError('Organization not found');

      if (!PermissionService.canAccessOrganization(user, id)) {
        throw new GraphQLError('Access denied');
      }

      return org;
    },

    // Devices
    devices: async (_: unknown, { filter, pagination }: { filter?: DeviceFilter; pagination?: PaginationInput }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const where: import('@prisma/client').Prisma.DeviceWhereInput = {};

      if (filter?.type) where.type = filter.type;
      if (filter?.status) where.status = filter.status;

      // Apply organization filter
      if (user?.role !== 'SUPER_ADMIN') {
        where.organizationId = user?.organizationId;
      } else if (filter?.organizationId) {
        where.organizationId = filter.organizationId;
      }

      const { page = 1, limit = 20 } = pagination || {};
      const skip = (page - 1) * limit;

      return prisma.device.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          organization: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    device: async (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const device = await prisma.device.findUnique({
        where: { id },
        include: {
          user: true,
          organization: true,
        }
      });

      if (!device) throw new GraphQLError('Device not found');

      if (user?.role !== 'SUPER_ADMIN' &&
        device.organizationId !== user?.organizationId) {
        throw new GraphQLError('Access denied');
      }

      return device;
    },

    deviceReadings: async (_: unknown, { deviceId, dateRange, pagination }: { deviceId: string; dateRange?: DateRange; pagination?: PaginationInput }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) throw new GraphQLError('Device not found');

      if (user?.role !== 'SUPER_ADMIN' &&
        device.organizationId !== user?.organizationId) {
        throw new GraphQLError('Access denied');
      }

      const where: import('@prisma/client').Prisma.DeviceReadingWhereInput = { deviceId };
      if (dateRange) {
        where.timestamp = {
          gte: new Date(dateRange.startDate),
          lte: new Date(dateRange.endDate)
        };
      }

      const { page = 1, limit = 100 } = pagination || {};
      const skip = (page - 1) * limit;

      return prisma.deviceReading.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      });
    },

    // Users
    users: async (_: unknown, { organizationId, pagination }: { organizationId?: string; pagination?: PaginationInput }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_USERS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const where: import('@prisma/client').Prisma.UserWhereInput = {};

      if (user?.role !== 'SUPER_ADMIN') {
        where.organizationId = user?.organizationId;
      } else if (organizationId) {
        where.organizationId = organizationId;
      }

      const { page = 1, limit = 20 } = pagination || {};
      const skip = (page - 1) * limit;

      return prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          organization: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    user: async (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_USERS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const targetUser = await prisma.user.findUnique({
        where: { id },
        include: {
          organization: true,
        }
      });

      if (!targetUser) throw new GraphQLError('User not found');

      if (!PermissionService.canManageUser(user, targetUser)) {
        throw new GraphQLError('Access denied');
      }

      return targetUser;
    },

    // Plans
    plans: async () => {
      return prisma.plan.findMany({
        where: { active: true },
        orderBy: { priority: 'asc' }
      });
    },

    plan: async (_: unknown, { id }: { id: string }) => {
      return prisma.plan.findUnique({ where: { id } });
    },

    // Analytics
    analytics: async (_: unknown, { organizationId, dateRange }: { organizationId?: string; dateRange?: DateRange }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_ANALYTICS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const targetOrgId = user?.role === 'SUPER_ADMIN' ? organizationId : user?.organizationId;

      // Get device readings for the period
      const where: import('@prisma/client').Prisma.DeviceReadingWhereInput = {};
      if (dateRange) {
        where.timestamp = {
          gte: new Date(dateRange.startDate),
          lte: new Date(dateRange.endDate)
        };
      }

      const readings = await prisma.deviceReading.findMany({
        where: {
          ...where,
          device: {
            organizationId: targetOrgId
          }
        },
        include: {
          device: true
        }
      });

      // Calculate analytics
      const totalGeneration = readings.reduce((sum, r) => sum + (r.generationKW || 0), 0);
      const totalConsumption = readings.reduce((sum, r) => sum + (r.consumptionKW || 0), 0);
      const netEnergy = totalGeneration - totalConsumption;
      const avgEfficiency = readings.length > 0
        ? readings.reduce((sum, r) => sum + (r.efficiency || 0), 0) / readings.length
        : 0;

      return {
        energyStats: {
          totalGeneration,
          totalConsumption,
          netEnergy,
          efficiency: avgEfficiency,
          costSavings: netEnergy * 0.12, // $0.12 per kWh
          carbonOffset: netEnergy * 0.0005, // metric tons CO2
          period: dateRange ? `${dateRange.startDate} - ${dateRange.endDate}` : 'all time'
        },
        deviceStats: [], // Would be calculated per device
        trends: {},
        predictions: {}
      };
    },

    // Support
    supportTickets: async (_: unknown, { organizationId, pagination }: { organizationId?: string; pagination?: PaginationInput }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.VIEW_SUPPORT_TICKETS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const where: import('@prisma/client').Prisma.SupportTicketWhereInput = {};

      if (user?.role !== 'SUPER_ADMIN') {
        where.organizationId = user?.organizationId;
      } else if (organizationId) {
        where.organizationId = organizationId;
      }

      const { page = 1, limit = 20 } = pagination || {};
      const skip = (page - 1) * limit;

      return prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          organization: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    faqs: async (_: unknown, { category }: { category?: string }) => {
      const where: import('@prisma/client').Prisma.FAQWhereInput = { active: true };
      if (category) where.category = category;

      return prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' }
      });
    },

    // Notifications
    notifications: async (_: unknown, { userId, organizationId, pagination }: { userId?: string; organizationId?: string; pagination?: PaginationInput }, { user }: GraphQLContext) => {
      const where: import('@prisma/client').Prisma.NotificationWhereInput = {};

      if (user?.role === 'SUPER_ADMIN') {
        if (userId) where.userId = userId;
        if (organizationId) where.organizationId = organizationId;
      } else {
        where.organizationId = user?.organizationId;
        if (userId) where.userId = userId;
      }

      const { page = 1, limit = 20 } = pagination || {};
      const skip = (page - 1) * limit;

      return prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          organization: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  },

  Mutation: {
    // Authentication
    login: async (_: unknown, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { organization: true }
      });

      if (!user || !user.password) {
        throw new GraphQLError('Invalid credentials');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError('Invalid credentials');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '7d' }
      );

      return {
        user,
        token
      };
    },

    // Organizations
    createOrganization: async (_: unknown, { input }: { input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.UPDATE_ORGANIZATION)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const data = input as import('@prisma/client').Prisma.OrganizationCreateInput;

      return prisma.organization.create({
        data: {
          ...data,
          settings: data.settings ? JSON.stringify(data.settings) : null
        }
      });
    },

    updateOrganization: async (_: unknown, { id, input }: { id: string; input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.UPDATE_ORGANIZATION)) {
        throw new GraphQLError('Insufficient permissions');
      }

      if (!PermissionService.canAccessOrganization(user, id)) {
        throw new GraphQLError('Access denied');
      }

      const data = input as import('@prisma/client').Prisma.OrganizationUpdateInput;

      return prisma.organization.update({
        where: { id },
        data: {
          ...data,
          settings: data.settings ? JSON.stringify(data.settings) : undefined
        }
      });
    },

    // Devices
    createDevice: async (_: unknown, { input }: { input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.CREATE_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const { organizationId, ...data } = input as { organizationId?: string } & GenericInput;

      const deviceData: import('@prisma/client').Prisma.DeviceCreateInput = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data as any),
        organization: {
          connect: { id: organizationId || user?.organizationId || '' }
        }
      };

      return prisma.device.create({
        data: deviceData,
        include: {
          user: true,
          organization: true,
        }
      });
    },

    updateDevice: async (_: unknown, { id, input }: { id: string; input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.UPDATE_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id } });
      if (!device) throw new GraphQLError('Device not found');

      if (user?.role !== 'SUPER_ADMIN' &&
        device.organizationId !== user?.organizationId) {
        throw new GraphQLError('Access denied');
      }

      const data = input as import('@prisma/client').Prisma.DeviceUpdateInput;

      return prisma.device.update({
        where: { id },
        data,
        include: {
          user: true,
          organization: true,
        }
      });
    },

    deleteDevice: async (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.DELETE_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id } });
      if (!device) throw new GraphQLError('Device not found');

      if (user?.role !== 'SUPER_ADMIN' &&
        device.organizationId !== user?.organizationId) {
        throw new GraphQLError('Access denied');
      }

      await prisma.device.delete({ where: { id } });

      return { success: true, message: 'Device deleted successfully' };
    },

    addDeviceReading: async (_: unknown, { input }: { input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.UPDATE_DEVICES)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const { deviceId, metadata, ...data } = input as { deviceId: string; metadata?: unknown } & GenericInput;

      // Check device access
      const device = await prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) throw new GraphQLError('Device not found');

      if (user?.role !== 'SUPER_ADMIN' &&
        device.organizationId !== user?.organizationId) {
        throw new GraphQLError('Access denied');
      }

      return prisma.deviceReading.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(data as any),
          device: { connect: { id: deviceId } },
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
    },

    // Users
    createUser: async (_: unknown, { input }: { input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.CREATE_USERS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const { organizationId, role, ...data } = input as { organizationId?: string; role: string } & GenericInput;

      // Check role upgrade permissions
      if (!PermissionService.canUpgradeRole(user, role)) {
        throw new GraphQLError('Cannot assign higher role');
      }

      const hashedPassword = await bcrypt.hash('tempPassword123', 10);

      const userData: import('@prisma/client').Prisma.UserCreateInput = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data as any),
        role,
        password: hashedPassword,
        emailVerified: new Date(),
        organization: organizationId ? { connect: { id: organizationId } } : undefined
      };

      return prisma.user.create({
        data: userData,
        include: {
          organization: true,
        }
      });
    },

    updateUser: async (_: unknown, { id, input }: { id: string; input: unknown }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.UPDATE_USERS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) throw new GraphQLError('User not found');

      if (!PermissionService.canManageUser(user, targetUser)) {
        throw new GraphQLError('Access denied');
      }

      const { password, role, ...data } = input as { password?: string; role?: string } & GenericInput;

      // Check role upgrade permissions
      if (role && !PermissionService.canUpgradeRole(user, role)) {
        throw new GraphQLError('Cannot assign higher role');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: import('@prisma/client').Prisma.UserUpdateInput = { ...(data as any) };
      if (role) updateData.role = role;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      return prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          organization: true,
        }
      });
    },

    // Support
    createSupportTicket: async (_: unknown, { input }: { input: unknown }, { user }: GraphQLContext) => {
      if (!user) throw new GraphQLError('Authentication required');

      const { organizationId, ...data } = input as { organizationId?: string } & GenericInput;

      const inputData = data as Record<string, unknown>;
      const ticketData: import('@prisma/client').Prisma.SupportTicketCreateInput = {
        subject: typeof inputData.subject === 'string' ? inputData.subject : '',
        description: typeof inputData.description === 'string' ? inputData.description : '',
        category: typeof inputData.category === 'string' ? inputData.category : 'General',
        priority: typeof inputData.priority === 'string' ? inputData.priority : 'MEDIUM',
        user: { connect: { id: user.id } },
        organization: { connect: { id: organizationId || user.organizationId || '' } }
      };

      return prisma.supportTicket.create({
        data: ticketData,
        include: {
          user: true,
          organization: true,
        }
      });
    },

    updateSupportTicket: async (_: unknown, { id, status, assignedTo }: { id: string; status?: string; assignedTo?: string }, { user }: GraphQLContext) => {
      if (!PermissionService.hasPermission(user, Permission.MANAGE_SUPPORT_TICKETS)) {
        throw new GraphQLError('Insufficient permissions');
      }

      const ticket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!ticket) throw new GraphQLError('Ticket not found');

      if (user?.role !== 'SUPER_ADMIN' &&
        ticket.organizationId !== user?.organizationId) {
        throw new GraphQLError('Access denied');
      }

      const updateData: import('@prisma/client').Prisma.SupportTicketUpdateInput = {};
      if (status) updateData.status = status;
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (status === 'RESOLVED') updateData.resolvedAt = new Date();

      return prisma.supportTicket.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          organization: true,
        }
      });
    }
  }
};
