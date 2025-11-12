import { ReactNode } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icons } from '@/components/Icons';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icons.zap size={48} className="mx-auto mb-4 animate-pulse text-green-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="flex h-16 items-center px-6 border-b">
          <Icons.zap size={24} className="text-green-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">UrjaFlow Admin</span>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Icons.barChart size={20} className="mr-3" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Icons.user size={20} className="mr-3" />
            Users
          </Link>
          <Link
            href="/admin/devices"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Icons.settings size={20} className="mr-3" />
            Devices
          </Link>
          <Link
            href="/admin/invoices"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Icons.fileText size={20} className="mr-3" />
            Invoices
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Icons.trendingUp size={20} className="mr-3" />
            Analytics
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Icons.settings size={20} className="mr-3" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{session.user?.name}</span>
            <Link
              href="/api/auth/signout"
              className="text-gray-600 hover:text-gray-900"
            >
              Sign out
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
