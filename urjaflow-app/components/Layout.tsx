'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, IconName } from './Icons';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: IconName;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: 'home' },
  { name: 'Plans', href: '/plans', icon: 'zap' },
  { name: 'Billing', href: '/billing', icon: 'creditCard' },
  { name: 'Support', href: '/support', icon: 'helpCircle' },
  { name: 'Account', href: '/account', icon: 'user' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
            <Icon name="zap" size={32} className="text-green-600" />
            <span className="text-xl font-bold text-gray-900">UrjaFlow</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon name={item.icon} size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Icon name="user" size={20} className="text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Demo User</p>
                <p className="text-xs text-gray-500">demo@urjaflow.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Icon name={sidebarOpen ? 'close' : 'menu'} size={24} />
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Icon name="bell" size={20} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Settings */}
          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Icon name="settings" size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
