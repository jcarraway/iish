'use client';

import { useState } from 'react';
import type { RegulatoryPathwayType, RegulatoryDocumentType } from '@oncovax/shared';

interface PathwayRecommendationProps {
  recommended: RegulatoryPathwayType;
  rationale: string;
  alternatives: { pathway: RegulatoryPathwayType; rationale: string }[];
  requiredDocuments: RegulatoryDocumentType[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  estimatedTimelineWeeks: number;
  assessmentId: string;
  onGenerateDocument?: (docType: RegulatoryDocumentType) => void;
}

const PATHWAY_LABELS: Record<RegulatoryPathwayType, string> = {
  clinical_trial: 'Clinical Trial Enrollment',
  expanded_access: 'FDA Expanded Access (Compassionate Use)',
  right_to_try: 'Right to Try',
  physician_ind: 'Physician-Sponsored IND',
  consultation_needed: 'Physician Consultation Recommended',
};

const PATHWAY_COLORS: Record<RegulatoryPathwayType, string> = {
  clinical_trial: 'border-green-300 bg-green-50',
  expanded_access: 'border-blue-300 bg-blue-50',
  right_to_try: 'border-purple-300 bg-purple-50',
  physician_ind: 'border-amber-300 bg-amber-50',
  consultation_needed: 'border-gray-300 bg-gray-50',
};

const DOCUMENT_LABELS: Record<RegulatoryDocumentType, string> = {
  fda_form_3926: 'FDA Form 3926',
  right_to_try_checklist: 'Right to Try Checklist',
  informed_consent: 'Informed Consent',
  physician_letter: 'Physician Letter of Support',
  ind_application: 'IND Application Draft',
  irb_protocol: 'IRB Protocol Synopsis',
  manufacturer_request: 'Manufacturer Request Letter',
  physician_discussion_guide: 'Physician Discussion Guide',
};

function formatCost(min: number, max: number): string {
  if (min === 0 && max === 0) return 'No direct cost';
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  return `${fmt(min)} — ${fmt(max)}`;
}

export default function PathwayRecommendation({
  recommended,
  rationale,
  alternatives,
  requiredDocuments,
  estimatedCostMin,
  estimatedCostMax,
  estimatedTimelineWeeks,
  onGenerateDocument,
}: PathwayRecommendationProps) {
  const [expandedAlts, setExpandedAlts] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      {/* Recommended Pathway */}
      <div className={`rounded-xl border-2 p-6 ${PATHWAY_COLORS[recommended]}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Recommended Pathway</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{PATHWAY_LABELS[recommended]}</h3>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-700 leading-relaxed">{rationale}</p>

        {/* Cost & Timeline */}
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-xs text-gray-500">Estimated Cost</p>
            <p className="text-sm font-semibold text-gray-900">{formatCost(estimatedCostMin, estimatedCostMax)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Estimated Timeline</p>
            <p className="text-sm font-semibold text-gray-900">{estimatedTimelineWeeks} weeks</p>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="rounded-lg border border-gray-200 p-5">
        <h4 className="font-semibold text-gray-900">Required Documents</h4>
        <p className="mt-1 text-xs text-gray-500">Generate AI-drafted documents to get started. All documents require physician review before use.</p>
        <ul className="mt-3 space-y-2">
          {requiredDocuments.map(docType => (
            <li key={docType} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
              <span className="text-sm text-gray-700">{DOCUMENT_LABELS[docType]}</span>
              {onGenerateDocument && (
                <button
                  onClick={() => onGenerateDocument(docType)}
                  className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Generate draft
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Alternative Pathways */}
      {alternatives.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">Alternative Pathways</h4>
          <div className="mt-3 space-y-2">
            {alternatives.map((alt, i) => (
              <div key={alt.pathway} className="rounded-lg border border-gray-100">
                <button
                  onClick={() => setExpandedAlts(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                >
                  <span className="text-sm font-medium text-gray-700">{PATHWAY_LABELS[alt.pathway]}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${expandedAlts[i] ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expandedAlts[i] && (
                  <div className="border-t border-gray-100 px-3 py-2">
                    <p className="text-sm text-gray-600">{alt.rationale}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold text-amber-800">Important Disclaimer</p>
        <p className="mt-1 text-xs text-amber-700 leading-relaxed">
          This pathway recommendation is generated by AI and is for informational purposes only.
          It does not constitute legal or medical advice. All regulatory decisions must be made
          in consultation with your physician and qualified regulatory professionals. Document
          drafts require thorough review by licensed professionals before submission to any
          regulatory body.
        </p>
      </div>
    </div>
  );
}
