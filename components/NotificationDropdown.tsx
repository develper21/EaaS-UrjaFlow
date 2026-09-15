'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icon, IconName } from './Icons';
import { cn } from '@/lib/utils';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string; // 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT'
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 45s
    const timer = setInterval(fetchNotifications, 45000);
    return () => clearInterval(timer);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' }))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string): { name: IconName; color: string; bg: string } => {
    switch (type?.toUpperCase()) {
      case 'ALERT':
      case 'ERROR':
        return { name: 'alertCircle', color: 'text-red-600', bg: 'bg-red-50' };
      case 'WARNING':
        return { name: 'alertTriangle', color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'SUCCESS':
        return { name: 'checkCircle', color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default:
        return { name: 'info', color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 focus:outline-hidden',
          isOpen && 'bg-gray-100 text-gray-900 ring-2 ring-emerald-500/20'
        )}
        aria-label="Notifications"
        title="View Notifications"
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200/80 bg-white/95 p-0 shadow-2xl backdrop-blur-md z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="zap" size={24} className="animate-pulse text-emerald-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Icon name="bell" size={20} />
                </div>
                <p className="text-sm font-medium text-gray-800">All caught up!</p>
                <p className="text-xs text-gray-500 mt-0.5">No notifications at the moment</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => {
                const iconInfo = getTypeIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={cn(
                      'group flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-gray-50/80',
                      !notification.read && 'bg-emerald-50/30'
                    )}
                  >
                    <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconInfo.bg)}>
                      <Icon name={iconInfo.name} size={16} className={iconInfo.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn('text-xs font-semibold truncate', notification.read ? 'text-gray-800' : 'text-gray-900')}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-100"
                        title="Unread"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/70 p-2.5 text-center rounded-b-2xl">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
            >
              <span>View all notifications</span>
              <Icon name="arrowRight" size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
