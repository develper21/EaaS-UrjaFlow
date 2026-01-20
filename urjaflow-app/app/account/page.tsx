'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icons';
import { Layout } from '@/components/Layout';
import { Modal } from '@/components/Modal';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    company: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch user profile data
  const { data: profileData, error } = useSWR<import('@/types').ApiResponse<import('@prisma/client').User>>('/api/account/profile', fetcher);

  // Update form when profile data loads
  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        name: profileData.data.name || session?.user?.name || '',
        email: profileData.data.email || session?.user?.email || '',
        phone: profileData.data.phone || '',
        company: profileData.data.company || '',
        address: profileData.data.address || '',
      });
    }
  }, [profileData, session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const handlePasswordChange = async () => {
    setShowPasswordModal(true);
  };

  const handle2FA = async () => {
    setShow2FAModal(true);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Password changed successfully!');
        setShowPasswordModal(false);
      } else {
        setMessage(result.error || 'Failed to change password');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const enable2FA = async () => {
    try {
      const response = await fetch('/api/account/enable-2fa', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setMessage('2FA enabled successfully!');
        setShow2FAModal(false);
      } else {
        setMessage(result.error || 'Failed to enable 2FA');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/account/delete', {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          router.push('/auth/signin');
        } else {
          setMessage(result.error || 'Failed to delete account');
        }
      } catch {
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Icon name="alertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Failed to load profile</h2>
            <p className="text-gray-600 mt-2">Please check your connection and try again</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`rounded-lg p-4 ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
            <div className="flex">
              <Icon name={message.includes('success') ? 'checkCircle' : 'alertCircle'} size={20} className="mr-3" />
              <p>{message}</p>
            </div>
          </div>
        )}

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
                    disabled
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-gray-500"
                    title="Email cannot be changed here"
                  />
                  <p className="mt-1 text-sm text-gray-500">Contact support to change email</p>
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
                <button
                  onClick={handlePasswordChange}
                  className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Change Password
                </button>
                <button
                  onClick={handle2FA}
                  className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
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
              <button
                onClick={handleDeleteAccount}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
          <div className="p-6">
            <PasswordChangeForm onSubmit={changePassword} onCancel={() => setShowPasswordModal(false)} />
          </div>
        </Modal>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} title="Two-Factor Authentication">
          <div className="p-6">
            <TwoFASetupForm onSubmit={enable2FA} onCancel={() => setShow2FAModal(false)} />
          </div>
        </Modal>
      )}
    </Layout>
  );
}

// Password Change Form Component
function PasswordChangeForm({ onSubmit, onCancel }: { onSubmit: (current: string, newPassword: string) => void; onCancel: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    await onSubmit(currentPassword, newPassword);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}

// 2FA Setup Form Component
function TwoFASetupForm({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <Icon name="shield" size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Enable Two-Factor Authentication</h3>
        <p className="text-gray-600 mb-6">Add an extra layer of security to your account</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">Scan this QR code with your authenticator app:</p>
          <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
            <Icon name="fileText" size={64} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 mb-2">Or enter this code manually:</p>
          <code className="text-lg font-mono text-blue-900">ABCD-EFGH-IJKL-MNOP</code>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Verification Code</label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-center"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Enabling...' : 'Enable 2FA'}
        </button>
      </div>
    </form>
  );
}
