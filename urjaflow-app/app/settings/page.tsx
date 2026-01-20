'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from '@/components/Icons';
import { Modal } from '@/components/Modal';

interface UserSettings {
  email: string;
  name: string;
  phone: string;
  company: string;
  address: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  alertNotifications: boolean;
}

interface OrganizationSettings {
  name: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  emergencyContacts: string[];
  maintenanceWindow: {
    start: string;
    end: string;
    days: string[];
  };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email: session?.user?.email || '',
    name: '',
    phone: '',
    company: '',
    address: '',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    alertNotifications: true,
  });

  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings>({
    name: '',
    domain: '',
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    emergencyContacts: [],
    maintenanceWindow: {
      start: '22:00',
      end: '06:00',
      days: ['Saturday', 'Sunday'],
    },
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'organization'>('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const [userRes, orgRes] = await Promise.all([
        fetch('/api/account/profile'),
        fetch('/api/organizations/settings')
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserSettings(prev => ({ ...prev, ...userData }));
      }

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrganizationSettings(prev => ({ ...prev, ...orgData }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const saveUserSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const saveOrganizationSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organizations/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Organization settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save organization settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save organization settings' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon name={message.type === 'success' ? 'checkCircle' : 'alertCircle'} size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: 'user' },
            { id: 'preferences', label: 'Preferences', icon: 'settings' },
            { id: 'notifications', label: 'Notifications', icon: 'bell' },
            { id: 'organization', label: 'Organization', icon: 'building2' },
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
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={userSettings.email}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={userSettings.phone}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  value={userSettings.company}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={userSettings.address}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveUserSettings}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Security</h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Icon name="lock" size={16} className="mr-2" />
                Change Password
              </button>
              
              <button
                onClick={() => setShow2FAModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ml-4"
              >
                <Icon name="shield" size={16} className="mr-2" />
                Two-Factor Authentication
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Display Preferences</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select
                  value={userSettings.theme}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={userSettings.language}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select
                    value={userSettings.timezone}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select
                    value={userSettings.dateFormat}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Time Format</label>
                <select
                  value={userSettings.timeFormat}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveUserSettings}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Notification Channels</h4>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userSettings.emailNotifications}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userSettings.pushNotifications}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userSettings.smsNotifications}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Notification Types</h4>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userSettings.weeklyReports}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Weekly Reports</span>
                    <p className="text-sm text-gray-500">Get weekly energy usage summaries</p>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userSettings.monthlyReports}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, monthlyReports: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Monthly Reports</span>
                    <p className="text-sm text-gray-500">Get monthly detailed reports</p>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userSettings.alertNotifications}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, alertNotifications: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">System Alerts</span>
                    <p className="text-sm text-gray-500">Get notified about system issues and anomalies</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveUserSettings}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'organization' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Organization Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <input
                    type="text"
                    value={organizationSettings.name}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Custom Domain</label>
                  <input
                    type="text"
                    value={organizationSettings.domain}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="your-domain.com"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <input
                    type="color"
                    value={organizationSettings.primaryColor}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                  <input
                    type="color"
                    value={organizationSettings.secondaryColor}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={organizationSettings.currency}
                    onChange={(e) => setOrganizationSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveOrganizationSettings}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Organization Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} title="Two-Factor Authentication">
          <div className="p-6">
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

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
