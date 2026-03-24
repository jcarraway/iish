import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

// ============================================================================
// Constants
// ============================================================================

const MISCONCEPTIONS = [
  {
    myth: 'Palliative care means giving up on treatment.',
    reality:
      'Palliative care works alongside your cancer treatment. A landmark NEJM study showed patients who received early palliative care alongside treatment had better quality of life AND lived longer.',
  },
  {
    myth: 'Palliative care is the same as hospice.',
    reality:
      'Hospice is for end-of-life when curative treatment has stopped. Palliative care can start at any stage — even at diagnosis — and continues through active treatment.',
  },
  {
    myth: 'Palliative care is only for people who are dying.',
    reality:
      'Palliative care is for anyone with a serious illness at any stage. It focuses on symptom relief, emotional support, and improving quality of life while you continue all other treatments.',
  },
  {
    myth: 'If I ask for palliative care, my doctor will stop treating my cancer.',
    reality:
      'Palliative care is additive, not a replacement. Your oncology team continues all cancer-directed treatments. The palliative team focuses specifically on symptom management and quality of life.',
  },
  {
    myth: 'Palliative care means more medications and side effects.',
    reality:
      'Palliative care often reduces overall medication burden by better coordinating your care, identifying what works best for you, and deprescribing medications that are no longer helpful.',
  },
];

const WHEN_TO_CONSIDER = [
  'You have ongoing pain, nausea, fatigue, or other symptoms that affect your daily life',
  'You feel overwhelmed by treatment decisions or are experiencing emotional distress',
  'You want help communicating with your care team about your goals and priorities',
  'You are experiencing side effects from treatment that are hard to manage',
  'You or your family need additional support navigating the healthcare system',
];

const RESOURCES = [
  {
    name: 'GetPalliativeCare.org',
    url: 'https://getpalliativecare.org',
    description: 'National provider directory — find palliative care near you',
  },
  {
    name: 'Center to Advance Palliative Care (CAPC)',
    url: 'https://www.capc.org',
    description: 'Professional education, advocacy, and patient resources',
  },
  {
    name: 'NCCN Palliative Care Guidelines (Patient)',
    url: 'https://www.nccn.org/patients/guidelines/content/PDF/palliative-patient.pdf',
    description: 'Evidence-based clinical guidelines written for patients',
  },
  {
    name: 'National Hospice and Palliative Care Organization',
    url: 'https://www.nhpco.org',
    description: 'Comprehensive resources for patients and families',
  },
];

// ============================================================================
// Component
// ============================================================================

export function PalliativeEducationScreen() {
  const [expandedMisconception, setExpandedMisconception] = useState<number | null>(null);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/palliative">
          <Text sx={{ fontSize: 14, color: 'blue600', mb: '$4' }}>
            {'\u2190'} Back to Palliative Care
          </Text>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Understanding Palliative Care
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Evidence-based information to help you make informed decisions
        </Text>

        {/* ============================================================= */}
        {/* Reframing Section */}
        {/* ============================================================= */}
        <View
          sx={{
            mt: '$6',
            backgroundColor: '#F0FDF4',
            borderWidth: 2,
            borderColor: '#BBF7D0',
            borderRadius: 12,
            p: '$5',
          }}
        >
          <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '#166534' }}>
            Palliative Care is NOT Hospice
          </Text>
          <Text sx={{ mt: '$3', fontSize: 15, color: '#14532D', lineHeight: 24 }}>
            Palliative care is specialized medical care focused on providing relief from
            symptoms, pain, and stress of a serious illness. The goal is to improve quality
            of life for both you and your family. It is provided alongside curative
            treatment — not instead of it.
          </Text>
          <View
            sx={{
              mt: '$4',
              flexDirection: 'row',
              gap: '$4',
            }}
          >
            <View sx={{ flex: 1, backgroundColor: 'white', borderRadius: 8, p: '$3' }}>
              <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#166534' }}>PALLIATIVE</Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                Any stage of illness. Alongside treatment. Focus on symptoms + quality of life.
              </Text>
            </View>
            <View sx={{ flex: 1, backgroundColor: 'white', borderRadius: 8, p: '$3' }}>
              <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#166534' }}>HOSPICE</Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                End of life only. Curative treatment stopped. Focus on comfort + dignity.
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Key Evidence: Temel 2010 */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="The Evidence is Clear" />

          <View
            sx={{
              mt: '$4',
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              borderRadius: 12,
              p: '$5',
            }}
          >
            <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#1E40AF' }}>
              Temel et al. (2010) — New England Journal of Medicine
            </Text>
            <Text sx={{ mt: '$3', fontSize: 14, color: '#1E3A5F', lineHeight: 22 }}>
              In a landmark randomized controlled trial of 151 patients with metastatic
              non-small-cell lung cancer, those who received early palliative care integrated
              with standard oncologic care, compared with those who received standard oncologic
              care alone, had:
            </Text>

            <View sx={{ mt: '$4', gap: '$3' }}>
              <EvidenceItem
                label="Better quality of life"
                detail="Significant improvement on the FACT-L scale (98.0 vs 91.5, p=0.03)"
              />
              <EvidenceItem
                label="Less depression"
                detail="Fewer patients met criteria for depressive symptoms (16% vs 38%, p=0.01)"
              />
              <EvidenceItem
                label="Longer survival"
                detail="Median survival 11.6 vs 8.9 months — a 2.7-month improvement (p=0.02)"
              />
            </View>

            <Text sx={{ mt: '$4', fontSize: 12, color: '#3B82F6', fontStyle: 'italic' }}>
              Temel JS, Greer JA, Muzikansky A, et al. Early palliative care for patients
              with metastatic non-small-cell lung cancer. N Engl J Med. 2010;363(8):733-742.
            </Text>
          </View>

          <View
            sx={{
              mt: '$3',
              backgroundColor: '#F0F9FF',
              borderRadius: 8,
              p: '$4',
            }}
          >
            <Text sx={{ fontSize: 13, color: '#0C4A6E', lineHeight: 20 }}>
              This study changed clinical practice worldwide. The NCCN, ASCO, and WHO now
              recommend early integration of palliative care for all patients with serious
              cancer diagnoses.
            </Text>
          </View>
        </View>

        {/* ============================================================= */}
        {/* 5 Misconceptions */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Common Misconceptions" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            {MISCONCEPTIONS.map((item, i) => (
              <View
                key={i}
                sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <Pressable
                  onPress={() =>
                    setExpandedMisconception(expandedMisconception === i ? null : i)
                  }
                >
                  <View sx={{ p: '$4' }}>
                    <View
                      sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <View sx={{ flex: 1 }}>
                        <View
                          sx={{
                            backgroundColor: '#FEE2E2',
                            borderRadius: 6,
                            px: '$2',
                            py: 2,
                            alignSelf: 'flex-start',
                            mb: '$2',
                          }}
                        >
                          <Text sx={{ fontSize: 11, fontWeight: 'bold', color: '#991B1B' }}>
                            MYTH
                          </Text>
                        </View>
                        <Text
                          sx={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '$foreground',
                            lineHeight: 20,
                          }}
                        >
                          {item.myth}
                        </Text>
                      </View>
                      <Text sx={{ fontSize: 14, color: '$mutedForeground', ml: '$2' }}>
                        {expandedMisconception === i ? '\u25BE' : '\u25B8'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                {expandedMisconception === i && (
                  <View sx={{ px: '$4', pb: '$4' }}>
                    <View
                      sx={{
                        backgroundColor: '#DCFCE7',
                        borderRadius: 6,
                        px: '$2',
                        py: 2,
                        alignSelf: 'flex-start',
                        mb: '$2',
                      }}
                    >
                      <Text sx={{ fontSize: 11, fontWeight: 'bold', color: '#166534' }}>
                        REALITY
                      </Text>
                    </View>
                    <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                      {item.reality}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ============================================================= */}
        {/* When to Consider */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="When to Consider Palliative Care" />

          <View sx={{ mt: '$4', gap: '$2' }}>
            {WHEN_TO_CONSIDER.map((item, i) => (
              <View
                key={i}
                sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}
              >
                <View
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#3B82F6',
                    mt: 7,
                  }}
                />
                <Text
                  sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, flex: 1 }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <View
            sx={{
              mt: '$4',
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
              borderRadius: 10,
              p: '$4',
            }}
          >
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
              You do not need to wait
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
              The best outcomes come from early palliative care integration. You can ask your
              oncologist for a referral at any time, and you do not need to meet any threshold
              of symptoms to qualify.
            </Text>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Insurance Coverage */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Insurance Coverage" />

          <View
            sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}
          >
            <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
              Palliative care is covered by most insurance plans:
            </Text>
            <View sx={{ mt: '$3', gap: '$3' }}>
              <CoverageItem
                title="Medicare"
                detail="Covers palliative care services including consultations, symptom management, and care coordination."
              />
              <CoverageItem
                title="Most Private Insurance"
                detail="Major insurers cover palliative care as part of your medical benefits. Copays may apply as with any specialist visit."
              />
              <CoverageItem
                title="Medicaid"
                detail="Coverage varies by state but is widely available. Hospital-based palliative care teams are typically covered as part of inpatient care."
              />
              <CoverageItem
                title="Hospital-Based Programs"
                detail="Many hospitals have palliative care teams whose services are included in your hospital stay at no extra cost."
              />
            </View>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Resources */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Resources" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            {RESOURCES.map((r, i) => (
              <View
                key={i}
                sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}
              >
                <Text sx={{ fontSize: 15, fontWeight: '600', color: 'blue600' }}>
                  {r.name}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {r.description}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                  {r.url}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View
          sx={{
            mt: '$8',
            backgroundColor: '#FFFBEB',
            borderWidth: 1,
            borderColor: '#FDE68A',
            borderRadius: 12,
            p: '$5',
          }}
        >
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This information is for educational purposes only and is not a substitute for
            professional medical advice. Discuss palliative care options with your oncologist
            or care team to determine what is right for your situation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}

function EvidenceItem({ label, detail }: { label: string; detail: string }) {
  return (
    <View
      sx={{
        backgroundColor: 'white',
        borderRadius: 8,
        p: '$3',
      }}
    >
      <Text sx={{ fontSize: 14, fontWeight: '600', color: '#1E40AF' }}>{label}</Text>
      <Text sx={{ mt: '$1', fontSize: 12, color: '#1E3A5F', lineHeight: 18 }}>{detail}</Text>
    </View>
  );
}

function CoverageItem({ title, detail }: { title: string; detail: string }) {
  return (
    <View sx={{ flexDirection: 'row', gap: '$3', alignItems: 'flex-start' }}>
      <View
        sx={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#22C55E',
          mt: 6,
        }}
      />
      <View sx={{ flex: 1 }}>
        <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{title}</Text>
        <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
          {detail}
        </Text>
      </View>
    </View>
  );
}
