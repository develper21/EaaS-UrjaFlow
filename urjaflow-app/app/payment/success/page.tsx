'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/billing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Icons.check size={48} className="text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="mb-8 text-lg text-gray-600">
          Thank you for subscribing to UrjaFlow. Your payment has been processed successfully.
        </p>

        {/* Details Card */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-gray-600">Status</span>
              <span className="flex items-center gap-2 font-semibold text-green-600">
                <Icons.check size={20} />
                Confirmed
              </span>
            </div>
            {sessionId && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-gray-600">Session ID</span>
                <span className="font-mono text-sm text-gray-900">
                  {sessionId.substring(0, 20)}...
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Redirecting in</span>
              <span className="text-2xl font-bold text-gray-900">{countdown}s</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/billing"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
          >
            <Icons.creditCard size={20} />
            View Billing Details
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Icons.home size={20} />
            Go to Dashboard
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Icons.info size={20} className="mt-0.5 text-blue-600" />
            <div className="text-left text-sm text-blue-900">
              <p className="font-semibold">What's next?</p>
              <p className="mt-1 text-blue-700">
                You'll receive a confirmation email shortly with your invoice and subscription
                details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
