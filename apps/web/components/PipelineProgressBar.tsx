'use client';

import { PIPELINE_STEP_ORDER } from '@oncovax/shared';

const STEP_LABELS: Record<string, string> = {
  alignment: 'Alignment',
  variant_calling: 'Variant Calling',
  hla_typing: 'HLA Typing',
  neoantigen_prediction: 'Neoantigen Prediction',
  structure_prediction: 'Structure Prediction',
  ranking: 'Ranking',
  mrna_design: 'mRNA Design',
};

interface PipelineProgressBarProps {
  currentStep: string | null;
  stepsCompleted: string[];
  status: string;
}

export default function PipelineProgressBar({ currentStep, stepsCompleted, status }: PipelineProgressBarProps) {
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {PIPELINE_STEP_ORDER.map((step, i) => {
          const isCompleted = stepsCompleted.includes(step);
          const isCurrent = currentStep === step;
          const isFailedStep = isFailed && isCurrent;

          let bgColor = 'bg-gray-200';
          let textColor = 'text-gray-400';
          let ringColor = '';

          if (isCompleted) {
            bgColor = 'bg-green-500';
            textColor = 'text-green-700';
          } else if (isFailedStep) {
            bgColor = 'bg-red-500';
            textColor = 'text-red-700';
            ringColor = 'ring-2 ring-red-300';
          } else if (isCurrent && !isCancelled) {
            bgColor = 'bg-blue-500 animate-pulse';
            textColor = 'text-blue-700';
            ringColor = 'ring-2 ring-blue-300';
          }

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${bgColor} ${ringColor}`}>
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : isFailedStep ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`mt-1 text-[10px] font-medium leading-tight text-center max-w-[72px] ${textColor}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {i < PIPELINE_STEP_ORDER.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
