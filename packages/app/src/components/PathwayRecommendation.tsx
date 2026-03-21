import { useState } from 'react';
import { View, Text, Pressable } from 'dripsy';
import type { RegulatoryPathwayType, RegulatoryDocumentType } from '@iish/shared';

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

const PATHWAY_COLORS: Record<RegulatoryPathwayType, { border: string; bg: string }> = {
  clinical_trial: { border: 'green300', bg: 'green50' },
  expanded_access: { border: 'blue300', bg: 'blue50' },
  right_to_try: { border: 'purple300', bg: 'purple100' },
  physician_ind: { border: 'amber300', bg: 'amber100' },
  consultation_needed: { border: 'gray300', bg: 'gray50' },
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
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`);
  return `${fmt(min)} \u2014 ${fmt(max)}`;
}

export function PathwayRecommendation({
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
  const pathwayColors = PATHWAY_COLORS[recommended] ?? PATHWAY_COLORS.consultation_needed;

  return (
    <View sx={{ gap: '$6' }}>
      {/* Recommended Pathway */}
      <View
        sx={{
          borderRadius: '$xl',
          borderWidth: 2,
          borderColor: pathwayColors.border,
          bg: pathwayColors.bg,
          p: '$6',
        }}
      >
        <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
          <View
            sx={{
              height: 32,
              width: 32,
              borderRadius: '$full',
              bg: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text sx={{ fontSize: '$base', color: 'green600' }}>{'\u2713'}</Text>
          </View>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, color: 'gray500' }}>
              Recommended Pathway
            </Text>
            <Text sx={{ mt: '$1', fontSize: '$lg', fontWeight: '700', color: 'gray900' }}>
              {PATHWAY_LABELS[recommended]}
            </Text>
          </View>
        </View>
        <Text sx={{ mt: '$4', fontSize: '$sm', color: 'gray700', lineHeight: 22 }}>{rationale}</Text>

        {/* Cost & Timeline */}
        <View sx={{ mt: '$4', flexDirection: 'row', gap: '$6' }}>
          <View>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Estimated Cost</Text>
            <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray900' }}>
              {formatCost(estimatedCostMin, estimatedCostMax)}
            </Text>
          </View>
          <View>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Estimated Timeline</Text>
            <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray900' }}>
              {estimatedTimelineWeeks} weeks
            </Text>
          </View>
        </View>
      </View>

      {/* Required Documents */}
      <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
        <Text sx={{ fontWeight: '600', color: 'gray900' }}>Required Documents</Text>
        <Text sx={{ mt: '$1', fontSize: '$xs', color: 'gray500' }}>
          Generate AI-drafted documents to get started. All documents require physician review
          before use.
        </Text>
        <View sx={{ mt: '$3', gap: '$2' }}>
          {requiredDocuments.map((docType) => (
            <View
              key={docType}
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray100',
                px: '$3',
                py: '$2',
              }}
            >
              <Text sx={{ fontSize: '$sm', color: 'gray700', flex: 1 }}>
                {DOCUMENT_LABELS[docType]}
              </Text>
              {onGenerateDocument && (
                <Pressable
                  onPress={() => onGenerateDocument(docType)}
                  sx={{ borderRadius: '$sm', bg: 'blue600', px: 10, py: '$1' }}
                >
                  <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>
                    Generate draft
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Alternative Pathways */}
      {alternatives.length > 0 && (
        <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900' }}>Alternative Pathways</Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            {alternatives.map((alt, i) => (
              <View key={alt.pathway} sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray100' }}>
                <Pressable
                  onPress={() =>
                    setExpandedAlts((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: '$3',
                    py: '$2',
                  }}
                >
                  <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700', flex: 1 }}>
                    {PATHWAY_LABELS[alt.pathway]}
                  </Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray400' }}>
                    {expandedAlts[i] ? '\u25B2' : '\u25BC'}
                  </Text>
                </Pressable>
                {expandedAlts[i] && (
                  <View sx={{ borderTopWidth: 1, borderColor: 'gray100', px: '$3', py: '$2' }}>
                    <Text sx={{ fontSize: '$sm', color: 'gray600' }}>{alt.rationale}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Important Disclaimer */}
      <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'amber200', bg: 'amber100', p: '$4' }}>
        <Text sx={{ fontSize: '$xs', fontWeight: '600', color: 'amber800' }}>
          Important Disclaimer
        </Text>
        <Text sx={{ mt: '$1', fontSize: '$xs', color: 'amber700', lineHeight: 18 }}>
          This pathway recommendation is generated by AI and is for informational purposes only.
          It does not constitute legal or medical advice. All regulatory decisions must be made in
          consultation with your physician and qualified regulatory professionals. Document drafts
          require thorough review by licensed professionals before submission to any regulatory
          body.
        </Text>
      </View>
    </View>
  );
}
