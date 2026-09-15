'use client';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign up for free
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

            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="demo@urjaflow.com"
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
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="demo123"
                      className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-green-600 hover:text-green-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>Demo: demo@urjaflow.com / demo123</p>
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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icons.zap size={48} className="mx-auto mb-4 animate-pulse text-green-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
