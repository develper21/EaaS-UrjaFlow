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
  inverse?: boolean;
}

export function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  className,
  iconColor = 'text-emerald-600',
  inverse = false,
}: StatCardProps) {
  const isGoodTrend = inverse ? !trend?.isPositive : trend?.isPositive;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {/* Top subtle highlight glow */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
            {unit && <span className="text-sm sm:text-base font-semibold text-gray-500">{unit}</span>}
          </div>

          {trend ? (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold',
                  isGoodTrend ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}
              >
                <Icon
                  name="trendingUp"
                  size={12}
                  className={cn(
                    isGoodTrend ? 'text-emerald-600' : 'text-red-600',
                    !trend.isPositive && 'rotate-180'
                  )}
                />
                <span>{Math.abs(trend.value)}%</span>
              </span>
              <span className="text-[11px] text-gray-400">vs last period</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Real-time Telemetry</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-emerald-50/80',
            iconColor
          )}
        >
          <Icon name={icon} size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;

