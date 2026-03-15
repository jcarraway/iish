'use client';

import type { MatchBreakdownItem, LLMAssessment } from '@oncovax/shared';

interface EligibilityBreakdownProps {
  items: MatchBreakdownItem[];
  llmAssessment?: LLMAssessment;
  potentialBlockers: string[];
  matchScore: number;
}

const categoryLabels: Record<string, string> = {
  cancerType: 'Cancer Type',
  stage: 'Stage',
  biomarkers: 'Biomarkers',
  priorTreatments: 'Prior Treatments',
  ecog: 'ECOG Status',
  age: 'Age',
};

function StatusIcon({ status }: { status: 'match' | 'unknown' | 'mismatch' }) {
  if (status === 'match') {
    return <span className="text-green-600 text-lg">&#10003;</span>;
  }
  if (status === 'mismatch') {
    return <span className="text-red-600 text-lg">&#10007;</span>;
  }
  return <span className="text-yellow-500 text-lg">?</span>;
}

function ScoreBar({ score, weight }: { score: number; weight: number }) {
  const barColor =
    score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{Math.round(weight * 100)}% weight</span>
    </div>
  );
}

function AssessmentBadge({ assessment }: { assessment: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    likely_eligible: { label: 'Likely Eligible', className: 'bg-green-100 text-green-800' },
    possibly_eligible: { label: 'Possibly Eligible', className: 'bg-yellow-100 text-yellow-800' },
    likely_ineligible: { label: 'Likely Ineligible', className: 'bg-red-100 text-red-800' },
  };
  const config = configs[assessment] ?? { label: assessment, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`text-sm font-medium px-3 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function EligibilityBreakdown({
  items,
  llmAssessment,
  potentialBlockers,
  matchScore,
}: EligibilityBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="flex items-center gap-4">
        <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${
          matchScore >= 70
            ? 'text-green-700 border-green-200 bg-green-50'
            : matchScore >= 40
              ? 'text-yellow-700 border-yellow-200 bg-yellow-50'
              : 'text-red-700 border-red-200 bg-red-50'
        }`}>
          <span className="text-2xl font-bold leading-none">{Math.round(matchScore)}</span>
          <span className="text-xs opacity-60">/ 100</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Match Score</h3>
          <p className="text-sm text-gray-500">Based on 6 eligibility dimensions</p>
        </div>
        {llmAssessment && (
          <div className="ml-auto">
            <AssessmentBadge assessment={llmAssessment.overallAssessment} />
          </div>
        )}
      </div>

      {/* Dimension breakdown */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.category} className="py-3 flex items-start gap-3">
            <StatusIcon status={item.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {categoryLabels[item.category] ?? item.category}
                </h4>
                <ScoreBar score={item.score} weight={item.weight} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Potential blockers */}
      {potentialBlockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Potential Concerns</h4>
          <ul className="space-y-1">
            {potentialBlockers.map((blocker, i) => (
              <li key={i} className="text-sm text-red-700 flex gap-2">
                <span className="shrink-0">&#8226;</span>
                {blocker}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* LLM Assessment details */}
      {llmAssessment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-blue-800">AI Assessment</h4>
          <p className="text-sm text-blue-900">{llmAssessment.reasoning}</p>

          {llmAssessment.missingInfo.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                Missing Information
              </h5>
              <ul className="space-y-0.5">
                {llmAssessment.missingInfo.map((info, i) => (
                  <li key={i} className="text-sm text-blue-800 flex gap-2">
                    <span className="shrink-0">&#8226;</span>
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {llmAssessment.actionItems.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                Recommended Next Steps
              </h5>
              <ul className="space-y-0.5">
                {llmAssessment.actionItems.map((action, i) => (
                  <li key={i} className="text-sm text-blue-800 flex gap-2">
                    <span className="shrink-0">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
