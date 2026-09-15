'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Icon, IconName } from './Icons';
import { cn } from '@/lib/utils';

import { NotificationDropdown } from './NotificationDropdown';

interface NavItem {
  name: string;
  href: string;
  icon: IconName;
}

const getNavigationByRole = (role: string): NavItem[] => {
  const baseNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: 'home' },
    { name: 'Account', href: '/account', icon: 'user' },
  ];

  const roleBasedNavigation = {
    SUPER_ADMIN: [
      { name: 'Organizations', href: '/organizations', icon: 'building2' },
      { name: 'Analytics', href: '/analytics', icon: 'barChart' },
      { name: 'Reports', href: '/reports', icon: 'fileText' },
      { name: 'Plans', href: '/plans', icon: 'zap' },
      { name: 'Billing', href: '/billing', icon: 'creditCard' },
      { name: 'Support', href: '/support', icon: 'helpCircle' },
      { name: 'Admin', href: '/admin', icon: 'settings' },
    ],
    ORG_ADMIN: [
      { name: 'Organizations', href: '/organizations', icon: 'building2' },
      { name: 'Analytics', href: '/analytics', icon: 'barChart' },
      { name: 'Reports', href: '/reports', icon: 'fileText' },
      { name: 'Plans', href: '/plans', icon: 'zap' },
      { name: 'Billing', href: '/billing', icon: 'creditCard' },
      { name: 'Support', href: '/support', icon: 'helpCircle' },
    ],
    MANAGER: [
      { name: 'Analytics', href: '/analytics', icon: 'barChart' },
      { name: 'Reports', href: '/reports', icon: 'fileText' },
      { name: 'Support', href: '/support', icon: 'helpCircle' },
    ],
    VIEWER: [
      { name: 'Analytics', href: '/analytics', icon: 'barChart' },
      { name: 'Reports', href: '/reports', icon: 'fileText' },
    ],
  } as const;

  return [...baseNavigation, ...(roleBasedNavigation[role as keyof typeof roleBasedNavigation] || [])];
};

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const navigation = getNavigationByRole(session?.user?.role || 'VIEWER');

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icon name="zap" size={48} className="mx-auto mb-4 animate-pulse text-green-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

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
            {navigation.map((item: NavItem) => {
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full text-left text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 backdrop-blur-md px-4 shadow-xs lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Icon name={sidebarOpen ? 'close' : 'menu'} size={22} />
            </button>

            {/* Organization / Site Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200/80 bg-gray-50/90 px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-gray-900">Demo Energy Corp</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Site Array A1</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Notifications Popover */}
            <NotificationDropdown />

            {/* Settings Quick Link */}
            <Link
              href="/account"
              className="rounded-xl p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              title="Account Settings"
            >
              <Icon name="settings" size={20} />
            </Link>

            {/* User Quick Profile Chip */}
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2.5 pl-2 ml-1 border-l border-gray-200 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 text-white font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                {(session?.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">
                  {session?.user?.name || 'Demo User'}
                </p>
                <p className="text-[10px] text-gray-400 leading-none">
                  {session?.user?.role || 'VIEWER'}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
