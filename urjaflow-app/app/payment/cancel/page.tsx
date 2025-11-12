'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md text-center">
        {/* Cancel Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
          <Icons.alertTriangle size={48} className="text-yellow-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="mb-8 text-lg text-gray-600">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        {/* Info Card */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <Icons.info size={20} className="mt-0.5 text-blue-600" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Why was my payment cancelled?</p>
                <p className="mt-1">
                  You may have closed the payment window or clicked the back button. Your
                  subscription has not been activated.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icons.helpCircle size={20} className="mt-0.5 text-gray-600" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Need help?</p>
                <p className="mt-1">
                  If you experienced any issues during checkout, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/plans"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
          >
            <Icons.refresh size={20} />
            Try Again
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Icons.home size={20} />
            Go to Dashboard
          </Link>
          <Link
            href="/support"
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Icons.helpCircle size={16} />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
