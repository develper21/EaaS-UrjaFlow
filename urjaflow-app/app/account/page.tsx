'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icons';

export default function AccountPage() {
  const [formData, setFormData] = useState({
    name: 'Demo User',
    email: 'demo@urjaflow.com',
    phone: '+1 (555) 123-4567',
    company: 'UrjaFlow Inc.',
    address: '123 Solar Street, San Francisco, CA 94102',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Implement API call
    console.log('Save profile:', formData);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your profile and preferences</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Profile Information</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Security */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Security</h2>
              <div className="space-y-4">
                <button className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  Change Password
                </button>
                <button className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Profile Picture</h3>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                  <Icon name="user" size={48} className="text-green-700" />
                </div>
                <button className="text-sm font-medium text-green-600 hover:text-green-700">
                  Upload New Photo
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Devices</span>
                  <span className="font-medium text-gray-900">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Energy</span>
                  <span className="font-medium text-gray-900">1,245 kWh</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
              <h3 className="mb-2 font-semibold text-red-900">Danger Zone</h3>
              <p className="mb-4 text-sm text-red-700">
                Once you delete your account, there is no going back.
              </p>
              <button className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
