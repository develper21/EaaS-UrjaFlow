'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Invoice } from '@/types';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BillingPage() {
  const { data: session } = useSession();

  // Fetch billing data
  const { data: billingData, error, isLoading } = useSWR('/api/billing', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  if (error) return (
    <Layout>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Icon name="alertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load billing</h2>
          <p className="text-gray-600 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    </Layout>
  );

  if (isLoading || !billingData?.data) return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="mt-2 text-gray-600">Manage your subscription and payment history</p>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );

  const { currentSubscription, nextInvoice, invoices, paymentMethods } = billingData.data;

  const handlePayNow = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/billing/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      const result = await response.json();

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        alert(result.error || 'Failed to process payment');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const response = await fetch('/api/billing/payment-method', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || 'Failed to update payment method');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/billing/invoice/${invoiceId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download invoice');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="mt-2 text-gray-600">Manage your subscription and payment history</p>
        </div>

        {/* Current Plan */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
              <p className="mt-1 text-gray-600">{currentSubscription?.plan?.name || 'No active plan'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(currentSubscription?.plan?.price || 0)}
              </p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
          </div>
        </div>

        {/* Next Invoice */}
        {nextInvoice && (
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-yellow-100 p-2">
                  <Icon name="alertTriangle" size={24} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upcoming Payment</h3>
                  <p className="mt-1 text-gray-600">{nextInvoice.description}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Due: {formatDate(nextInvoice.dueDate, 'long')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(nextInvoice.amount)}
                </p>
                <button
                  onClick={() => handlePayNow(nextInvoice.id)}
                  className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Payment Method</h2>
          {paymentMethods?.length > 0 ? (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <Icon name="creditCard" size={32} className="text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {paymentMethods[0].type} ending in {paymentMethods[0].last4}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires {paymentMethods[0].expMonth}/{paymentMethods[0].expYear}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleUpdatePaymentMethod}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Update
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="creditCard" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No payment method on file</p>
              <button 
                onClick={handleUpdatePaymentMethod}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                Add Payment Method
              </button>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Billing History</h2>
          {invoices?.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice: Invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex items-center gap-4">
                    <Icon name="fileText" size={24} className="text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(invoice.paidAt || invoice.dueDate)}
                      </p>
                    </div>
                    <div className={`rounded-full px-3 py-1 ${
                      invoice.status === 'PAID' 
                        ? 'bg-green-100 text-green-700' 
                        : invoice.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className="text-sm font-medium">
                        {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Icon name="download" size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="fileText" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invoices yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
