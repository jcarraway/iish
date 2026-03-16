'use client';

import { SEQUENCING_ORDER_STATUSES } from '@oncovax/shared';

const STATUS_STEPS = [
  { key: SEQUENCING_ORDER_STATUSES.PENDING, label: 'Pending' },
  { key: SEQUENCING_ORDER_STATUSES.INSURANCE_CHECK, label: 'Insurance' },
  { key: SEQUENCING_ORDER_STATUSES.PRIOR_AUTH, label: 'Prior Auth' },
  { key: SEQUENCING_ORDER_STATUSES.SAMPLE_NEEDED, label: 'Sample Needed' },
  { key: SEQUENCING_ORDER_STATUSES.SAMPLE_RECEIVED, label: 'Sample Received' },
  { key: SEQUENCING_ORDER_STATUSES.PROCESSING, label: 'Processing' },
  { key: SEQUENCING_ORDER_STATUSES.RESULTS_READY, label: 'Results Ready' },
  { key: SEQUENCING_ORDER_STATUSES.COMPLETED, label: 'Completed' },
];

interface OrderProgressBarProps {
  currentStatus: string;
}

export default function OrderProgressBar({ currentStatus }: OrderProgressBarProps) {
  if (currentStatus === SEQUENCING_ORDER_STATUSES.CANCELLED) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-sm font-medium text-red-700">Cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center gap-0.5">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
              <div
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                      ? 'bg-blue-500 ring-4 ring-blue-100 animate-pulse'
                      : 'bg-gray-200'
                }`}
              >
                {isCompleted && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <span className={`mt-1 text-[10px] leading-tight text-center ${
              isCurrent ? 'font-semibold text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
