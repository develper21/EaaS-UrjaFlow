import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { PermissionService } from '../permissions';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    // Authentication
    me: async (_: any, __: any, { user }: { user: any }) => {
      if (!user) throw new GraphQLError('Authentication required');
      return user;
    },

    // Organizations
    organizations: async (_: any, __: any, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_ORGANIZATION')) {
        throw new GraphQLError('Insufficient permissions');
      }
      
      if (user.role === 'SUPER_ADMIN') {
        return prisma.organization.findMany();
      }
      
      return prisma.organization.findMany({
        where: { id: user.organizationId }
      });
    },

    organization: async (_: any, { id }: { id: string }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_ORGANIZATION')) {
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
    devices: async (_: any, { filter, pagination }: any, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_DEVICES')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const where: any = {};
      
      if (filter?.type) where.type = filter.type;
      if (filter?.status) where.status = filter.status;
      
      // Apply organization filter
      if (user.role !== 'SUPER_ADMIN') {
        where.organizationId = user.organizationId;
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

    device: async (_: any, { id }: { id: string }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_DEVICES')) {
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

      if (user.role !== 'SUPER_ADMIN' && 
          device.organizationId !== user.organizationId) {
        throw new GraphQLError('Access denied');
      }

      return device;
    },

    deviceReadings: async (_: any, { deviceId, dateRange, pagination }: any, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_DEVICES')) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) throw new GraphQLError('Device not found');

      if (user.role !== 'SUPER_ADMIN' && 
          device.organizationId !== user.organizationId) {
        throw new GraphQLError('Access denied');
      }

      const where: any = { deviceId };
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
    users: async (_: any, { organizationId, pagination }: any, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_USERS')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const where: any = {};
      
      if (user.role !== 'SUPER_ADMIN') {
        where.organizationId = user.organizationId;
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

    user: async (_: any, { id }: { id: string }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_USERS')) {
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

    plan: async (_: any, { id }: { id: string }) => {
      return prisma.plan.findUnique({ where: { id } });
    },

    // Analytics
    analytics: async (_: any, { organizationId, dateRange }: any, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_ANALYTICS')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const targetOrgId = user.role === 'SUPER_ADMIN' ? organizationId : user.organizationId;
      
      // Get device readings for the period
      const where: any = {};
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
    supportTickets: async (_: any, { organizationId, pagination }: any, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'VIEW_SUPPORT_TICKETS')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const where: any = {};
      
      if (user.role !== 'SUPER_ADMIN') {
        where.organizationId = user.organizationId;
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

    faqs: async (_: any, { category }: { category?: string }) => {
      const where: any = { active: true };
      if (category) where.category = category;

      return prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' }
      });
    },

    // Notifications
    notifications: async (_: any, { userId, organizationId, pagination }: any, { user }: { user: any }) => {
      const where: any = {};
      
      if (user.role === 'SUPER_ADMIN') {
        if (userId) where.userId = userId;
        if (organizationId) where.organizationId = organizationId;
      } else {
        where.organizationId = user.organizationId;
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
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
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
    createOrganization: async (_: any, { input }: { input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'UPDATE_ORGANIZATION')) {
        throw new GraphQLError('Insufficient permissions');
      }

      return prisma.organization.create({
        data: {
          ...input,
          settings: input.settings ? JSON.stringify(input.settings) : null
        }
      });
    },

    updateOrganization: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'UPDATE_ORGANIZATION')) {
        throw new GraphQLError('Insufficient permissions');
      }

      if (!PermissionService.canAccessOrganization(user, id)) {
        throw new GraphQLError('Access denied');
      }

      return prisma.organization.update({
        where: { id },
        data: {
          ...input,
          settings: input.settings ? JSON.stringify(input.settings) : undefined
        }
      });
    },

    // Devices
    createDevice: async (_: any, { input }: { input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'CREATE_DEVICES')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const deviceData: any = {
        ...input,
        organizationId: input.organizationId || user.organizationId
      };

      return prisma.device.create({
        data: deviceData,
        include: {
          user: true,
          organization: true,
        }
      });
    },

    updateDevice: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'UPDATE_DEVICES')) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id } });
      if (!device) throw new GraphQLError('Device not found');

      if (user.role !== 'SUPER_ADMIN' && 
          device.organizationId !== user.organizationId) {
        throw new GraphQLError('Access denied');
      }

      return prisma.device.update({
        where: { id },
        data: input,
        include: {
          user: true,
          organization: true,
        }
      });
    },

    deleteDevice: async (_: any, { id }: { id: string }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'DELETE_DEVICES')) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id } });
      if (!device) throw new GraphQLError('Device not found');

      if (user.role !== 'SUPER_ADMIN' && 
          device.organizationId !== user.organizationId) {
        throw new GraphQLError('Access denied');
      }

      await prisma.device.delete({ where: { id } });
      
      return { success: true, message: 'Device deleted successfully' };
    },

    addDeviceReading: async (_: any, { input }: { input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'UPDATE_DEVICES')) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check device access
      const device = await prisma.device.findUnique({ where: { id: input.deviceId } });
      if (!device) throw new GraphQLError('Device not found');

      if (user.role !== 'SUPER_ADMIN' && 
          device.organizationId !== user.organizationId) {
        throw new GraphQLError('Access denied');
      }

      return prisma.deviceReading.create({
        data: {
          ...input,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null
        }
      });
    },

    // Users
    createUser: async (_: any, { input }: { input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'CREATE_USERS')) {
        throw new GraphQLError('Insufficient permissions');
      }

      // Check role upgrade permissions
      if (!PermissionService.canUpgradeRole(user, input.role)) {
        throw new GraphQLError('Cannot assign higher role');
      }

      const hashedPassword = await bcrypt.hash('tempPassword123', 10);

      return prisma.user.create({
        data: {
          ...input,
          password: hashedPassword,
          emailVerified: new Date()
        },
        include: {
          organization: true,
        }
      });
    },

    updateUser: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'UPDATE_USERS')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser) throw new GraphQLError('User not found');

      if (!PermissionService.canManageUser(user, targetUser)) {
        throw new GraphQLError('Access denied');
      }

      // Check role upgrade permissions
      if (input.role && !PermissionService.canUpgradeRole(user, input.role)) {
        throw new GraphQLError('Cannot assign higher role');
      }

      const updateData: any = { ...input };
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
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
    createSupportTicket: async (_: any, { input }: { input: any }, { user }: { user: any }) => {
      const ticketData: any = {
        ...input,
        userId: user.id,
        organizationId: input.organizationId || user.organizationId
      };

      return prisma.supportTicket.create({
        data: ticketData,
        include: {
          user: true,
          organization: true,
        }
      });
    },

    updateSupportTicket: async (_: any, { id, status, assignedTo }: { id: string; status?: string; assignedTo?: string }, { user }: { user: any }) => {
      if (!PermissionService.hasPermission(user, 'MANAGE_SUPPORT_TICKETS')) {
        throw new GraphQLError('Insufficient permissions');
      }

      const ticket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!ticket) throw new GraphQLError('Ticket not found');

      if (user.role !== 'SUPER_ADMIN' && 
          ticket.organizationId !== user.organizationId) {
        throw new GraphQLError('Access denied');
      }

      const updateData: any = {};
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
