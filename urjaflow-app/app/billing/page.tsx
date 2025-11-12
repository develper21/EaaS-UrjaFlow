'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Invoice } from '@/types';

// Mock invoices data
const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    userId: '1',
    subscriptionId: '1',
    invoiceNumber: 'INV-2024-001',
    amount: 79.99,
    currency: 'USD',
    status: 'PAID',
    dueDate: new Date('2024-01-01'),
    paidAt: new Date('2024-01-01'),
    stripeInvoiceId: null,
    description: 'Professional Plan - January 2024',
    metadata: null,
    createdAt: new Date('2023-12-25'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: '1',
    subscriptionId: '1',
    invoiceNumber: 'INV-2024-002',
    amount: 79.99,
    currency: 'USD',
    status: 'PAID',
    dueDate: new Date('2024-02-01'),
    paidAt: new Date('2024-02-01'),
    stripeInvoiceId: null,
    description: 'Professional Plan - February 2024',
    metadata: null,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    userId: '1',
    subscriptionId: '1',
    invoiceNumber: 'INV-2024-003',
    amount: 79.99,
    currency: 'USD',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    paidAt: null,
    stripeInvoiceId: null,
    description: 'Professional Plan - Current Month',
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function BillingPage() {
  const nextInvoice = MOCK_INVOICES.find((inv) => inv.status === 'PENDING');
  const paidInvoices = MOCK_INVOICES.filter((inv) => inv.status === 'PAID');

  const handlePayNow = (invoiceId: string) => {
    console.log('Pay invoice:', invoiceId);
    // TODO: Implement Stripe payment
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
              <p className="mt-1 text-gray-600">Professional Plan</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(79.99)}</p>
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
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Icon name="creditCard" size={32} className="text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                <p className="text-sm text-gray-600">Expires 12/2025</p>
              </div>
            </div>
            <button className="text-sm font-medium text-green-600 hover:text-green-700">
              Update
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Billing History</h2>
          <div className="space-y-4">
            {paidInvoices.map((invoice) => (
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
                  <div className="rounded-full bg-green-100 px-3 py-1">
                    <span className="text-sm font-medium text-green-700">Paid</span>
                  </div>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Icon name="download" size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
