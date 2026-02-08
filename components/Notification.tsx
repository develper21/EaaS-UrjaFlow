'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icons';
import { cn } from '@/lib/utils';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { ...notification, id }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const icons = {
    success: 'check',
    error: 'alertCircle',
    warning: 'alertTriangle',
    info: 'info',
  } as const;

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-80 rounded-lg border p-4 shadow-lg transition-all',
        colors[notification.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          name={icons[notification.type]}
          size={20}
          className={cn('mt-0.5', iconColors[notification.type])}
        />
        <div className="flex-1">
          <h4 className="font-semibold">{notification.title}</h4>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}

export default NotificationProvider;
