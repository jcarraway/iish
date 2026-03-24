import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

// ============================================================================
// Constants
// ============================================================================

interface Section {
  title: string;
  content: React.ReactNode;
}

interface Resource {
  name: string;
  url: string;
  description: string;
}

const RESOURCES: Resource[] = [
  {
    name: 'FORCE (Facing Our Risk of Cancer Empowered)',
    url: 'https://www.facingourrisk.org',
    description: 'Support and information for individuals and families affected by hereditary breast and ovarian cancer.',
  },
  {
    name: 'Bright Pink',
    url: 'https://www.brightpink.org',
    description: 'Focused on prevention and early detection of breast and ovarian cancer in young women.',
  },
  {
    name: 'NCCN Patient Guidelines',
    url: 'https://www.nccn.org/patients',
    description: 'Evidence-based treatment and screening guidelines written for patients by the National Comprehensive Cancer Network.',
  },
  {
    name: 'Susan G. Komen',
    url: 'https://www.komen.org',
    description: 'Research funding, patient support, education, and advocacy for breast cancer.',
  },
];

// ============================================================================
// Component
// ============================================================================

export function PreventEducationScreen() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const sections: Section[] = [
    {
      title: 'Understanding Risk Factors',
      content: (
        <View sx={{ gap: '$4' }}>
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Non-modifiable risk factors
            </Text>
            <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
              These are factors you cannot change but are important to be aware of:
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                'Age: Risk increases with age; most breast cancers are diagnosed after age 50',
                'Genetic mutations: BRCA1/BRCA2 and other inherited gene changes significantly increase risk',
                'Family history: Having a first-degree relative (mother, sister, daughter) with breast cancer roughly doubles risk',
                'Reproductive history: Early menstruation (before 12), late menopause (after 55), never having children, or first pregnancy after 30',
                'Dense breast tissue: Makes mammograms harder to read and is independently associated with increased risk',
                'Prior chest radiation: Radiation therapy to the chest area before age 30',
              ].map((item, i) => (
                <BulletItem key={i} text={item} />
              ))}
            </View>
          </View>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Modifiable risk factors
            </Text>
            <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
              These are factors where lifestyle changes may reduce risk:
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                'Physical activity: Regular exercise (150+ minutes/week moderate activity) is associated with lower risk',
                'Body weight: Maintaining a healthy weight, especially after menopause',
                'Alcohol: Even moderate consumption (1 drink/day) is associated with modestly increased risk',
                'Hormone replacement therapy: Combined estrogen-progesterone HRT increases risk; risk decreases after stopping',
                'Breastfeeding: Longer duration of breastfeeding is associated with reduced risk',
              ].map((item, i) => (
                <BulletItem key={i} text={item} color="#059669" />
              ))}
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Screening Guidelines',
      content: (
        <View sx={{ gap: '$3' }}>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            Major organizations have different recommendations. Discuss with your doctor which approach is right for you.
          </Text>

          {/* Comparison table */}
          <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <View sx={{ flexDirection: 'row', backgroundColor: '#F9FAFB' }}>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground' }}>Guideline</Text>
              </View>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground' }}>Start Age</Text>
              </View>
              <View sx={{ flex: 1, p: '$3' }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground' }}>Frequency</Text>
              </View>
            </View>

            {/* ACS */}
            <View sx={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '$border' }}>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, fontWeight: '500', color: '$foreground' }}>ACS</Text>
              </View>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, color: '$foreground' }}>40 (optional){'\n'}45 (regular)</Text>
              </View>
              <View sx={{ flex: 1, p: '$3' }}>
                <Text sx={{ fontSize: 12, color: '$foreground' }}>Annual 45-54{'\n'}Biennial 55+</Text>
              </View>
            </View>

            {/* NCCN */}
            <View sx={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '$border' }}>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, fontWeight: '500', color: '$foreground' }}>NCCN</Text>
              </View>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, color: '$foreground' }}>40</Text>
              </View>
              <View sx={{ flex: 1, p: '$3' }}>
                <Text sx={{ fontSize: 12, color: '$foreground' }}>Annual</Text>
              </View>
            </View>

            {/* USPSTF */}
            <View sx={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '$border' }}>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, fontWeight: '500', color: '$foreground' }}>USPSTF</Text>
              </View>
              <View sx={{ flex: 1, p: '$3', borderRightWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 12, color: '$foreground' }}>40</Text>
              </View>
              <View sx={{ flex: 1, p: '$3' }}>
                <Text sx={{ fontSize: 12, color: '$foreground' }}>Biennial{'\n'}40-74</Text>
              </View>
            </View>
          </View>

          <View sx={{
            backgroundColor: '#F0F9FF',
            borderWidth: 1,
            borderColor: '#BAE6FD',
            borderRadius: 8,
            p: '$3',
          }}>
            <Text sx={{ fontSize: 12, color: '#075985', lineHeight: 18 }}>
              For high-risk individuals (BRCA carriers, prior chest radiation, strong family history),
              guidelines recommend starting earlier screening and adding breast MRI. Talk to your
              doctor about whether enhanced screening is right for you.
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: 'Chemoprevention Primer',
      content: (
        <View sx={{ gap: '$3' }}>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            Chemoprevention refers to using medication to reduce the risk of developing cancer.
            For breast cancer, certain drugs have been shown to significantly reduce risk in
            higher-risk individuals.
          </Text>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Who should consider it?
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                'Women at increased risk (typically 1.66%+ five-year risk on the Gail model)',
                'BRCA mutation carriers who have not chosen prophylactic surgery',
                'Women with atypical ductal hyperplasia or lobular carcinoma in situ',
                'Those with a strong family history of breast cancer',
              ].map((item, i) => (
                <BulletItem key={i} text={item} />
              ))}
            </View>
          </View>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Common medications
            </Text>
            <View sx={{ mt: '$2', gap: '$3' }}>
              {[
                {
                  name: 'Tamoxifen',
                  detail: 'Selective estrogen receptor modulator (SERM). Can be used pre- or post-menopause. Reduces ER+ breast cancer risk by ~50%. Side effects include hot flashes, blood clots (rare), uterine cancer (rare).',
                },
                {
                  name: 'Raloxifene (Evista)',
                  detail: 'Another SERM. Post-menopausal women only. Similar risk reduction to tamoxifen with lower uterine cancer risk. Also helps with osteoporosis.',
                },
                {
                  name: 'Aromatase inhibitors (Exemestane, Anastrozole)',
                  detail: 'Post-menopausal women only. May reduce risk by up to 65%. Side effects include joint pain, bone density loss, hot flashes.',
                },
              ].map((med, i) => (
                <View key={i} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                  p: '$3',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    {med.name}
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                    {med.detail}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View sx={{
            backgroundColor: '#FFFBEB',
            borderWidth: 1,
            borderColor: '#FDE68A',
            borderRadius: 8,
            p: '$3',
          }}>
            <Text sx={{ fontSize: 12, color: '#78350F', lineHeight: 18 }}>
              Chemoprevention is a personal decision that involves weighing potential benefits
              against side effects. It should always be discussed thoroughly with your doctor.
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: 'Environmental Factors',
      content: (
        <View sx={{ gap: '$3' }}>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            Environmental factors and breast cancer risk are an active area of research.
            Here is what the current evidence shows.
          </Text>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              What the evidence supports
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                { text: 'Ionizing radiation (medical imaging, nuclear exposure) increases risk, especially before age 30', level: 'Strong' },
                { text: 'Diethylstilbestrol (DES) exposure in utero modestly increases risk', level: 'Strong' },
                { text: 'Night shift work disrupting circadian rhythm is classified as a probable carcinogen by IARC', level: 'Moderate' },
                { text: 'Some endocrine-disrupting chemicals (BPA, certain pesticides) show associations in animal studies', level: 'Emerging' },
              ].map((item, i) => (
                <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                  <View sx={{
                    backgroundColor: item.level === 'Strong' ? '#DCFCE7' : item.level === 'Moderate' ? '#FEF3C7' : '#DBEAFE',
                    borderRadius: 4,
                    px: '$2',
                    py: 2,
                    mt: 1,
                  }}>
                    <Text sx={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: item.level === 'Strong' ? '#166534' : item.level === 'Moderate' ? '#92400E' : '#1E40AF',
                    }}>
                      {item.level}
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 12, color: '$foreground', lineHeight: 18, flex: 1 }}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              What is often overhyped
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                'Antiperspirants/deodorants: No credible evidence of breast cancer link',
                'Underwire bras: No evidence they cause or contribute to breast cancer',
                'Cell phones: No established link to breast cancer',
                'Power lines: Studies have not shown a consistent association',
              ].map((item, i) => (
                <BulletItem key={i} text={item} color="#9CA3AF" />
              ))}
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Genetic Testing',
      content: (
        <View sx={{ gap: '$3' }}>
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Who should consider genetic testing?
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                'Breast cancer diagnosed before age 50',
                'Triple-negative breast cancer diagnosed before age 60',
                'Two or more breast cancers in the same person',
                'Breast cancer at any age plus a close relative with breast, ovarian, pancreatic, or prostate cancer',
                'Male breast cancer at any age',
                'Known family mutation in BRCA1, BRCA2, or another cancer gene',
                'Ashkenazi Jewish ancestry with breast or ovarian cancer in the family',
              ].map((item, i) => (
                <BulletItem key={i} text={item} />
              ))}
            </View>
          </View>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Key genes tested
            </Text>
            <View sx={{ mt: '$2', gap: '$3' }}>
              {[
                {
                  gene: 'BRCA1',
                  detail: '45-72% lifetime breast cancer risk. Also increases ovarian cancer risk. Tumors are often triple-negative.',
                },
                {
                  gene: 'BRCA2',
                  detail: '45-69% lifetime breast cancer risk. Also increases risk of ovarian, pancreatic, and prostate cancer.',
                },
                {
                  gene: 'PALB2',
                  detail: '33-58% lifetime breast cancer risk. Sometimes called "BRCA3" due to similar risk levels.',
                },
                {
                  gene: 'ATM, CHEK2',
                  detail: 'Moderate risk (25-35% lifetime). May influence screening recommendations and treatment decisions.',
                },
                {
                  gene: 'TP53 (Li-Fraumeni)',
                  detail: 'Very high lifetime cancer risk across multiple cancer types. Extremely rare.',
                },
              ].map((item, i) => (
                <View key={i} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                  p: '$3',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '#7C3AED' }}>
                    {item.gene}
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                    {item.detail}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              What results mean
            </Text>
            <View sx={{ mt: '$2', gap: '$2' }}>
              {[
                'Positive (pathogenic variant found): Increased risk confirmed. Discuss enhanced screening, prevention options, and family implications with a genetic counselor.',
                'Negative (no variant found): Does not eliminate risk. Average population risk still applies. Family history remains important.',
                'Variant of uncertain significance (VUS): Not enough information to determine impact. Treated as negative clinically, may be reclassified over time.',
              ].map((item, i) => (
                <BulletItem key={i} text={item} />
              ))}
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'Taking Action',
      content: (
        <View sx={{ gap: '$3' }}>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            Knowledge is most valuable when it leads to action. Here are practical steps
            you can take based on your risk level.
          </Text>

          <View sx={{ gap: '$3' }}>
            {[
              {
                label: 'For everyone',
                color: '#3B82F6',
                steps: [
                  'Know your family history — both sides, at least three generations',
                  'Stay current on screening (mammograms per your doctor\'s recommendation)',
                  'Maintain a healthy weight and exercise regularly',
                  'Limit alcohol consumption',
                  'Know your breast density (ask at your next mammogram)',
                ],
              },
              {
                label: 'If you are at elevated risk',
                color: '#F59E0B',
                steps: [
                  'Discuss enhanced screening (mammogram + MRI) with your doctor',
                  'Ask about a formal risk assessment (Tyrer-Cuzick or Gail model)',
                  'Consider genetic counseling and testing if appropriate',
                  'Discuss chemoprevention options',
                  'Explore clinical prevention trials — take our quiz at /prevent',
                ],
              },
              {
                label: 'If you have a known genetic mutation',
                color: '#EF4444',
                steps: [
                  'Work with a genetic counselor to understand your specific risk',
                  'Establish enhanced screening (typically starting at age 25-30)',
                  'Discuss risk-reducing surgery options and timing',
                  'Consider chemoprevention if not pursuing surgery',
                  'Share information with family members who may benefit from testing',
                  'Look into prevention clinical trials',
                ],
              },
            ].map((group, i) => (
              <View key={i} sx={{
                borderLeftWidth: 3,
                borderLeftColor: group.color,
                pl: '$4',
                py: '$2',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  {group.label}
                </Text>
                <View sx={{ mt: '$2', gap: '$2' }}>
                  {group.steps.map((step, j) => (
                    <BulletItem key={j} text={step} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ),
    },
  ];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Back link */}
        <Link href="/prevent/risk">
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4' }}>
            <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2190'} Back to Risk Assessment</Text>
          </View>
        </Link>

        {/* Header */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Prevention Education
        </Text>
        <Text sx={{ mt: '$2', fontSize: 16, color: '$mutedForeground', lineHeight: 24 }}>
          Evidence-based information about breast cancer risk and prevention
        </Text>

        {/* ================================================================ */}
        {/* Collapsible Sections */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8', gap: '$3' }}>
          {sections.map((section, index) => {
            const isExpanded = expanded[index] ?? false;
            return (
              <View key={index} sx={{
                borderWidth: 1,
                borderColor: isExpanded ? '#C7D2FE' : '$border',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <Pressable onPress={() => toggleSection(index)}>
                  <View sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: '$4',
                    backgroundColor: isExpanded ? '#EEF2FF' : undefined,
                  }}>
                    <Text sx={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: isExpanded ? '#4338CA' : '$foreground',
                      flex: 1,
                    }}>
                      {section.title}
                    </Text>
                    <Text sx={{
                      fontSize: 18,
                      color: isExpanded ? '#4338CA' : '$mutedForeground',
                      ml: '$2',
                    }}>
                      {isExpanded ? '\u2212' : '+'}
                    </Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View sx={{ px: '$4', pb: '$5', pt: '$2' }}>
                    {section.content}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ================================================================ */}
        {/* Resource Links */}
        {/* ================================================================ */}
        <View sx={{ mt: '$10' }}>
          <SectionHeader title="Trusted Resources" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
            Reputable organizations for additional information and support
          </Text>

          <View sx={{ mt: '$4', gap: '$3' }}>
            {RESOURCES.map((resource) => (
              <View key={resource.name} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$4',
              }}>
                <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                  {resource.name}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {resource.description}
                </Text>
                <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>
                  {resource.url}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* Disclaimer */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This educational content is for informational purposes only and does not constitute
            medical advice, diagnosis, or treatment recommendations. Risk factor information is
            based on population-level studies and may not apply to your individual situation.
            Always consult with a qualified healthcare provider before making decisions about
            screening, prevention, or genetic testing.
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

function BulletItem({ text, color = '#4338CA' }: { text: string; color?: string }) {
  return (
    <View sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
      <View sx={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, mt: 7 }} />
      <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
