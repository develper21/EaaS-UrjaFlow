'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/components/Icons';
import { Layout } from '@/components/Layout';
import { RoleGuard } from '@/components/RoleGuard';
export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalUsers: number;
  totalDevices: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDevices: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Icons.zap size={48} className="animate-pulse text-green-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System administration and overview</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Icons.users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Icons.cpu className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Icons.dollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <Icons.star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </div>
        </div>

        <RoleGuard roles={['SUPER_ADMIN']}>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                <Icons.users className="h-5 w-5 mr-2" />
                Manage Users
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                <Icons.settings className="h-5 w-5 mr-2" />
                System Settings
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                <Icons.download className="h-5 w-5 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </RoleGuard>
      </div>
    </Layout>
  );
}
