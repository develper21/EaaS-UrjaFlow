import React from 'react';
import { cn } from '@/lib/utils';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface ChartBarsProps {
  data: ChartData[];
  height?: number;
  className?: string;
  unit?: string;
}

export function ChartBars({ data, height = 220, className, unit = 'kW' }: ChartBarsProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('w-full select-none pt-4', className)}>
      <div
        className="flex w-full items-stretch justify-between gap-3 sm:gap-4"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          // Ensure a tiny visible notch (min 3%) if value > 0 so even small numbers are clearly visible
          const computedHeight = item.value > 0 ? Math.max(percentage, 4) : 0;

          return (
            <div
              key={index}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              {/* Bar track container */}
              <div className="relative flex w-full flex-1 items-end justify-center rounded-t-xl bg-gray-50/80 p-1.5 transition-all duration-200 group-hover:bg-gray-100/70 border border-gray-100">
                {/* Floating tooltip on hover */}
                <div className="pointer-events-none absolute -top-9 z-20 hidden items-center rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg transition-all group-hover:flex">
                  <span>{item.value.toFixed(1)} {unit}</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>

                {/* Animated bar */}
                <div
                  className={cn(
                    'relative flex w-full max-w-[44px] flex-col items-center justify-start rounded-t-lg transition-all duration-500 ease-out shadow-xs',
                    item.color || 'bg-gradient-to-t from-emerald-600 via-green-500 to-emerald-400'
                  )}
                  style={{ height: `${computedHeight}%` }}
                >
                  {/* Subtle top glow highlight */}
                  <div className="h-1 w-full rounded-t-lg bg-white/40" />

                  {/* Value label above bar if bar is short, or inside bar if bar is tall */}
                  <div
                    className={cn(
                      'pointer-events-none absolute text-[11px] font-bold transition-all',
                      computedHeight > 25
                        ? 'top-1.5 text-white drop-shadow-sm'
                        : '-top-5 text-gray-700 font-semibold'
                    )}
                  >
                    {item.value.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* X-axis day/time label */}
              <div className="mt-2 text-center text-xs font-medium text-gray-600 transition-colors group-hover:font-semibold group-hover:text-gray-900">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartBars;

