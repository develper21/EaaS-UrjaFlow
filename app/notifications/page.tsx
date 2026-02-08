'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icon, IconName } from '@/components/Icons';
import { Modal } from '@/components/Modal';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
  read: boolean;
  createdAt: string;
  metadata?: {
    deviceId?: string;
    deviceName?: string;
    actionUrl?: string;
  };
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: string;
  threshold: number;
  condition: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS';
  enabled: boolean;
  channels: ('email' | 'push' | 'sms')[];
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules' | 'settings'>('notifications');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (session) {
      fetchNotifications();
      fetchAlertRules();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertRules = async () => {
    try {
      const response = await fetch('/api/notifications/rules');
      if (response.ok) {
        const data = await response.json();
        setAlertRules(data);
      }
    } catch (error) {
      console.error('Failed to fetch alert rules:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const createAlertRule = async (ruleData: Partial<AlertRule>) => {
    try {
      const response = await fetch('/api/notifications/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });

      if (response.ok) {
        const newRule = await response.json();
        setAlertRules(prev => [...prev, newRule]);
        setShowCreateRuleModal(false);
      }
    } catch (error) {
      console.error('Failed to create alert rule:', error);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/notifications/rules/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setAlertRules(prev =>
          prev.map(r => r.id === ruleId ? { ...r, enabled } : r)
        );
      }
    } catch (error) {
      console.error('Failed to toggle alert rule:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const readFilter = filter === 'all' || (filter === 'read' ? notification.read : !notification.read);
    const typeFilterMatch = typeFilter === 'all' || notification.type === typeFilter;
    return readFilter && typeFilterMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string): IconName => {
    switch (type) {
      case 'SUCCESS': return 'checkCircle';
      case 'WARNING': return 'alertTriangle';
      case 'ERROR': return 'alertCircle';
      case 'ALERT': return 'bell';
      default: return 'info';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'ALERT': return 'text-purple-600 bg-purple-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="zap" size={48} className="animate-pulse text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">Manage your notifications and alert rules</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Icon name="check" className="w-4 h-4 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <Icon name="bell" size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <Icon name="checkCircle" size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <Icon name="settings" size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alert Rules</p>
              <p className="text-2xl font-semibold text-gray-900">{alertRules.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <Icon name="alertTriangle" size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-semibold text-gray-900">
                {alertRules.filter(r => r.enabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'notifications' as const, label: 'Notifications', icon: 'bell' as IconName },
            { id: 'rules' as const, label: 'Alert Rules', icon: 'settings' as IconName },
            { id: 'settings' as const, label: 'Settings', icon: 'cog' as IconName },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon name={tab.icon} size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                  <option value="ALERT">Alert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="bell" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">You&apos;re all caught up! No new notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white shadow rounded-lg p-6 ${!notification.read ? 'border-l-4 border-green-500' : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 rounded-full p-2 ${getNotificationColor(notification.type)}`}>
                        <Icon name={getNotificationIcon(notification.type)} size={16} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        {notification.metadata?.deviceName && (
                          <p className="text-sm text-gray-500 mt-2">
                            Device: {notification.metadata.deviceName}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as read"
                        >
                          <Icon name="check" size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Alert Rules</h3>
            <button
              onClick={() => setShowCreateRuleModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Icon name="plus" className="w-4 h-4 mr-2" />
              Create Rule
            </button>
          </div>

          {alertRules.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="settings" size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert Rules</h3>
              <p className="text-gray-600 mb-6">Create alert rules to get notified about important events</p>
              <button
                onClick={() => setShowCreateRuleModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Create Your First Rule
              </button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alertRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.condition} {rule.threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-1">
                          {rule.channels.map((channel) => (
                            <span
                              key={channel}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                            >
                              {channel}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rule.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleRule(rule.id, !rule.enabled)}
                          className={`${rule.enabled ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                            } mr-3`}
                        >
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Default Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                      <p className="text-sm text-gray-500">Receive notifications via email by default</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                      <p className="text-sm text-gray-500">Receive browser push notifications by default</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                      <p className="text-sm text-gray-500">Receive SMS notifications by default</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notification Frequency</h4>
                <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                  <option>Real-time</option>
                  <option>Every 15 minutes</option>
                  <option>Every hour</option>
                  <option>Daily digest</option>
                </select>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Quiet Hours</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    defaultValue="22:00"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">No notifications will be sent during these hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Rule Modal */}
      {showCreateRuleModal && (
        <Modal isOpen={showCreateRuleModal} onClose={() => setShowCreateRuleModal(false)} title="Create Alert Rule">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                <input
                  type="text"
                  placeholder="Enter rule name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Describe when this rule should trigger"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                    <option>Energy Generation</option>
                    <option>Energy Consumption</option>
                    <option>Device Status</option>
                    <option>Battery Level</option>
                    <option>System Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                    <option>Greater than</option>
                    <option>Less than</option>
                    <option>Equals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Threshold</label>
                <input
                  type="number"
                  placeholder="Enter threshold value"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notification Channels</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Push</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateRuleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createAlertRule({})}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
