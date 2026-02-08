import React from 'react';
import { cn } from '@/lib/utils';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartBarsProps {
  data: ChartData[];
  height?: number;
  className?: string;
}

export function ChartBars({ data, height = 200, className }: ChartBarsProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex-1">
                <div
                  className={cn(
                    'absolute bottom-0 w-full rounded-t-lg transition-all duration-300',
                    item.color || 'bg-green-500'
                  )}
                  style={{ height: `${barHeight}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700">
                    {item.value.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartBars;
