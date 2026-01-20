'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons, Icon } from '@/components/Icons';
import { Modal } from '@/components/Modal';
import { StatCard } from '@/components/StatCard';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  plan: string;
  maxUsers: number;
  maxDevices: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    devices: number;
    subscriptions: number;
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function OrganizationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');

  useEffect(() => {
    if (session) {
      fetchOrganizations();
    }
  }, [session]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/rest/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        if (data.length > 0) {
          setSelectedOrg(data[0]);
          await fetchUsers(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (orgId: string) => {
    try {
      const response = await fetch(`/api/rest/organizations/${orgId}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.zap size={48} className="animate-pulse text-green-600" />
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-2 text-gray-600">Manage your organizations and teams</p>
        </div>
        
        <div className="text-center py-12">
          <Icon name="building2" size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first organization</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
          <p className="mt-2 text-gray-600">Manage {selectedOrg.name}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedOrg.id}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value);
              if (org) {
                setSelectedOrg(org);
                fetchUsers(org.id);
              }
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            New Organization
          </button>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={selectedOrg._count.users.toString()}
          icon="users"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Devices"
          value={selectedOrg._count.devices.toString()}
          icon="cpu"
          iconColor="text-green-600"
        />
        <StatCard
          title="Active Subscriptions"
          value={selectedOrg._count.subscriptions.toString()}
          icon="creditCard"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Plan"
          value={selectedOrg.plan}
          icon="star"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: 'barChart3' },
            { id: 'users', label: 'Users', icon: 'users' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name={tab.icon as any} size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Overview</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedOrg.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedOrg.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Domain</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedOrg.domain || 'Not configured'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedOrg.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(selectedOrg.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(selectedOrg.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Icon name="userPlus" className="w-4 h-4 mr-2" />
              Invite User
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Icon name="user" className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  defaultValue={selectedOrg.name}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <input
                  type="text"
                  defaultValue={selectedOrg.domain || ''}
                  placeholder="your-domain.com"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <input
                    type="color"
                    defaultValue={selectedOrg.primaryColor}
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                  <input
                    type="color"
                    defaultValue={selectedOrg.secondaryColor}
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Organization">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  placeholder="Enter organization name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  placeholder="organization-slug"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
