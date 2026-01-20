'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { PlanCard } from '@/components/PlanCard';
import { Plan } from '@/types';

// Mock plans data
const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'Perfect for small homes and apartments',
    price: 29.99,
    currency: 'USD',
    features: [
      'Up to 5 devices',
      'Real-time monitoring',
      'Monthly reports',
      'Email support',
      '100GB data storage',
    ],
    maxDevices: 5,
    maxStorage: 100,
    priority: 1,
    stripePriceId: null,
    active: true,
  },
  {
    id: '2',
    name: 'Professional',
    description: 'Ideal for medium-sized installations',
    price: 79.99,
    currency: 'USD',
    features: [
      'Up to 20 devices',
      'Real-time monitoring',
      'Advanced analytics',
      'Priority support',
      '500GB data storage',
      'API access',
      'Custom alerts',
    ],
    maxDevices: 20,
    maxStorage: 500,
    priority: 2,
    stripePriceId: null,
    active: true,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large-scale commercial operations',
    price: 199.99,
    currency: 'USD',
    features: [
      'Unlimited devices',
      'Real-time monitoring',
      'Advanced analytics',
      '24/7 phone support',
      'Unlimited data storage',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    maxDevices: 999,
    maxStorage: 999999,
    priority: 3,
    stripePriceId: null,
    active: true,
  },
];

export default function PlansPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentPlanId = '2'; // Mock current plan

  const handleSubscribe = async (planId: string) => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/plans');
      return;
    }

    if (status === 'loading') {
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-4 text-lg text-gray-600">
            Select the perfect plan for your energy monitoring needs
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto max-w-2xl rounded-lg bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="text-red-600">⚠️</div>
              <div>
                <p className="font-semibold text-red-800">Payment Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onSubscribe={handleSubscribe}
              loading={loading === plan.id}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 rounded-lg border border-gray-200 bg-white p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">Can I change my plan later?</h3>
              <p className="mt-2 text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the
                start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What payment methods do you accept?</h3>
              <p className="mt-2 text-gray-600">
                We accept all major credit cards, debit cards, and ACH bank transfers through our
                secure payment processor Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Is there a free trial?</h3>
              <p className="mt-2 text-gray-600">
                Yes! All new customers get a 14-day free trial with full access to all features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
