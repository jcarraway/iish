import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

// ============================================================================
// Static data — escalation strategies
// ============================================================================

interface EscalationLevel {
  step: number;
  name: string;
  description: string;
  successRate: string;
  what: string;
}

interface EscalationStrategy {
  category: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  levels: EscalationLevel[];
  supportingEvidence: string[];
}

const STRATEGIES: EscalationStrategy[] = [
  {
    category: 'medical_necessity',
    label: 'Medical Necessity Denial',
    description: 'Your insurer says the service is not medically necessary for your condition. This is the most common denial type and has the highest appeal success rate.',
    color: '#1E40AF',
    bgColor: '#DBEAFE',
    levels: [
      {
        step: 1,
        name: 'Internal Appeal (Level 1)',
        description: 'Submit a written appeal with your oncologist\'s letter of medical necessity, NCCN guidelines supporting the treatment, and relevant pathology/imaging reports.',
        successRate: '~40-50%',
        what: 'Write a detailed appeal letter citing NCCN guidelines, FDA approvals, and peer-reviewed literature. Include a letter of medical necessity from your treating oncologist explaining why this service is critical for your specific diagnosis and stage.',
      },
      {
        step: 2,
        name: 'Peer-to-Peer Review',
        description: 'Request a phone call between your oncologist and the insurance company\'s medical director. Your doctor explains the clinical rationale in real-time.',
        successRate: '~30-40% additional',
        what: 'Use OncoVax\'s Peer-to-Peer Prep tool. Ensure your oncologist has NCCN guidelines, your pathology report, and published outcomes data ready. The reviewing physician often lacks specialty knowledge — your doctor fills that gap.',
      },
      {
        step: 3,
        name: 'Internal Appeal (Level 2)',
        description: 'If available under your plan, file a second-level internal appeal with additional supporting evidence, expert opinion letters, or updated clinical data.',
        successRate: '~20-30% additional',
        what: 'Strengthen the appeal with an independent expert opinion from a recognized cancer center, additional published literature, and any new clinical information. Reference prior authorization criteria your case meets.',
      },
      {
        step: 4,
        name: 'External Review',
        description: 'Request review by an independent third party not affiliated with your insurer. Their decision is legally binding on the insurance company.',
        successRate: '~40-50%',
        what: 'File for external review through your state insurance department or the federal process. Compile your strongest evidence package. The IRO reviewer will examine everything independently. This is often your best chance after failed internal appeals.',
      },
      {
        step: 5,
        name: 'State Insurance Commissioner',
        description: 'File a formal complaint with your state insurance department. They can investigate and intervene on your behalf.',
        successRate: 'Varies by state',
        what: 'File a complaint online or by phone with your state insurance commissioner. Include all denial letters, appeal letters, and supporting documentation. States take cancer-related complaints seriously. Some states have dedicated oncology coverage units.',
      },
    ],
    supportingEvidence: [
      'NCCN Clinical Practice Guidelines (most authoritative)',
      'FDA-approved indications and compendia listings',
      'Peer-reviewed clinical trial data',
      'ASCO clinical practice guidelines',
      'Published case series or real-world evidence',
    ],
  },
  {
    category: 'experimental',
    label: 'Experimental / Investigational Denial',
    description: 'Your insurer classifies the service as experimental. For cancer genomic testing and targeted therapies, this is often an incorrect classification that can be overturned.',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    levels: [
      {
        step: 1,
        name: 'Challenge the Classification',
        description: 'Demonstrate that the service is FDA-approved, NCCN-recommended, or listed in recognized drug compendia. Many "experimental" denials are based on outdated criteria.',
        successRate: '~35-45%',
        what: 'Cite the specific FDA approval date, NCCN category of evidence, and any CMS National Coverage Determination. Show that the service has moved beyond experimental status. Include the most recent published guidelines.',
      },
      {
        step: 2,
        name: 'Clinical Trial Coverage Argument',
        description: 'If the service is part of a clinical trial, invoke state and federal clinical trial coverage laws. Routine care costs must be covered even in trials.',
        successRate: '~50-60% for eligible cases',
        what: 'Reference ACA Section 2709 (Affordable Care Act clinical trial coverage) and your state\'s clinical trial coverage law if applicable. Routine patient care costs (labs, imaging, office visits) associated with trial participation must be covered.',
      },
      {
        step: 3,
        name: 'Peer-to-Peer Review',
        description: 'Have your oncologist explain the evidence base directly to the reviewing physician. Many experimental classifications come from non-oncology reviewers.',
        successRate: '~30-40% additional',
        what: 'Your oncologist should explain that the reviewing criteria may be outdated and reference the most current evidence. Genomic testing in particular has rapidly evolving evidence that insurance criteria may not reflect.',
      },
      {
        step: 4,
        name: 'External Review',
        description: 'An independent oncology expert reviews whether the "experimental" classification is appropriate. External reviewers often have more current knowledge.',
        successRate: '~45-55%',
        what: 'Request that the external reviewer be a board-certified oncologist familiar with the specific service. Provide a comprehensive evidence package including NCCN guidelines, FDA approvals, published trials, and expert letters.',
      },
    ],
    supportingEvidence: [
      'FDA approval letters and labeling (including companion diagnostics)',
      'NCCN Compendium listings',
      'CMS National/Local Coverage Determinations',
      'Published phase III clinical trial results',
      'Drug compendia (AHFS-DI, DrugDex, Clinical Pharmacology)',
      'State clinical trial coverage laws',
    ],
  },
  {
    category: 'not_covered',
    label: 'Not Covered by Plan',
    description: 'Your insurer says the service is excluded from your plan. This is the hardest denial to overturn but there are still options.',
    color: '#B45309',
    bgColor: '#FEF3C7',
    levels: [
      {
        step: 1,
        name: 'Plan Document Review',
        description: 'Carefully review your Summary of Benefits and Coverage (SBC) and Summary Plan Description (SPD). Many "not covered" denials cite general exclusions that have specific exceptions for cancer.',
        successRate: '~20-30%',
        what: 'Request your full plan documents (not just the summary). Look for exceptions for "serious medical conditions," "life-threatening illness," or specific cancer-related carve-outs. Some plans exclude general genomic testing but cover it for cancer diagnosis.',
      },
      {
        step: 2,
        name: 'State Mandate Argument',
        description: 'Check if your state mandates coverage for the specific service. Many states require coverage for cancer genomic testing, fertility preservation, or clinical trial routine costs.',
        successRate: '~30-40% when mandate applies',
        what: 'Research your state\'s insurance mandates. If a state law requires coverage, the plan exclusion may be preempted by state law (for fully-insured plans). File a complaint with your state insurance department citing the specific mandate.',
      },
      {
        step: 3,
        name: 'Parity Argument',
        description: 'If the plan covers similar services for other conditions but excludes them for cancer, this may violate parity requirements or discrimination protections.',
        successRate: '~15-25%',
        what: 'Document instances where the plan covers comparable services for non-cancer conditions. The ACA prohibits discrimination based on health status. If genomic testing is covered for one condition but not cancer, this may be challengeable.',
      },
      {
        step: 4,
        name: 'External Review + Advocacy',
        description: 'Combine external review with advocacy from patient advocacy organizations, state legislators, or media attention.',
        successRate: 'Varies',
        what: 'File for external review while simultaneously engaging patient advocacy organizations (like Patient Advocate Foundation). Contact your state insurance commissioner and consider reaching out to your state representative. Document everything.',
      },
    ],
    supportingEvidence: [
      'Your plan\'s SBC and SPD (full document, not summary)',
      'State insurance mandate database (NCSL)',
      'ACA essential health benefits requirements',
      'Comparable coverage documentation (parity evidence)',
      'Patient advocacy organization resources',
      'State insurance commissioner complaint process',
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

export function EscalationGuideScreen() {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Escalation Guide
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Step-by-step path for each type of denial
        </Text>

        {/* Overview card */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E', lineHeight: 22 }}>
            Insurance denials are not the final word.
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '#075985', lineHeight: 22 }}>
            Studies show that 50-70% of cancer-related insurance denials are overturned on appeal.
            Many patients give up after the first denial — don't be one of them. Each escalation
            level gives you another chance.
          </Text>
        </View>

        {/* Strategy sections */}
        <View sx={{ mt: '$6', gap: '$4' }}>
          {STRATEGIES.map(strategy => {
            const isExpanded = expandedStrategy === strategy.category;

            return (
              <View key={strategy.category} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <Pressable onPress={() => setExpandedStrategy(isExpanded ? null : strategy.category)}>
                  <View sx={{
                    backgroundColor: strategy.bgColor,
                    p: '$5',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <View sx={{ flex: 1, mr: '$3' }}>
                      <Text sx={{ fontSize: 18, fontWeight: 'bold', color: strategy.color }}>
                        {strategy.label}
                      </Text>
                      <Text sx={{ mt: '$1', fontSize: 13, color: strategy.color, opacity: 0.8, lineHeight: 20 }}>
                        {strategy.description}
                      </Text>
                    </View>
                    <Text sx={{ fontSize: 20, color: strategy.color }}>
                      {isExpanded ? '\u2212' : '+'}
                    </Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View sx={{ p: '$4' }}>
                    {/* Escalation levels */}
                    <View sx={{ gap: '$3' }}>
                      {strategy.levels.map((level, i) => (
                        <View key={i} sx={{
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}>
                          {/* Step header */}
                          <View sx={{
                            backgroundColor: '#F9FAFB',
                            px: '$4',
                            py: '$3',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '$3',
                          }}>
                            <View sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: strategy.color,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Text sx={{ fontSize: 12, fontWeight: 'bold', color: 'white' }}>
                                {level.step}
                              </Text>
                            </View>
                            <View sx={{ flex: 1 }}>
                              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                                {level.name}
                              </Text>
                            </View>
                            <View sx={{
                              backgroundColor: '#DCFCE7',
                              borderRadius: 6,
                              px: '$2',
                              py: 3,
                            }}>
                              <Text sx={{ fontSize: 10, fontWeight: '600', color: '#166534' }}>
                                {level.successRate}
                              </Text>
                            </View>
                          </View>

                          {/* Step content */}
                          <View sx={{ px: '$4', py: '$3' }}>
                            <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                              {level.description}
                            </Text>
                            <View sx={{
                              mt: '$3',
                              backgroundColor: '#F9FAFB',
                              borderRadius: 8,
                              p: '$3',
                            }}>
                              <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                                What to do:
                              </Text>
                              <Text sx={{ fontSize: 12, color: '#374151', lineHeight: 18 }}>
                                {level.what}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Supporting evidence */}
                    <View sx={{
                      mt: '$4',
                      backgroundColor: '#F0FDF4',
                      borderRadius: 10,
                      p: '$4',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534', mb: '$2' }}>
                        Supporting evidence to gather:
                      </Text>
                      {strategy.supportingEvidence.map((ev, i) => (
                        <Text key={i} sx={{ fontSize: 12, color: '#14532D', lineHeight: 20 }}>
                          {'\u2022'} {ev}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Financial assistance fallback */}
        <View sx={{
          mt: '$8',
          borderWidth: 1,
          borderColor: '#C4B5FD',
          backgroundColor: '#FAF5FF',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '#5B21B6' }}>
            If all appeals are exhausted
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '#6D28D9', lineHeight: 22 }}>
            If you've exhausted all appeal options, there may still be ways to access the care
            you need. Explore financial assistance programs, manufacturer patient assistance,
            and charity care options.
          </Text>
          <Link href="/financial">
            <View sx={{
              mt: '$4',
              backgroundColor: '#7C3AED',
              borderRadius: 8,
              px: '$5',
              py: '$3',
              alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                Explore financial assistance {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
        <View sx={{
          mt: '$6',
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
            Success rates are approximate and vary significantly by insurer, state, and specific
            clinical situation. This information is for educational purposes and is not legal advice.
            Consider consulting with a patient advocate or healthcare attorney for complex cases.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
