import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useSubmitCommunityReportMutation } from '../generated/graphql';

// ============================================================================
// Types + Constants
// ============================================================================

type ReportType = 'treatment_experience' | 'trial_participation' | 'side_effect';
type ConsentScope = 'platform_only' | 'research_anonymized' | 'public';

interface SideEffectEntry {
  name: string;
  severity: number;
}

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'treatment_experience',
    label: 'Treatment Experience',
    description: 'Share how a treatment worked for you, including side effects and overall experience',
  },
  {
    value: 'trial_participation',
    label: 'Trial Participation',
    description: 'Report on a clinical trial you participated in — what went well and what was hard',
  },
  {
    value: 'side_effect',
    label: 'Side Effect',
    description: 'Document a specific side effect, its severity, and how you managed it',
  },
];

const CONSENT_OPTIONS: { value: ConsentScope; label: string; description: string }[] = [
  {
    value: 'platform_only',
    label: 'Platform only',
    description: 'Only visible to you and platform analytics',
  },
  {
    value: 'research_anonymized',
    label: 'Research anonymized',
    description: 'May be included in anonymized aggregate data',
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to other patients in community feed',
  },
];

const TOTAL_STEPS = 4;

// ============================================================================
// Component
// ============================================================================

export function CommunitySubmitScreen() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Report type
  const [reportType, setReportType] = useState<ReportType | null>(null);

  // Step 2: Structured data — treatment experience
  const [txDrugName, setTxDrugName] = useState('');
  const [txDuration, setTxDuration] = useState('');
  const [txSideEffects, setTxSideEffects] = useState<SideEffectEntry[]>([]);
  const [txNewEffectName, setTxNewEffectName] = useState('');
  const [txNewEffectSeverity, setTxNewEffectSeverity] = useState<number>(0);
  const [txOverallRating, setTxOverallRating] = useState<number>(0);
  const [txEffectiveness, setTxEffectiveness] = useState('');

  // Step 2: Structured data — trial participation
  const [trialNctId, setTrialNctId] = useState('');
  const [trialName, setTrialName] = useState('');
  const [trialDuration, setTrialDuration] = useState('');
  const [trialRating, setTrialRating] = useState<number>(0);
  const [trialPros, setTrialPros] = useState<string[]>([]);
  const [trialNewPro, setTrialNewPro] = useState('');
  const [trialCons, setTrialCons] = useState<string[]>([]);
  const [trialNewCon, setTrialNewCon] = useState('');
  const [trialWouldParticipateAgain, setTrialWouldParticipateAgain] = useState<boolean | null>(null);

  // Step 2: Structured data — side effect
  const [seDrugName, setSeDrugName] = useState('');
  const [seEffectName, setSeEffectName] = useState('');
  const [seSeverity, setSeSeverity] = useState<number>(0);
  const [seOnset, setSeOnset] = useState('');
  const [seResolved, setSeResolved] = useState<boolean | null>(null);
  const [seManagementTips, setSeManagementTips] = useState('');

  // Step 3: Narrative
  const [narrative, setNarrative] = useState('');
  const [tips, setTips] = useState('');

  // Step 4: Consent
  const [consentScope, setConsentScope] = useState<ConsentScope | null>(null);

  const [submitReport, { loading }] = useSubmitCommunityReportMutation();

  // ============================================================================
  // Validation
  // ============================================================================

  const canProceed = (): boolean => {
    if (step === 1) return reportType !== null;
    if (step === 2) {
      if (reportType === 'treatment_experience') return txDrugName.trim().length > 0;
      if (reportType === 'trial_participation') return trialName.trim().length > 0;
      if (reportType === 'side_effect') return seDrugName.trim().length > 0 && seEffectName.trim().length > 0;
    }
    if (step === 3) return true; // narrative is optional
    if (step === 4) return consentScope !== null;
    return false;
  };

  // ============================================================================
  // Build structured data for submission
  // ============================================================================

  const buildStructuredData = () => {
    if (reportType === 'treatment_experience') {
      return {
        drugName: txDrugName.trim(),
        duration: txDuration.trim() || undefined,
        sideEffects: txSideEffects.length > 0 ? txSideEffects : undefined,
        overallRating: txOverallRating > 0 ? txOverallRating : undefined,
        effectiveness: txEffectiveness.trim() || undefined,
      };
    }
    if (reportType === 'trial_participation') {
      return {
        nctId: trialNctId.trim() || undefined,
        trialName: trialName.trim(),
        duration: trialDuration.trim() || undefined,
        rating: trialRating > 0 ? trialRating : undefined,
        pros: trialPros.length > 0 ? trialPros : undefined,
        cons: trialCons.length > 0 ? trialCons : undefined,
        wouldParticipateAgain: trialWouldParticipateAgain,
      };
    }
    if (reportType === 'side_effect') {
      return {
        drugName: seDrugName.trim(),
        effectName: seEffectName.trim(),
        severity: seSeverity > 0 ? seSeverity : undefined,
        onset: seOnset.trim() || undefined,
        resolved: seResolved,
        managementTips: seManagementTips.trim() || undefined,
      };
    }
    return {};
  };

  const getRelatedDrug = (): string | undefined => {
    if (reportType === 'treatment_experience') return txDrugName.trim() || undefined;
    if (reportType === 'side_effect') return seDrugName.trim() || undefined;
    return undefined;
  };

  // ============================================================================
  // Submit
  // ============================================================================

  const handleSubmit = () => {
    if (!canProceed() || !reportType || !consentScope) return;
    submitReport({
      variables: {
        input: {
          reportType,
          consentScope,
          structuredData: buildStructuredData(),
          narrative: narrative.trim() || undefined,
          relatedDrug: getRelatedDrug(),
        },
      },
    }).then(() => {
      setSubmitted(true);
    }).catch(() => {
      // Error handled by Apollo
    });
  };

  // ============================================================================
  // Side effect list management (treatment experience)
  // ============================================================================

  const addSideEffect = () => {
    if (!txNewEffectName.trim() || txNewEffectSeverity === 0) return;
    setTxSideEffects([...txSideEffects, { name: txNewEffectName.trim(), severity: txNewEffectSeverity }]);
    setTxNewEffectName('');
    setTxNewEffectSeverity(0);
  };

  const removeSideEffect = (index: number) => {
    setTxSideEffects(txSideEffects.filter((_, i) => i !== index));
  };

  // ============================================================================
  // Pros/Cons list management (trial participation)
  // ============================================================================

  const addPro = () => {
    if (!trialNewPro.trim()) return;
    setTrialPros([...trialPros, trialNewPro.trim()]);
    setTrialNewPro('');
  };

  const removePro = (index: number) => {
    setTrialPros(trialPros.filter((_, i) => i !== index));
  };

  const addCon = () => {
    if (!trialNewCon.trim()) return;
    setTrialCons([...trialCons, trialNewCon.trim()]);
    setTrialNewCon('');
  };

  const removeCon = (index: number) => {
    setTrialCons(trialCons.filter((_, i) => i !== index));
  };

  // ============================================================================
  // Success state
  // ============================================================================

  if (submitted) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%', alignItems: 'center' }}>
          <View sx={{
            mt: '$8',
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#ECFDF5',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text sx={{ fontSize: 32, color: '#059669' }}>{'\u2713'}</Text>
          </View>
          <Text sx={{ mt: '$4', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
            Report Submitted
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
            Thank you for sharing your experience. Your contribution helps other patients make more informed decisions.
          </Text>
          <Link href="/intel/community">
            <View sx={{
              mt: '$6',
              backgroundColor: '#7C3AED',
              borderRadius: 8,
              px: '$6',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Back to Community
              </Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Step indicator */}
        <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
          Step {step} of {TOTAL_STEPS}
        </Text>
        <View sx={{ mt: '$2', height: 4, backgroundColor: '$border', borderRadius: 2 }}>
          <View sx={{
            height: 4,
            backgroundColor: '#7C3AED',
            borderRadius: 2,
            width: `${(step / TOTAL_STEPS) * 100}%` as any,
          }} />
        </View>

        {/* ================================================================ */}
        {/* Step 1: Report Type */}
        {/* ================================================================ */}
        {step === 1 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              What would you like to share?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Choose the type of report that best fits your experience.
            </Text>
            <View sx={{ mt: '$6', gap: '$3' }}>
              {REPORT_TYPES.map((rt) => (
                <Pressable
                  key={rt.value}
                  onPress={() => {
                    setReportType(rt.value);
                    setStep(2);
                  }}
                >
                  <View sx={{
                    borderWidth: 1,
                    borderColor: reportType === rt.value ? '#7C3AED' : '$border',
                    backgroundColor: reportType === rt.value ? '#F5F3FF' : undefined,
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    <Text sx={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: reportType === rt.value ? '#7C3AED' : '$foreground',
                    }}>
                      {rt.label}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                      {rt.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ================================================================ */}
        {/* Step 2: Structured Data */}
        {/* ================================================================ */}
        {step === 2 && reportType === 'treatment_experience' && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Treatment Details
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Tell us about your treatment experience.
            </Text>

            <View sx={{ mt: '$6', gap: '$5' }}>
              {/* Drug name */}
              <FormField label="Drug name *">
                <TextInput
                  value={txDrugName}
                  onChangeText={setTxDrugName}
                  placeholder="e.g., Tamoxifen, Keytruda, AC-T"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Duration */}
              <FormField label="Duration">
                <TextInput
                  value={txDuration}
                  onChangeText={setTxDuration}
                  placeholder="e.g., 6 months, 4 cycles"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Side effects list */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Side effects
                </Text>
                {txSideEffects.map((se, i) => (
                  <View
                    key={i}
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 8,
                      px: '$3',
                      py: '$2',
                      mb: '$2',
                    }}
                  >
                    <Text sx={{ fontSize: 14, color: '$foreground' }}>
                      {se.name} — Severity {se.severity}/5
                    </Text>
                    <Pressable onPress={() => removeSideEffect(i)}>
                      <Text sx={{ fontSize: 14, color: '#EF4444', fontWeight: '600' }}>Remove</Text>
                    </Pressable>
                  </View>
                ))}

                {/* Add new side effect */}
                <View sx={{ mt: '$2', gap: '$2' }}>
                  <TextInput
                    value={txNewEffectName}
                    onChangeText={setTxNewEffectName}
                    placeholder="Side effect name"
                    placeholderTextColor="#9CA3AF"
                    style={inputStyle}
                  />
                  <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>Severity</Text>
                  <NumberButtons
                    min={1}
                    max={5}
                    value={txNewEffectSeverity}
                    onChange={setTxNewEffectSeverity}
                  />
                  <Pressable onPress={addSideEffect}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '#7C3AED',
                      borderRadius: 8,
                      py: '$2',
                      alignItems: 'center',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: '#7C3AED' }}>
                        + Add Side Effect
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Overall rating */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Overall rating
                </Text>
                <StarRating value={txOverallRating} onChange={setTxOverallRating} />
              </View>

              {/* Effectiveness */}
              <FormField label="Effectiveness perception">
                <TextInput
                  value={txEffectiveness}
                  onChangeText={setTxEffectiveness}
                  placeholder="How effective did this treatment feel?"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>
            </View>
          </View>
        )}

        {step === 2 && reportType === 'trial_participation' && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Trial Details
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Share your clinical trial experience.
            </Text>

            <View sx={{ mt: '$6', gap: '$5' }}>
              {/* NCT ID */}
              <FormField label="NCT ID (optional)">
                <TextInput
                  value={trialNctId}
                  onChangeText={setTrialNctId}
                  placeholder="e.g., NCT04123456"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Trial name */}
              <FormField label="Trial name *">
                <TextInput
                  value={trialName}
                  onChangeText={setTrialName}
                  placeholder="Name or description of the trial"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Duration */}
              <FormField label="Duration">
                <TextInput
                  value={trialDuration}
                  onChangeText={setTrialDuration}
                  placeholder="e.g., 12 months, ongoing"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Rating */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Overall rating
                </Text>
                <StarRating value={trialRating} onChange={setTrialRating} />
              </View>

              {/* Pros */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Pros
                </Text>
                {trialPros.map((pro, i) => (
                  <View
                    key={i}
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 8,
                      px: '$3',
                      py: '$2',
                      mb: '$2',
                    }}
                  >
                    <Text sx={{ fontSize: 14, color: '$foreground', flex: 1, mr: '$2' }}>{pro}</Text>
                    <Pressable onPress={() => removePro(i)}>
                      <Text sx={{ fontSize: 14, color: '#EF4444', fontWeight: '600' }}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <View sx={{ flexDirection: 'row', gap: '$2' }}>
                  <TextInput
                    value={trialNewPro}
                    onChangeText={setTrialNewPro}
                    placeholder="Add a pro"
                    placeholderTextColor="#9CA3AF"
                    style={[inputStyle, { flex: 1 }]}
                  />
                  <Pressable onPress={addPro}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '#7C3AED',
                      borderRadius: 8,
                      px: '$3',
                      py: '$2',
                      justifyContent: 'center',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: '#7C3AED' }}>Add</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Cons */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Cons
                </Text>
                {trialCons.map((con, i) => (
                  <View
                    key={i}
                    sx={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 8,
                      px: '$3',
                      py: '$2',
                      mb: '$2',
                    }}
                  >
                    <Text sx={{ fontSize: 14, color: '$foreground', flex: 1, mr: '$2' }}>{con}</Text>
                    <Pressable onPress={() => removeCon(i)}>
                      <Text sx={{ fontSize: 14, color: '#EF4444', fontWeight: '600' }}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <View sx={{ flexDirection: 'row', gap: '$2' }}>
                  <TextInput
                    value={trialNewCon}
                    onChangeText={setTrialNewCon}
                    placeholder="Add a con"
                    placeholderTextColor="#9CA3AF"
                    style={[inputStyle, { flex: 1 }]}
                  />
                  <Pressable onPress={addCon}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '#7C3AED',
                      borderRadius: 8,
                      px: '$3',
                      py: '$2',
                      justifyContent: 'center',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: '#7C3AED' }}>Add</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Would participate again */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Would you participate again?
                </Text>
                <View sx={{ flexDirection: 'row', gap: '$3' }}>
                  {[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ].map((opt) => (
                    <Pressable
                      key={opt.label}
                      onPress={() => setTrialWouldParticipateAgain(opt.value)}
                      sx={{ flex: 1 }}
                    >
                      <View sx={{
                        borderWidth: 1,
                        borderColor: trialWouldParticipateAgain === opt.value ? '#7C3AED' : '$border',
                        backgroundColor: trialWouldParticipateAgain === opt.value ? '#F5F3FF' : undefined,
                        borderRadius: 8,
                        py: '$3',
                        alignItems: 'center',
                      }}>
                        <Text sx={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: trialWouldParticipateAgain === opt.value ? '#7C3AED' : '$foreground',
                        }}>
                          {opt.label}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 2 && reportType === 'side_effect' && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Side Effect Details
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Document the side effect so others can learn from your experience.
            </Text>

            <View sx={{ mt: '$6', gap: '$5' }}>
              {/* Drug name */}
              <FormField label="Drug name *">
                <TextInput
                  value={seDrugName}
                  onChangeText={setSeDrugName}
                  placeholder="e.g., Tamoxifen, Letrozole"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Effect name */}
              <FormField label="Side effect *">
                <TextInput
                  value={seEffectName}
                  onChangeText={setSeEffectName}
                  placeholder="e.g., Joint pain, Fatigue, Nausea"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Severity */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Severity
                </Text>
                <NumberButtons min={1} max={5} value={seSeverity} onChange={setSeSeverity} />
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mt: 4 }}>
                  <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Mild</Text>
                  <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Severe</Text>
                </View>
              </View>

              {/* Onset */}
              <FormField label="Onset">
                <TextInput
                  value={seOnset}
                  onChangeText={setSeOnset}
                  placeholder="e.g., 2 weeks after starting"
                  placeholderTextColor="#9CA3AF"
                  style={inputStyle}
                />
              </FormField>

              {/* Resolved */}
              <View>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Has it resolved?
                </Text>
                <View sx={{ flexDirection: 'row', gap: '$3' }}>
                  {[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ].map((opt) => (
                    <Pressable
                      key={opt.label}
                      onPress={() => setSeResolved(opt.value)}
                      sx={{ flex: 1 }}
                    >
                      <View sx={{
                        borderWidth: 1,
                        borderColor: seResolved === opt.value ? '#7C3AED' : '$border',
                        backgroundColor: seResolved === opt.value ? '#F5F3FF' : undefined,
                        borderRadius: 8,
                        py: '$3',
                        alignItems: 'center',
                      }}>
                        <Text sx={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: seResolved === opt.value ? '#7C3AED' : '$foreground',
                        }}>
                          {opt.label}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Management tips */}
              <FormField label="Management tips">
                <TextInput
                  value={seManagementTips}
                  onChangeText={setSeManagementTips}
                  placeholder="What helped you manage this side effect?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' as any }]}
                />
              </FormField>
            </View>
          </View>
        )}

        {/* ================================================================ */}
        {/* Step 3: Narrative + Tips */}
        {/* ================================================================ */}
        {step === 3 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Your Story
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Optional: share additional context in your own words.
            </Text>

            <View sx={{ mt: '$6', gap: '$5' }}>
              <FormField label="Share your story">
                <TextInput
                  value={narrative}
                  onChangeText={(text) => setNarrative(text.slice(0, 5000))}
                  placeholder="Describe your experience in your own words..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={8}
                  style={[inputStyle, { minHeight: 160, textAlignVertical: 'top' as any }]}
                />
                <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground', textAlign: 'right' }}>
                  {narrative.length} / 5000
                </Text>
              </FormField>

              <FormField label="Tips for others">
                <TextInput
                  value={tips}
                  onChangeText={setTips}
                  placeholder="Anything you wish you had known?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' as any }]}
                />
              </FormField>
            </View>
          </View>
        )}

        {/* ================================================================ */}
        {/* Step 4: Consent Scope */}
        {/* ================================================================ */}
        {step === 4 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Who can see this?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Choose how your report is shared. You can change this later.
            </Text>

            <View sx={{ mt: '$6', gap: '$3' }}>
              {CONSENT_OPTIONS.map((opt) => (
                <Pressable key={opt.value} onPress={() => setConsentScope(opt.value)}>
                  <View sx={{
                    borderWidth: 1,
                    borderColor: consentScope === opt.value ? '#7C3AED' : '$border',
                    backgroundColor: consentScope === opt.value ? '#F5F3FF' : undefined,
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    <Text sx={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: consentScope === opt.value ? '#7C3AED' : '$foreground',
                    }}>
                      {opt.label}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                      {opt.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ================================================================ */}
        {/* Navigation */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8', flexDirection: 'row', gap: '$3' }}>
          {step > 1 && (
            <Pressable onPress={() => setStep(step - 1)}>
              <View sx={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '$border',
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>Back</Text>
              </View>
            </Pressable>
          )}

          {step > 1 && step < TOTAL_STEPS && (
            <Pressable onPress={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}>
              <View sx={{
                borderRadius: 8,
                px: '$6',
                py: '$3',
                backgroundColor: canProceed() ? '#7C3AED' : '#D1D5DB',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Continue</Text>
              </View>
            </Pressable>
          )}

          {step === TOTAL_STEPS && (
            <Pressable onPress={handleSubmit} disabled={loading || !canProceed()}>
              <View sx={{
                borderRadius: 8,
                px: '$6',
                py: '$3',
                backgroundColor: loading || !canProceed() ? '#D1D5DB' : '#7C3AED',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '$2',
              }}>
                {loading && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function NumberButtons({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View sx={{ flexDirection: 'row', gap: '$2' }}>
      {range.map((n) => (
        <Pressable key={n} onPress={() => onChange(n)}>
          <View sx={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: value === n ? '#7C3AED' : '$border',
            backgroundColor: value === n ? '#7C3AED' : undefined,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text sx={{
              fontSize: 16,
              fontWeight: '600',
              color: value === n ? 'white' : '$foreground',
            }}>
              {n}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View sx={{ flexDirection: 'row', gap: '$2' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)}>
          <View sx={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: value >= n ? '#7C3AED' : '$border',
            backgroundColor: value >= n ? '#7C3AED' : undefined,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text sx={{
              fontSize: 20,
              color: value >= n ? 'white' : '$mutedForeground',
            }}>
              {value >= n ? '\u2605' : '\u2606'}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 14,
  color: '#111827',
} as const;
