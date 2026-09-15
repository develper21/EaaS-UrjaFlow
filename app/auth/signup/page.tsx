'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Auto sign in after successful signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/');
        router.refresh();
      } else {
        router.push('/auth/signin?message=Account created successfully. Please sign in.');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center gap-2">
              <Icons.zap size={32} className="text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">UrjaFlow</h1>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Join UrjaFlow
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <Icons.alertCircle size={20} className="text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-4">
                <div className="flex">
                  <Icons.check size={20} className="text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm text-green-800">Account created successfully! Redirecting...</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="terms" className="block text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-green-600 hover:text-green-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-green-600 hover:text-green-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="relative hidden w-0 flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-800">
          {/* Ambient background glows */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

          <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-lg border border-white/20">
              <Icons.zap size={56} className="text-white drop-shadow-md" />
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-center">Energy as a Service</h2>
            <p className="max-w-md text-center text-lg text-emerald-50/90 leading-relaxed">
              Monitor your renewable energy systems in real-time. Track generation, consumption,
              and savings all in one place.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6 text-center w-full max-w-md">
              <div className="rounded-xl bg-white/10 backdrop-blur-xs p-4 border border-white/15 shadow-sm">
                <div className="text-3xl font-bold tracking-tight">24/7</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-100">Monitoring</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-xs p-4 border border-white/15 shadow-sm">
                <div className="text-3xl font-bold tracking-tight">Real-time</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-100">Analytics</div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-xs p-4 border border-white/15 shadow-sm">
                <div className="text-3xl font-bold tracking-tight">100%</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-100">Renewable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
