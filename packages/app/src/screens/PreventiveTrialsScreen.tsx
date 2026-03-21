import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import { useRouter } from 'solito/router';
import {
  useGetPreventiveTrialsQuery,
  useRunPreventivePrescreenLazyQuery,
  useRedeemReferralCodeMutation,
} from '../generated/graphql';

const STRENGTH_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  strong: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
  possible: { bg: '#DBEAFE', fg: '#1E40AF', border: '#93C5FD' },
  worth_discussing: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
};

export function PreventiveTrialsScreen() {
  const router = useRouter();
  const { data: trialsData, loading: trialsLoading } = useGetPreventiveTrialsQuery();
  const [runPrescreen, { data: prescreenData, loading: prescreening }] = useRunPreventivePrescreenLazyQuery();
  const [redeemCode] = useRedeemReferralCodeMutation();

  // Quiz state
  const [showResults, setShowResults] = useState(false);
  const [hasCancerHistory, setHasCancerHistory] = useState<boolean | null>(null);
  const [age, setAge] = useState('');
  const [hasBrca, setHasBrca] = useState<string | null>(null);
  const [hasFamilyHistory, setHasFamilyHistory] = useState<boolean | null>(null);
  const [zipCode, setZipCode] = useState('');

  // Referral code from URL
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralRedeemed, setReferralRedeemed] = useState(false);

  // Check for ?ref= param (web only — on native this would come from route params)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCode(ref);
        setHasFamilyHistory(true); // prefill
        redeemCode({ variables: { code: ref } }).then(res => {
          if (res.data?.redeemReferralCode.success) setReferralRedeemed(true);
        });
      }
    }
  }, []);

  const canSubmitQuiz = hasCancerHistory !== null && age !== '' && hasBrca !== null && hasFamilyHistory !== null;

  function handleQuizSubmit() {
    if (!canSubmitQuiz) return;
    runPrescreen({
      variables: {
        input: {
          age: parseInt(age, 10),
          hasCancerHistory: hasCancerHistory!,
          hasBrca: hasBrca!,
          hasOtherHighRisk: 'unknown',
          hasFamilyHistory: hasFamilyHistory!,
          zipCode: zipCode || null,
        },
      },
    });
    setShowResults(true);
  }

  const matchedTrials = prescreenData?.preventivePrescreen?.matchedTrials ?? [];
  const noMatchMessage = prescreenData?.preventivePrescreen?.noMatchMessage;
  const allTrials = trialsData?.preventiveTrials ?? [];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Referral banner */}
        {referralRedeemed && (
          <View sx={{
            mb: '$6', p: '$4', borderRadius: 12,
            backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0',
          }}>
            <Text sx={{ fontSize: 14, color: '#166534', fontWeight: '600' }}>
              A family member shared this with you
            </Text>
            <Text sx={{ mt: '$1', fontSize: 13, color: '#166534' }}>
              Because of your family connection, you may be at higher risk. The quiz below can help determine if any prevention trials are right for you.
            </Text>
          </View>
        )}

        {/* Hero */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Breast Cancer Prevention Trials
        </Text>
        <Text sx={{ mt: '$2', fontSize: 16, color: '$mutedForeground', lineHeight: 24 }}>
          Vaccines and other prevention strategies are being tested right now. Take a 1-minute quiz to see if you might qualify.
        </Text>

        {/* Quick Quiz */}
        <View sx={{
          mt: '$8', p: '$6', borderRadius: 16,
          borderWidth: 1, borderColor: '$border', backgroundColor: '#FAFAFA',
        }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
            Quick eligibility check
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
            5 questions — no account needed
          </Text>

          {/* Q1: Cancer history */}
          <View sx={{ mt: '$5' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Have you been diagnosed with breast cancer?
            </Text>
            <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3' }}>
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                <Pressable key={opt.label} onPress={() => setHasCancerHistory(opt.value)}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasCancerHistory === opt.value ? 'blue600' : '$border',
                    backgroundColor: hasCancerHistory === opt.value ? '#EFF6FF' : 'white',
                  }}>
                    <Text sx={{ fontSize: 14, color: hasCancerHistory === opt.value ? 'blue600' : '$foreground' }}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Q2: Age */}
          <View sx={{ mt: '$4' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Your age
            </Text>
            <View sx={{ mt: '$2' }}>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="Enter your age"
                style={{
                  borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
                  padding: 10, fontSize: 14,
                }}
              />
            </View>
          </View>

          {/* Q3: BRCA */}
          <View sx={{ mt: '$4' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Do you have a BRCA1 or BRCA2 genetic mutation?
            </Text>
            <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3', flexWrap: 'wrap' }}>
              {[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Unsure', value: 'unsure' }].map(opt => (
                <Pressable key={opt.value} onPress={() => setHasBrca(opt.value)}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasBrca === opt.value ? 'blue600' : '$border',
                    backgroundColor: hasBrca === opt.value ? '#EFF6FF' : 'white',
                  }}>
                    <Text sx={{ fontSize: 14, color: hasBrca === opt.value ? 'blue600' : '$foreground' }}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Q4: Family history */}
          <View sx={{ mt: '$4' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Do you have a family history of breast cancer?
            </Text>
            <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3' }}>
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                <Pressable key={opt.label} onPress={() => setHasFamilyHistory(opt.value)}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasFamilyHistory === opt.value ? 'blue600' : '$border',
                    backgroundColor: hasFamilyHistory === opt.value ? '#EFF6FF' : 'white',
                  }}>
                    <Text sx={{ fontSize: 14, color: hasFamilyHistory === opt.value ? 'blue600' : '$foreground' }}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Q5: ZIP */}
          <View sx={{ mt: '$4' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              ZIP code (optional — for trial site proximity)
            </Text>
            <View sx={{ mt: '$2' }}>
              <TextInput
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="number-pad"
                placeholder="e.g. 44195"
                style={{
                  borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
                  padding: 10, fontSize: 14,
                }}
              />
            </View>
          </View>

          {/* Submit */}
          <Pressable onPress={handleQuizSubmit} disabled={!canSubmitQuiz || prescreening}>
            <View sx={{
              mt: '$5', backgroundColor: canSubmitQuiz ? 'blue600' : '#9CA3AF',
              borderRadius: 8, px: '$6', py: '$3', alignSelf: 'flex-start',
              flexDirection: 'row', alignItems: 'center', gap: '$2',
            }}>
              {prescreening && <ActivityIndicator size="small" color="white" />}
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                {prescreening ? 'Checking...' : 'Check my eligibility'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Results */}
        {showResults && !prescreening && prescreenData && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground' }}>
              Your results
            </Text>

            {noMatchMessage ? (
              <View sx={{
                mt: '$4', p: '$5', borderRadius: 12,
                borderWidth: 1, borderColor: '$border',
              }}>
                <Text sx={{ fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
                  {noMatchMessage}
                </Text>
                <Link href="/start">
                  <View sx={{
                    mt: '$4', backgroundColor: 'blue600', borderRadius: 8,
                    px: '$6', py: '$3', alignSelf: 'flex-start',
                  }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Create free account for alerts
                    </Text>
                  </View>
                </Link>
              </View>
            ) : (
              <View sx={{ mt: '$4', gap: '$3' }}>
                {matchedTrials.map((match: any) => {
                  const colors = STRENGTH_COLORS[match.matchStrength] ?? STRENGTH_COLORS.possible;
                  return (
                    <View key={match.trial.nctId} sx={{
                      borderRadius: 12, borderWidth: 1, borderColor: colors.border,
                      backgroundColor: colors.bg, p: '$5',
                    }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                        <View sx={{
                          px: '$2', py: '$1', borderRadius: 6,
                          backgroundColor: colors.border,
                        }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: colors.fg }}>
                            {match.matchStrength.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                        {match.trial.phase && (
                          <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                            {match.trial.phase}
                          </Text>
                        )}
                      </View>
                      <Text sx={{ mt: '$2', fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                        {match.trial.title}
                      </Text>
                      {match.trial.vaccineTarget && (
                        <Text sx={{ mt: '$1', fontSize: 12, color: colors.fg }}>
                          Target: {match.trial.vaccineTarget}
                        </Text>
                      )}
                      <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                        {match.matchReason}
                      </Text>
                      <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', fontStyle: 'italic' }}>
                        {match.nextSteps}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Featured trials — always visible */}
        <View sx={{ mt: '$10' }}>
          <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground' }}>
            Featured prevention trials
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
            Curated by our clinical team
          </Text>

          {trialsLoading ? (
            <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading trials...</Text>
            </View>
          ) : (
            <View sx={{ mt: '$4', gap: '$3' }}>
              {allTrials.filter((t: any) => t.curatedSummary).map((trial: any) => (
                <View key={trial.nctId} sx={{
                  borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
                }}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
                    <View sx={{
                      px: '$2', py: '$1', borderRadius: 6,
                      backgroundColor: '#E0E7FF',
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#4338CA' }}>
                        {trial.trialCategory.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                    </View>
                    {trial.phase && (
                      <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{trial.phase}</Text>
                    )}
                    <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{trial.nctId}</Text>
                  </View>
                  <Text sx={{ mt: '$2', fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                    {trial.title}
                  </Text>
                  {trial.vaccineTarget && (
                    <Text sx={{ mt: '$1', fontSize: 12, color: '#4338CA' }}>
                      Target: {trial.vaccineTarget}
                    </Text>
                  )}
                  <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                    {trial.curatedSummary}
                  </Text>
                  {trial.targetPopulation && (
                    <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }}>
                      Who: {trial.targetPopulation}
                    </Text>
                  )}
                  {trial.editorNote && (
                    <View sx={{
                      mt: '$3', p: '$3', borderRadius: 8,
                      backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: '#92400E' }}>
                        Editor note: {trial.editorNote}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Educational section */}
        <View sx={{ mt: '$10' }}>
          <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground' }}>
            About prevention trials
          </Text>
          <View sx={{ mt: '$4', gap: '$4' }}>
            <View sx={{ p: '$5', borderRadius: 12, borderWidth: 1, borderColor: '$border' }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                What is a preventive vaccine?
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                Unlike therapeutic vaccines that treat existing cancer, preventive vaccines train your immune system to recognize and destroy cancer cells before they can grow. Think of it like a flu shot — but for cancer.
              </Text>
            </View>
            <View sx={{ p: '$5', borderRadius: 12, borderWidth: 1, borderColor: '$border' }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                How do prevention trials work?
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                Participants receive the investigational vaccine and are monitored over time. Researchers track immune response, safety, and whether the vaccine reduces cancer incidence compared to a control group.
              </Text>
            </View>
            <View sx={{ p: '$5', borderRadius: 12, borderWidth: 1, borderColor: '$border' }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                Who should consider these trials?
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                People at elevated risk — BRCA mutation carriers, those with strong family history, survivors of certain subtypes, and anyone whose doctor has discussed increased risk. Each trial has specific criteria.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View sx={{
          mt: '$10', p: '$6', borderRadius: 16,
          backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#93C5FD',
          alignItems: 'center',
        }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '#1E40AF', textAlign: 'center' }}>
            Get notified when new prevention trials open
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#1E40AF', textAlign: 'center' }}>
            Create a free account to receive alerts when new trials match your profile.
          </Text>
          <Link href="/start">
            <View sx={{
              mt: '$4', backgroundColor: 'blue600', borderRadius: 8,
              px: '$8', py: '$3',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Create free account
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
        <Text sx={{ mt: '$8', fontSize: 11, color: '$mutedForeground', lineHeight: 18 }}>
          This information is for educational purposes only and does not constitute medical advice.
          Trial eligibility is determined by the trial investigators, not this tool.
          Always consult with a healthcare provider before making decisions about clinical trial participation.
        </Text>
      </View>
    </ScrollView>
  );
}
