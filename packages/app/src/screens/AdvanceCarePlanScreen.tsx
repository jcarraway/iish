import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetAdvanceCarePlanQuery,
  useUpdateAdvanceCarePlanMutationMutation,
  useGenerateGoalsOfCareGuideMutation,
  useGenerateReferralLetterMutation,
} from '../generated/graphql';

const DOCUMENTS_CHECKLIST = [
  { key: 'hasLivingWill', label: 'Living Will', description: 'States your wishes for medical care if you cannot speak for yourself' },
  { key: 'hasHealthcareProxy', label: 'Healthcare Proxy', description: 'Names someone to make medical decisions on your behalf' },
  { key: 'hasPolst', label: 'POLST / MOLST', description: 'Physician order for specific life-sustaining treatment preferences' },
  { key: 'goalsOfCareDocumented', label: 'Goals of Care', description: 'Documented conversation about your treatment goals and values' },
];

const STATE_FORM_LINKS = [
  { name: 'Five Wishes', url: 'https://fivewishes.org', desc: 'Universal advance directive valid in most states' },
  { name: 'National POLST', url: 'https://polst.org/state-programs', desc: 'Find your state\'s POLST program and forms' },
  { name: 'CaringInfo', url: 'https://www.caringinfo.org/planning/advance-directives/', desc: 'Free state-specific advance directive forms' },
];

export function AdvanceCarePlanScreen() {
  const { data, loading, refetch } = useGetAdvanceCarePlanQuery({ errorPolicy: 'ignore' });
  const [updatePlan] = useUpdateAdvanceCarePlanMutationMutation();
  const [generateGuide, { data: guideData, loading: guideLoading }] = useGenerateGoalsOfCareGuideMutation();
  const [generateLetter, { data: letterData, loading: letterLoading }] = useGenerateReferralLetterMutation();

  const [proxyName, setProxyName] = useState('');

  const plan = data?.advanceCarePlan;
  const guide = guideData?.generateGoalsOfCareGuide;
  const letter = letterData?.generateReferralLetter;

  const toggleDocument = async (key: string, currentValue: boolean) => {
    const input: any = { [key]: !currentValue };
    await updatePlan({ variables: { input } });
    refetch();
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Link href="/palliative">
          <Text sx={{ fontSize: 14, color: 'blue600', mb: '$4' }}>← Back to Palliative Care</Text>
        </Link>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Advance Care Planning
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Ensure your wishes are documented and respected. These documents empower you — they can be changed at any time.
        </Text>

        {/* Document Checklist */}
        <Text sx={{ mt: '$8', fontSize: 20, fontWeight: '700', color: '$foreground' }}>
          Document Checklist
        </Text>
        <View sx={{ mt: '$4', gap: '$3' }}>
          {DOCUMENTS_CHECKLIST.map(doc => {
            const completed = plan?.[doc.key as keyof typeof plan] as boolean;
            return (
              <Pressable key={doc.key} onPress={() => toggleDocument(doc.key, !!completed)}>
                <View sx={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '$3',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: completed ? '#16A34A' : '$border',
                  backgroundColor: completed ? '#F0FDF4' : 'transparent',
                  p: '$4',
                }}>
                  <View sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: completed ? '#16A34A' : '$border',
                    backgroundColor: completed ? '#16A34A' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                  }}>
                    {completed && <Text sx={{ fontSize: 14, color: 'white' }}>✓</Text>}
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {doc.label}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                      {doc.description}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {plan?.lastReviewedAt && (
          <Text sx={{ mt: '$3', fontSize: 12, color: '$mutedForeground' }}>
            Last reviewed: {new Date(plan.lastReviewedAt).toLocaleDateString()}
          </Text>
        )}

        {/* Goals of Care Conversation Prep */}
        <Text sx={{ mt: '$8', fontSize: 20, fontWeight: '700', color: '$foreground' }}>
          Goals of Care Conversation
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Prepare for a meaningful conversation with your care team about what matters most to you.
        </Text>

        {!guide ? (
          <Pressable onPress={() => generateGuide()} disabled={guideLoading}>
            <View sx={{
              mt: '$4',
              backgroundColor: 'blue600',
              borderRadius: 8,
              px: '$6',
              py: '$3',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: '$2',
            }}>
              {guideLoading && <ActivityIndicator size="small" color="white" />}
              <Text sx={{ fontSize: 15, fontWeight: '600', color: 'white' }}>
                {guideLoading ? 'Generating...' : 'Generate Conversation Guide'}
              </Text>
            </View>
          </Pressable>
        ) : (
          <View sx={{ mt: '$4', gap: '$4' }}>
            <View sx={{ backgroundColor: '#F8FAFC', borderRadius: 12, p: '$4' }}>
              <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                {guide.introduction}
              </Text>
            </View>

            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
              Questions to Ask
            </Text>
            {guide.questions.map((q: any, i: number) => (
              <View key={i} sx={{ borderRadius: 10, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  {q.question}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                  Why: {q.why}
                </Text>
              </View>
            ))}

            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
              Talking Points for Family
            </Text>
            {guide.talkingPoints.map((p: string, i: number) => (
              <Text key={i} sx={{ fontSize: 14, color: '$foreground' }}>• {p}</Text>
            ))}
          </View>
        )}

        {/* Oncologist Communication */}
        <Text sx={{ mt: '$8', fontSize: 20, fontWeight: '700', color: '$foreground' }}>
          Request Palliative Care Referral
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Generate a letter to share with your oncologist requesting a palliative care consultation.
        </Text>

        {!letter ? (
          <Pressable onPress={() => generateLetter()} disabled={letterLoading}>
            <View sx={{
              mt: '$4',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'blue600',
              px: '$6',
              py: '$3',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: '$2',
            }}>
              {letterLoading && <ActivityIndicator size="small" />}
              <Text sx={{ fontSize: 15, fontWeight: '600', color: 'blue600' }}>
                {letterLoading ? 'Generating...' : 'Generate Referral Letter'}
              </Text>
            </View>
          </Pressable>
        ) : (
          <View sx={{ mt: '$4', backgroundColor: '#F8FAFC', borderRadius: 12, p: '$5' }}>
            <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$3' }}>
              DISCLAIMER: This letter is AI-generated and must be reviewed by your physician before use.
            </Text>
            <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
              {letter.content}
            </Text>
          </View>
        )}

        {/* State-Specific Forms */}
        <Text sx={{ mt: '$8', fontSize: 20, fontWeight: '700', color: '$foreground' }}>
          Find Your Forms
        </Text>
        <View sx={{ mt: '$4', gap: '$3', mb: '$8' }}>
          {STATE_FORM_LINKS.map((link, i) => (
            <View key={i} sx={{ borderRadius: 10, borderWidth: 1, borderColor: '$border', p: '$4' }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: 'blue600' }}>{link.name}</Text>
              <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>{link.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
