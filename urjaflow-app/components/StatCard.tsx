import React from 'react';
import { Icon, IconName } from './Icons';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: IconName;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  className,
  iconColor = 'text-green-600',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {unit && <span className="text-lg text-gray-500">{unit}</span>}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <Icon
                name={trend.isPositive ? 'trendingUp' : 'trendingUp'}
                size={16}
                className={cn(
                  trend.isPositive ? 'text-green-600' : 'text-red-600',
                  !trend.isPositive && 'rotate-180'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-full bg-green-50 p-3', iconColor)}>
          <Icon name={icon} size={24} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
