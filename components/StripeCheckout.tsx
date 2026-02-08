'use client';

import React, { useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Icons } from './Icons';

interface StripeWithCheckout extends Stripe {
  redirectToCheckout(options: { sessionId: string }): Promise<{ error?: { message: string } }>;
}

const stripePromise: Promise<Stripe | null> = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripeCheckout({ 
  planId, 
  planName, 
  onSuccess,
  onError 
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // Create checkout session
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
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const result = await (stripe as StripeWithCheckout).redirectToCheckout({
        sessionId: data.data.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Icons.loader className="animate-spin" size={20} />
          Processing...
        </>
      ) : (
        <>
          <Icons.creditCard size={20} />
          Subscribe to {planName}
        </>
      )}
    </button>
  );
}
