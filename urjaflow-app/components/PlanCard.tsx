import React from 'react';
import { Plan } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Icon } from './Icons';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSubscribe?: (planId: string) => void;
  loading?: boolean;
}

export function PlanCard({ plan, isCurrentPlan, onSubscribe, loading }: PlanCardProps) {
  const features = typeof plan.features === 'string' 
    ? JSON.parse(plan.features) 
    : plan.features;

  return (
    <div
      className={`relative rounded-lg border-2 bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
        isCurrentPlan
          ? 'border-green-500 ring-2 ring-green-200'
          : 'border-gray-200 hover:border-green-300'
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-sm font-semibold text-white">
          Current Plan
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-gray-600">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-gray-600">/month</span>
        </div>
      </div>

      <ul className="mb-8 space-y-3">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start gap-3">
            <Icon name="check" size={20} className="mt-0.5 shrink-0 text-green-600" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe?.(plan.id)}
        disabled={isCurrentPlan || loading}
        className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
          isCurrentPlan
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading ? 'Processing...' : isCurrentPlan ? 'Active' : 'Subscribe'}
      </button>
    </div>
  );
}

export default PlanCard;
