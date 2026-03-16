import type {
  PathwayAssessmentInput,
  PathwayRecommendation,
  RegulatoryPathwayType,
  RegulatoryDocumentType,
} from '@oncovax/shared';

interface PathwayOption {
  pathway: RegulatoryPathwayType;
  rationale: string;
  documents: RegulatoryDocumentType[];
  costMin: number;
  costMax: number;
  timelineWeeks: number;
}

// Right-to-try availability by state (all US states have enacted right-to-try laws as of 2018 federal law)
const RIGHT_TO_TRY_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]);

const PATHWAY_OPTIONS: Record<RegulatoryPathwayType, Omit<PathwayOption, 'rationale'>> = {
  clinical_trial: {
    pathway: 'clinical_trial',
    documents: ['physician_letter', 'physician_discussion_guide'],
    costMin: 0,
    costMax: 25000,
    timelineWeeks: 4,
  },
  expanded_access: {
    pathway: 'expanded_access',
    documents: ['fda_form_3926', 'informed_consent', 'physician_letter', 'irb_protocol'],
    costMin: 50000,
    costMax: 200000,
    timelineWeeks: 8,
  },
  right_to_try: {
    pathway: 'right_to_try',
    documents: ['right_to_try_checklist', 'informed_consent', 'physician_letter', 'manufacturer_request'],
    costMin: 75000,
    costMax: 300000,
    timelineWeeks: 6,
  },
  physician_ind: {
    pathway: 'physician_ind',
    documents: ['ind_application', 'irb_protocol', 'informed_consent', 'physician_letter', 'manufacturer_request'],
    costMin: 100000,
    costMax: 400000,
    timelineWeeks: 16,
  },
  consultation_needed: {
    pathway: 'consultation_needed',
    documents: ['physician_discussion_guide'],
    costMin: 0,
    costMax: 0,
    timelineWeeks: 2,
  },
};

export function assessPathway(input: PathwayAssessmentInput): PathwayRecommendation {
  const options: PathwayOption[] = [];

  // Priority 1: Clinical trial — always recommended first
  options.push({
    ...PATHWAY_OPTIONS.clinical_trial,
    rationale: 'Clinical trials provide the highest level of safety monitoring, potential access to cutting-edge treatments at no cost, and contribute to advancing cancer research. This should always be the first option explored.',
  });

  // Priority 2: Expanded Access (Compassionate Use)
  if (input.isLifeThreatening && input.hasPhysician && input.hasExhaustedOptions) {
    options.push({
      ...PATHWAY_OPTIONS.expanded_access,
      rationale: 'FDA Expanded Access (Compassionate Use) is appropriate because the condition is life-threatening, standard treatments have been exhausted, and a physician is available to oversee treatment. Requires FDA Form 3926 and IRB review, but FDA approves >99% of emergency requests.',
    });
  }

  // Priority 3: Right to Try
  if (
    input.isLifeThreatening &&
    input.hasExhaustedOptions &&
    input.hasPhysician &&
    RIGHT_TO_TRY_STATES.has(input.stateOfResidence?.toUpperCase() ?? '')
  ) {
    options.push({
      ...PATHWAY_OPTIONS.right_to_try,
      rationale: 'Right to Try (federal law since 2018) allows access to investigational treatments that have completed Phase I trials. Does not require FDA approval but does require manufacturer willingness to provide the treatment. Your state supports Right to Try legislation.',
    });
  }

  // Priority 4: Physician IND
  if (input.hasPhysician && input.priorTreatmentsFailed >= 2) {
    options.push({
      ...PATHWAY_OPTIONS.physician_ind,
      rationale: 'A Physician-Sponsored Investigational New Drug (IND) application allows your physician to file directly with the FDA to administer the personalized vaccine. This is the most comprehensive pathway with full regulatory oversight but requires the most time and documentation.',
    });
  }

  // Fallback: Consultation needed
  if (options.length <= 1) {
    options.push({
      ...PATHWAY_OPTIONS.consultation_needed,
      rationale: !input.hasPhysician
        ? 'A physician is required for all regulatory pathways. We recommend discussing your personalized vaccine results with an oncologist who can help determine the best pathway forward.'
        : 'Based on your current situation, we recommend a detailed consultation with your physician to determine the most appropriate regulatory pathway for accessing your personalized vaccine.',
    });
  }

  const recommended = options[0];
  const alternatives = options.slice(1).map(o => ({
    pathway: o.pathway,
    rationale: o.rationale,
  }));

  return {
    recommended: recommended.pathway,
    rationale: recommended.rationale,
    alternatives,
    requiredDocuments: recommended.documents,
    estimatedCostMin: recommended.costMin,
    estimatedCostMax: recommended.costMax,
    estimatedTimelineWeeks: recommended.timelineWeeks,
  };
}
