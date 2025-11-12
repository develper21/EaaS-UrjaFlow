'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Icon } from '@/components/Icons';
import { FAQ, SupportTicket } from '@/types';

// Mock FAQs
const MOCK_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'How do I monitor my energy production in real-time?',
    answer:
      'Navigate to your Dashboard to see live energy production, consumption, and battery status. The data updates every few seconds.',
    category: 'Monitoring',
    order: 1,
    active: true,
  },
  {
    id: '2',
    question: 'What happens if my internet connection goes down?',
    answer:
      'Your devices will continue to operate normally. Data will be cached locally and synced once the connection is restored.',
    category: 'Technical',
    order: 2,
    active: true,
  },
  {
    id: '3',
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes! You can change your plan at any time from the Plans page. Changes take effect at the start of your next billing cycle.',
    category: 'Billing',
    order: 3,
    active: true,
  },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical',
    priority: 'MEDIUM',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Implement API call
    console.log('Submit ticket:', formData);
    setTimeout(() => {
      setSubmitting(false);
      setFormData({ subject: '', category: 'Technical', priority: 'MEDIUM', description: '' });
    }, 2000);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <p className="mt-2 text-gray-600">Get help with your UrjaFlow account</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Submit a Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option>Technical</option>
                  <option>Billing</option>
                  <option>General</option>
                  <option>Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Icon name="mail" size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">support@urjaflow.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="phone" size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">1-800-URJAFLOW</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="clock" size={20} className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Support Hours</p>
                    <p className="font-medium text-gray-900">24/7 for Enterprise</p>
                    <p className="text-sm text-gray-600">Mon-Fri 9AM-6PM for others</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Response Times</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Low Priority</span>
                  <span className="font-medium text-gray-900">48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medium Priority</span>
                  <span className="font-medium text-gray-900">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Priority</span>
                  <span className="font-medium text-gray-900">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent</span>
                  <span className="font-medium text-gray-900">1 hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {MOCK_FAQS.map((faq) => (
              <div key={faq.id} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
