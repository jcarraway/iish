'use client';

import type { TimelineEntry } from '@/lib/manufacturing-orders';

interface OrderTimelineProps {
  timeline: TimelineEntry[];
  onStepClick?: (status: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  completed: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700' },
  current: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-700' },
  upcoming: { bg: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-400' },
};

function getStepState(entry: TimelineEntry): 'completed' | 'current' | 'upcoming' {
  if (entry.completed) return 'completed';
  if (entry.current) return 'current';
  return 'upcoming';
}

export default function OrderTimeline({ timeline, onStepClick }: OrderTimelineProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-[640px]">
        {timeline.map((entry, idx) => {
          const state = getStepState(entry);
          const colors = STATUS_COLORS[state];
          const isLast = idx === timeline.length - 1;

          return (
            <div key={entry.status} className="flex items-start flex-1 min-w-0">
              <div
                className={`flex flex-col items-center ${onStepClick ? 'cursor-pointer' : ''}`}
                onClick={() => onStepClick?.(entry.status)}
              >
                {/* Circle */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${colors.border} ${colors.bg}`}
                >
                  {state === 'completed' ? (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : state === 'current' ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  )}
                </div>

                {/* Label */}
                <p className={`mt-2 text-xs font-medium text-center max-w-[80px] leading-tight ${colors.text}`}>
                  {entry.label}
                </p>

                {/* Date */}
                {entry.date && (
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mt-4 mx-1">
                  <div
                    className={`h-0.5 w-full ${
                      state === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
