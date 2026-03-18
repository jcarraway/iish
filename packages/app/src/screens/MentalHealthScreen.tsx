import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { Link } from 'solito/link';
import { useGetPatientQuery } from '../generated/graphql';

// ============================================================================
// Static data — support resources
// ============================================================================

interface SupportResource {
  name: string;
  category: 'support_group' | 'peer_mentoring' | 'online_community' | 'professional_directory';
  description: string;
  format: string;
  cost: string;
  specializations: string[];
  url: string;
  youngAdultOnly?: boolean;
}

const SUPPORT_RESOURCES: SupportResource[] = [
  { name: 'CancerCare', category: 'support_group', description: 'Free professional support services including counseling, support groups, and financial assistance for cancer patients and caregivers.', format: 'Online + Phone', cost: 'Free', specializations: ['counseling', 'support groups', 'financial'], url: 'https://www.cancercare.org' },
  { name: 'Cancer Support Community', category: 'support_group', description: 'Largest professionally led nonprofit network of cancer support, offering free support groups, education, and healthy lifestyle programs.', format: 'In-person + Online', cost: 'Free', specializations: ['support groups', 'survivorship', 'wellness'], url: 'https://www.cancersupportcommunity.org' },
  { name: 'Imerman Angels', category: 'peer_mentoring', description: 'One-on-one cancer support — connects you with a mentor who had the same type of cancer. Matched by age, gender, and cancer type.', format: 'Phone + Video', cost: 'Free', specializations: ['1-on-1 mentoring', 'cancer-type matched'], url: 'https://imermanangels.org' },
  { name: 'Cancer Hope Network', category: 'peer_mentoring', description: 'Trained survivor volunteers provide one-on-one support matched by cancer type, treatment, and side effects.', format: 'Phone', cost: 'Free', specializations: ['peer support', 'treatment-matched'], url: 'https://www.cancerhopenetwork.org' },
  { name: 'Stupid Cancer (Young Adult)', category: 'online_community', description: 'Community and advocacy for young adults (15-39) affected by cancer. Events, meetups, podcasts, and online community.', format: 'Online + Events', cost: 'Free', specializations: ['young adults', 'community', 'advocacy'], url: 'https://stupidcancer.org', youngAdultOnly: true },
  { name: 'Young Survival Coalition', category: 'support_group', description: 'Support and resources specifically for young adults diagnosed with breast cancer under age 40.', format: 'Online + In-person', cost: 'Free', specializations: ['breast cancer', 'young adults', 'fertility'], url: 'https://www.youngsurvival.org', youngAdultOnly: true },
  { name: 'LIVESTRONG', category: 'online_community', description: 'Free cancer support services and resources including navigation, fertility preservation, and exercise programs.', format: 'Phone + Online', cost: 'Free', specializations: ['navigation', 'fertility', 'exercise'], url: 'https://www.livestrong.org' },
  { name: 'Survivorship A to Z', category: 'online_community', description: 'Comprehensive resource hub for cancer survivors covering healthcare, insurance, employment, and emotional wellness.', format: 'Online', cost: 'Free', specializations: ['survivorship', 'practical resources'], url: 'https://www.survivorshipatoz.org' },
  { name: 'American Psychosocial Oncology Society', category: 'professional_directory', description: 'Find psychologists and counselors who specialize in cancer-related distress, anxiety, and fear of recurrence.', format: 'Provider directory', cost: 'Insurance-based', specializations: ['oncology psychology', 'FCR treatment'], url: 'https://apos-society.org/find-a-provider' },
  { name: 'Psychology Today — Cancer', category: 'professional_directory', description: 'Searchable directory of therapists with cancer/chronic illness specialization. Filter by insurance, location, and approach.', format: 'Provider directory', cost: 'Insurance-based', specializations: ['therapy', 'local providers'], url: 'https://www.psychologytoday.com' },
  { name: 'Cancer.Net Survivorship', category: 'online_community', description: 'ASCO patient resource with expert-reviewed information on emotional and physical survivorship challenges.', format: 'Online', cost: 'Free', specializations: ['education', 'evidence-based'], url: 'https://www.cancer.net/survivorship' },
  { name: 'Triage Cancer', category: 'online_community', description: 'Education on practical cancer survivorship issues — insurance, employment rights, finances, and legal protections.', format: 'Online + Webinars', cost: 'Free', specializations: ['legal rights', 'insurance', 'employment'], url: 'https://triagecancer.org' },
  { name: 'MyLifeLine', category: 'online_community', description: 'Online community for cancer survivors and caregivers. Create a personal page, join discussion boards, find resources.', format: 'Online', cost: 'Free', specializations: ['online community', 'caregivers'], url: 'https://www.mylifeline.org' },
  { name: 'Turning Point (Breast Cancer)', category: 'peer_mentoring', description: 'Peer counseling program specifically for breast cancer, run by the Breast Cancer Network of Strength.', format: 'Phone', cost: 'Free', specializations: ['breast cancer', 'peer counseling'], url: 'https://www.networkofstrength.org' },
  { name: 'NAMI Helpline', category: 'professional_directory', description: 'National Alliance on Mental Illness — free referrals for mental health services, crisis support, and local resources.', format: 'Phone + Chat', cost: 'Free', specializations: ['mental health referrals', 'crisis support'], url: 'https://www.nami.org/help' },
];

const CATEGORY_LABELS: Record<string, string> = {
  support_group: 'Support Groups',
  peer_mentoring: 'Peer Mentoring',
  online_community: 'Online Communities',
  professional_directory: 'Find a Provider',
};

// ============================================================================
// Component
// ============================================================================

export function MentalHealthScreen() {
  const { data: patientData } = useGetPatientQuery({ errorPolicy: 'ignore' });
  const patientAge = patientData?.patient?.profile?.age;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null);

  const filteredResources = SUPPORT_RESOURCES.filter(r => {
    // Filter out young-adult-only resources if patient is >= 40
    if (r.youngAdultOnly && patientAge && patientAge >= 40) return false;
    if (selectedCategory && r.category !== selectedCategory) return false;
    return true;
  });

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Mental Health & Support
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          You are not alone — support, strategies, and resources for life after treatment
        </Text>

        {/* Normalization banner */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E', lineHeight: 22 }}>
            70% of cancer survivors report fear of recurrence as their #1 concern.
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '#075985', lineHeight: 22 }}>
            What you're feeling is normal. The anxiety, the hypervigilance, the "what if" thoughts — these are
            common responses to what you've been through. Acknowledging them is the first step.
          </Text>
        </View>

        {/* Section 1: Understanding FCR */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Understanding Fear of Recurrence" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            <InfoCard
              title="When it peaks"
              items={[
                'Before surveillance appointments ("scanxiety")',
                'Around diagnosis anniversaries',
                'When hearing about others\' cancer diagnoses',
                'When experiencing unexplained symptoms',
              ]}
            />
            <InfoCard
              title="Why it happens"
              items={[
                'Hypervigilance after cancer is a normal brain response — your threat detection system was activated by a real threat',
                'Your brain hasn\'t fully "stood down" from crisis mode',
                'This doesn\'t mean something is wrong with you — it means your protective instincts are working',
              ]}
            />
          </View>
        </View>

        {/* Section 2: Evidence-Based Strategies */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Evidence-Based Strategies" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
            Clinically validated approaches specifically studied in cancer survivors
          </Text>

          <View sx={{ mt: '$4', gap: '$3' }}>
            {STRATEGIES.map((s, i) => (
              <View key={i} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <Pressable onPress={() => setExpandedStrategy(expandedStrategy === i ? null : i)}>
                  <View sx={{ p: '$4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                        {s.name}
                      </Text>
                      <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                        {s.type}
                      </Text>
                    </View>
                    <Badge label={s.evidence} bg="#DCFCE7" fg="#166534" />
                  </View>
                </Pressable>
                {expandedStrategy === i && (
                  <View sx={{ px: '$4', pb: '$4', gap: '$3' }}>
                    <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                      {s.description}
                    </Text>
                    <View sx={{ gap: '$2' }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground' }}>Key techniques:</Text>
                      {s.techniques.map((t, ti) => (
                        <Text key={ti} sx={{ fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                          {'\u2022'} {t}
                        </Text>
                      ))}
                    </View>
                    <View sx={{
                      backgroundColor: '#F0FDF4',
                      borderRadius: 8,
                      p: '$3',
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Evidence</Text>
                      <Text sx={{ fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                        {s.citation}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Section 3: When to Seek Professional Help */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="When to Seek Professional Help" />
          <Text sx={{ mt: '$3', fontSize: 14, color: '$foreground', lineHeight: 22 }}>
            Fear of recurrence exists on a spectrum. Most survivors manage it well, but some may benefit from
            professional support. Consider reaching out if you notice:
          </Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            {SEEK_HELP_SIGNS.map((sign, i) => (
              <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                <View sx={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B', mt: 7 }} />
                <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
                  {sign}
                </Text>
              </View>
            ))}
          </View>
          <View sx={{
            mt: '$4',
            backgroundColor: '#F0FDF4',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            borderRadius: 10,
            p: '$4',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
              Seeking help is a sign of strength
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
              Just as you sought the best medical treatment for cancer, getting support for your emotional
              health is part of taking excellent care of yourself.
            </Text>
          </View>
        </View>

        {/* Section 4: Support Resources */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Support Resources" />

          {/* Category filters */}
          <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            <Pressable onPress={() => setSelectedCategory(null)}>
              <View sx={{
                borderRadius: 20,
                px: '$3',
                py: '$2',
                backgroundColor: selectedCategory === null ? 'blue600' : '#F1F5F9',
              }}>
                <Text sx={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: selectedCategory === null ? 'white' : '$mutedForeground',
                }}>
                  All
                </Text>
              </View>
            </Pressable>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Pressable key={key} onPress={() => setSelectedCategory(selectedCategory === key ? null : key)}>
                <View sx={{
                  borderRadius: 20,
                  px: '$3',
                  py: '$2',
                  backgroundColor: selectedCategory === key ? 'blue600' : '#F1F5F9',
                }}>
                  <Text sx={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: selectedCategory === key ? 'white' : '$mutedForeground',
                  }}>
                    {label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View sx={{ mt: '$4', gap: '$3' }}>
            {filteredResources.map((r, i) => (
              <View key={i} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$4',
              }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', flex: 1 }}>
                    {r.name}
                  </Text>
                  <View sx={{ flexDirection: 'row', gap: '$1' }}>
                    <Badge label={r.format} bg="#DBEAFE" fg="#1E40AF" />
                    <Badge label={r.cost} bg={r.cost === 'Free' ? '#DCFCE7' : '#FEF3C7'} fg={r.cost === 'Free' ? '#166534' : '#92400E'} />
                  </View>
                </View>
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {r.description}
                </Text>
                <View sx={{ mt: '$2', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
                  {r.specializations.map((s, si) => (
                    <View key={si} sx={{
                      backgroundColor: '#F1F5F9',
                      borderRadius: 6,
                      px: 6,
                      py: 2,
                    }}>
                      <Text sx={{ fontSize: 10, color: '#64748B' }}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section 5: Crisis Resources */}
        <View sx={{ mt: '$8' }}>
          <View sx={{
            backgroundColor: '#FFFBEB',
            borderWidth: 2,
            borderColor: '#F59E0B',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#92400E' }}>
              Crisis Resources
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#78350F', lineHeight: 20 }}>
              If you or someone you know is in crisis, help is available right now:
            </Text>
            <View sx={{ mt: '$3', gap: '$3' }}>
              <View sx={{
                backgroundColor: 'white',
                borderRadius: 10,
                p: '$4',
              }}>
                <Text sx={{ fontSize: 15, fontWeight: 'bold', color: '#92400E' }}>
                  988 Suicide & Crisis Lifeline
                </Text>
                <Text sx={{ mt: '$1', fontSize: 14, fontWeight: '600', color: '#B45309' }}>
                  Call or text 988
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: '#78350F' }}>
                  24/7, free, confidential
                </Text>
              </View>
              <View sx={{
                backgroundColor: 'white',
                borderRadius: 10,
                p: '$4',
              }}>
                <Text sx={{ fontSize: 15, fontWeight: 'bold', color: '#92400E' }}>
                  Crisis Text Line
                </Text>
                <Text sx={{ mt: '$1', fontSize: 14, fontWeight: '600', color: '#B45309' }}>
                  Text HOME to 741741
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: '#78350F' }}>
                  24/7, free, confidential
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 6: Scanxiety Tips */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Managing Scanxiety" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
            Tips for the days before and during surveillance appointments
          </Text>

          <View sx={{ mt: '$4', gap: '$3' }}>
            {SCANXIETY_TIPS.map((tip, i) => (
              <View key={i} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 10,
                p: '$4',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  {tip.title}
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {tip.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
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
            This information is for educational purposes only and is not a substitute for professional
            mental health care. If you are experiencing significant distress, please reach out to a
            mental health professional or use the crisis resources above.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Static content
// ============================================================================

const STRATEGIES = [
  {
    name: 'ConquerFear',
    type: 'CBT-based intervention',
    evidence: 'RCT validated',
    description: 'A structured program specifically designed for cancer survivors experiencing clinical levels of fear of recurrence. Uses cognitive behavioral therapy techniques tailored to the cancer experience.',
    techniques: [
      'Identifying and challenging catastrophic thinking patterns',
      'Developing a personalized "worry plan" with scheduled worry time',
      'Values-based living: reconnecting with what matters beyond cancer',
      'Attention training: noticing body sensations without catastrophizing',
    ],
    citation: 'Butow et al. (2017) Journal of Clinical Oncology — RCT showed significant reduction in FCR severity vs. relaxation training at 3 and 6 month follow-up.',
  },
  {
    name: 'AFTER Intervention',
    type: 'Attention training + metacognitive therapy',
    evidence: 'Pilot RCT',
    description: 'Combines attention training techniques from metacognitive therapy with psychoeducation about fear of recurrence. Teaches you to relate differently to worried thoughts rather than trying to stop them.',
    techniques: [
      'Attention Training Technique (ATT): shifting focus between different sounds',
      'Detached mindfulness: observing thoughts as mental events, not facts',
      'Challenging beliefs about the usefulness of worry',
      'Reducing body checking and reassurance seeking',
    ],
    citation: 'Lichtenthal et al. (2017) Psycho-Oncology — Pilot study showed feasibility and preliminary efficacy for reducing FCR in breast cancer survivors.',
  },
  {
    name: 'MBSR (Mindfulness-Based Stress Reduction)',
    type: 'Mindfulness meditation program',
    evidence: 'Multiple RCTs',
    description: 'An 8-week structured program of mindfulness meditation, body awareness, and gentle yoga. Extensively studied in cancer populations with consistent benefits for anxiety, stress, and quality of life.',
    techniques: [
      'Body scan meditation: non-judgmental awareness of physical sensations',
      'Sitting meditation: observing thoughts and feelings without reacting',
      'Gentle yoga: reconnecting with your body after treatment',
      'Mindful awareness in daily activities',
    ],
    citation: 'Lengacher et al. (2016) Journal of Clinical Oncology — MBSR significantly reduced FCR, anxiety, and depression in breast cancer survivors up to 12 weeks post-intervention.',
  },
];

const SEEK_HELP_SIGNS = [
  'Avoiding follow-up appointments or surveillance scans because of anxiety',
  'Constant body scanning — checking for lumps, symptoms, or changes multiple times daily',
  'Inability to make future plans because "what\'s the point?"',
  'Daily impairment — fear is interfering with work, relationships, or activities you enjoy',
  'Significant sleep disruption related to cancer worries',
  'Increasing use of alcohol or other substances to manage anxiety',
];

const SCANXIETY_TIPS = [
  {
    title: 'What to expect at your appointment',
    description: 'Surveillance appointments are routine check-ins, not emergencies. Your care team does these regularly and knows exactly what to look for. Most results are normal — your team will tell you what they find.',
  },
  {
    title: 'Bring a support person',
    description: 'Having someone with you can help you feel grounded, remember what the doctor says, and provide comfort during the waiting. They can take notes so you can focus on being present.',
  },
  {
    title: 'Practice grounding techniques',
    description: 'Try the 5-4-3-2-1 technique: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. This brings you back to the present moment when anxiety spirals.',
  },
  {
    title: 'Plan something for after',
    description: 'Schedule something you enjoy after your appointment — lunch with a friend, a walk in nature, or watching your favorite show. Having something to look forward to shifts your focus.',
  },
  {
    title: 'Write down your questions beforehand',
    description: 'Anxiety can make your mind go blank in the exam room. Write down questions ahead of time. Your OncoVax appointment prep tool can help with this.',
  },
];

// ============================================================================
// Shared components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}

function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View sx={{ backgroundColor: bg, borderRadius: 12, px: '$2', py: 3 }}>
      <Text sx={{ fontSize: 11, fontWeight: '600', color: fg }}>{label}</Text>
    </View>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <View sx={{
      borderWidth: 1,
      borderColor: '$border',
      borderRadius: 12,
      p: '$4',
    }}>
      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
        {title}
      </Text>
      <View sx={{ mt: '$2', gap: '$2' }}>
        {items.map((item, i) => (
          <Text key={i} sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            {'\u2022'} {item}
          </Text>
        ))}
      </View>
    </View>
  );
}
