import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'solito/router';
import { InlineMagicLink } from '../components';
import { Picker } from '../components/Picker';
import { useMeQuery, useGetPatientQuery, useSavePatientIntakeMutation, useExtractDocumentsMutation } from '../generated/graphql';
import type { PatientProfile, FinancialProfile } from '@iish/shared';
import { INSURANCE_TYPES, INCOME_RANGES, ASSISTANCE_CATEGORIES } from '@iish/shared';

type PageState = 'loading' | 'extracting' | 'editing' | 'auth_required' | 'saving' | 'error';

interface UploadedFile {
  s3Key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

function ConfidenceBadge({ confidence, source }: { confidence?: number; source?: string }) {
  let bg = '#F3F4F6'; let color = '#6B7280'; let label = 'No data';
  if (source === 'fhir') { bg = '#D1FAE5'; color = '#047857'; label = 'from MyChart'; }
  else if (source === 'manual') { bg = '#F3F4F6'; color = '#6B7280'; label = 'Manual'; }
  else if (confidence != null && confidence >= 0.8) { bg = '#DCFCE7'; color = '#15803D'; label = 'High'; }
  else if (confidence != null && confidence >= 0.5) { bg = '#FEF3C7'; color = '#B45309'; label = 'Review'; }
  else if (confidence != null) { bg = '#FEE2E2'; color = '#DC2626'; label = 'Low'; }

  return (
    <View sx={{ ml: '$1', borderRadius: 4, px: '$1', py: 2, backgroundColor: bg }}>
      <Text sx={{ fontSize: 10, fontWeight: '500', color }}>{label}</Text>
    </View>
  );
}

const ECOG_OPTIONS = [
  { label: 'Unknown', value: '' },
  { label: '0 — Fully active', value: '0' },
  { label: '1 — Restricted but ambulatory', value: '1' },
  { label: '2 — Ambulatory, capable of self-care', value: '2' },
  { label: '3 — Limited self-care', value: '3' },
  { label: '4 — Completely disabled', value: '4' },
];

export function ConfirmProfileScreen({ path = 'upload' }: { path?: string }) {
  const router = useRouter();
  const { data: meData } = useMeQuery();
  const { data: patientData } = useGetPatientQuery({ skip: path !== 'mychart' });
  const [saveIntake] = useSavePatientIntakeMutation();
  const [extractDocs] = useExtractDocumentsMutation();

  const [state, setState] = useState<PageState>('loading');
  const [profile, setProfile] = useState<PatientProfile>({});
  const [fieldSources, setFieldSources] = useState<Record<string, string>>({});
  const [fieldConfidence, setFieldConfidence] = useState<Record<string, number>>({});
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [couldNotExtract, setCouldNotExtract] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [extractionError, setExtractionError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [claudeApiCost, setClaudeApiCost] = useState(0);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>({});

  // Check auth
  useEffect(() => {
    setIsAuthenticated(!!meData?.me);
  }, [meData]);

  // Load data on mount
  useEffect(() => {
    if (path === 'manual') {
      if (Platform.OS === 'web') {
        const stored = sessionStorage.getItem('iish_manual_profile');
        if (!stored) { router.push('/start/manual'); return; }
        const parsed = JSON.parse(stored) as PatientProfile;
        setProfile(parsed);
        const sources: Record<string, string> = {};
        for (const key of Object.keys(parsed)) { sources[key] = 'manual'; }
        setFieldSources(sources);
      }
      setState('editing');
    } else if (path === 'mychart') {
      if (patientData?.patient?.profile) {
        setProfile(patientData.patient.profile as unknown as PatientProfile);
        if (Platform.OS === 'web') {
          const missing = sessionStorage.getItem('iish_fhir_missing');
          if (missing) {
            setCouldNotExtract(JSON.parse(missing));
            sessionStorage.removeItem('iish_fhir_missing');
          }
        }
        setState('editing');
      } else if (patientData !== undefined) {
        router.push('/start/mychart');
      }
    } else {
      // Upload path
      if (Platform.OS === 'web') {
        const stored = sessionStorage.getItem('iish_uploaded_files');
        if (!stored) { router.push('/start/upload'); return; }
        const files = JSON.parse(stored) as UploadedFile[];
        setUploadedFiles(files);
        setState('extracting');
        triggerExtraction(files);
      } else {
        setState('editing');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientData]);

  const triggerExtraction = async (files: UploadedFile[]) => {
    try {
      const { data } = await extractDocs({
        variables: {
          s3Keys: files.map(f => f.s3Key),
          mimeTypes: files.map(f => f.mimeType),
        },
      });
      const result = data?.extractDocuments;
      if (result?.status === 'completed' && result.profile) {
        setProfile(result.profile as unknown as PatientProfile);
        setFieldSources((result.fieldSources as Record<string, string>) ?? {});
        setFieldConfidence((result.fieldConfidence as Record<string, number>) ?? {});
        setClaudeApiCost(result.claudeApiCost ?? 0);
        const review: string[] = [];
        const missing: string[] = [];
        for (const ext of ((result.extractions as unknown as any[]) ?? [])) {
          review.push(...(ext.needsReview ?? []));
          missing.push(...(ext.couldNotExtract ?? []));
        }
        setNeedsReview([...new Set(review)]);
        setCouldNotExtract([...new Set(missing)]);
        setState('editing');
      } else {
        setExtractionError(result?.error ?? 'Extraction failed');
        setState('error');
      }
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : 'Extraction failed');
      setState('error');
    }
  };

  const updateProfileField = (field: keyof PatientProfile, value: unknown) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (fieldSources[field] !== 'manual') {
      setFieldSources(prev => ({ ...prev, [field]: 'user_edited' }));
    }
  };

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) { setState('auth_required'); return; }
    setState('saving');
    setSaveError('');
    try {
      await saveIntake({
        variables: {
          input: {
            profile: { ...profile, financialProfile: Object.keys(financialProfile).length > 0 ? financialProfile : undefined },
            fieldSources,
            fieldConfidence,
            intakePath: path,
            documents: uploadedFiles.map(f => ({
              s3Key: f.s3Key, mimeType: f.mimeType, fileSize: f.fileSize, filename: f.filename,
            })),
            claudeApiCost,
          },
        },
      });
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('iish_uploaded_files');
        sessionStorage.removeItem('iish_manual_profile');
      }
      router.push('/matches');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
      setState('editing');
    }
  }, [isAuthenticated, profile, fieldSources, fieldConfidence, path, uploadedFiles, claudeApiCost, financialProfile, router, saveIntake]);

  const handleAuthDetected = useCallback(() => {
    setIsAuthenticated(true);
    setState('editing');
    setTimeout(() => handleSave(), 100);
  }, [handleSave]);

  // --- Render states ---

  if (state === 'loading') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: '$mutedForeground' }}>Loading...</Text>
      </View>
    );
  }

  if (state === 'extracting') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Analyzing your documents</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Our AI is reading your documents and extracting clinical details. This usually takes 10-30 seconds.
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
            Processing {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''}...
          </Text>
        </View>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Extraction failed</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: 'red600' }}>{extractionError}</Text>
        <View sx={{ mt: '$6', flexDirection: 'row', gap: '$3' }}>
          <Pressable onPress={() => router.push('/start/upload')}>
            <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$4', py: '$2' }}>
              <Text sx={{ fontSize: 14, color: '$foreground' }}>Try again</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/start/manual')}>
            <View sx={{ backgroundColor: 'blue600', borderRadius: 8, px: '$4', py: '$2' }}>
              <Text sx={{ fontSize: 14, color: 'white' }}>Enter details manually</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  const fieldStyle = (field: string) => {
    if (couldNotExtract.includes(field)) return { borderRadius: 8, borderWidth: 2, borderColor: '#FECACA', backgroundColor: '#FEF2F2', p: '$3' };
    if (needsReview.includes(field)) return { borderRadius: 8, borderWidth: 2, borderColor: '#FDE68A', backgroundColor: '#FFFBEB', p: '$3' };
    return {};
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Confirm your details</Text>
        <Text sx={{ mt: '$2', mb: '$8', fontSize: 14, color: '$mutedForeground' }}>
          {path === 'upload'
            ? 'Review the information extracted from your documents. Edit any fields that need correction.'
            : path === 'mychart'
            ? 'Review the data pulled from your MyChart records. Fields marked "from MyChart" were imported automatically.'
            : 'Review the information you entered. Make any changes before we match you to trials.'}
        </Text>

        <View sx={{ gap: '$5' }}>
          {/* Cancer type */}
          <View sx={fieldStyle('cancerType')}>
            <View sx={{ mb: '$1', flexDirection: 'row', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Cancer type</Text>
              <ConfidenceBadge confidence={fieldConfidence.cancerType} source={fieldSources.cancerType} />
            </View>
            <TextInput
              value={profile.cancerType ?? ''}
              onChangeText={v => updateProfileField('cancerType', v)}
              placeholder="e.g., Invasive ductal carcinoma"
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }}
            />
            {couldNotExtract.includes('cancerType') && (
              <Text sx={{ mt: '$1', fontSize: 12, color: 'red600' }}>Could not extract — please enter manually or upload another document</Text>
            )}
          </View>

          {/* Stage */}
          <View sx={fieldStyle('stage')}>
            <View sx={{ mb: '$1', flexDirection: 'row', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Stage</Text>
              <ConfidenceBadge confidence={fieldConfidence.stage} source={fieldSources.stage} />
            </View>
            <TextInput
              value={profile.stage ?? ''}
              onChangeText={v => updateProfileField('stage', v)}
              placeholder="e.g., IIA"
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }}
            />
          </View>

          {/* Histological grade */}
          <View>
            <View sx={{ mb: '$1', flexDirection: 'row', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Histological grade</Text>
              <ConfidenceBadge confidence={fieldConfidence.histologicalGrade} source={fieldSources.histologicalGrade} />
            </View>
            <TextInput
              value={profile.histologicalGrade ?? ''}
              onChangeText={v => updateProfileField('histologicalGrade', v)}
              placeholder="e.g., Grade 2"
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }}
            />
          </View>

          {/* Receptor status */}
          {(profile.receptorStatus || profile.cancerTypeNormalized === 'breast') && (
            <View>
              <View sx={{ mb: '$2', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Receptor status</Text>
                <ConfidenceBadge confidence={fieldConfidence.receptorStatus} source={fieldSources.receptorStatus} />
              </View>
              <View sx={{ flexDirection: 'row', gap: '$3' }}>
                {(['er', 'pr', 'her2'] as const).map(receptor => (
                  <View key={receptor} sx={{ flex: 1 }}>
                    <Text sx={{ mb: '$1', fontSize: 12, color: '$mutedForeground' }}>{receptor.toUpperCase()}</Text>
                    <TextInput
                      value={profile.receptorStatus?.[receptor]?.status ?? ''}
                      onChangeText={v => updateProfileField('receptorStatus', {
                        ...profile.receptorStatus,
                        [receptor]: { ...profile.receptorStatus?.[receptor], status: v },
                      })}
                      placeholder="positive/negative"
                      style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14 }}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Prior treatments */}
          {profile.priorTreatments && profile.priorTreatments.length > 0 && (
            <View>
              <View sx={{ mb: '$2', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Prior treatments</Text>
                <ConfidenceBadge confidence={fieldConfidence.priorTreatments} source={fieldSources.priorTreatments} />
              </View>
              <View sx={{ gap: '$2' }}>
                {profile.priorTreatments.map((t, i) => (
                  <View key={i} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', borderRadius: 4, borderWidth: 1, borderColor: '$border', p: '$2' }}>
                    <TextInput
                      value={t.name}
                      onChangeText={v => {
                        const updated = [...(profile.priorTreatments ?? [])];
                        updated[i] = { ...updated[i], name: v };
                        updateProfileField('priorTreatments', updated);
                      }}
                      placeholder="Treatment name"
                      style={{ flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14 }}
                    />
                    <Text sx={{ fontSize: 12, color: '#9CA3AF' }}>{t.type}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ECOG */}
          <View>
            <View sx={{ mb: '$1', flexDirection: 'row', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>ECOG Status</Text>
              <ConfidenceBadge confidence={fieldConfidence.ecogStatus} source={fieldSources.ecogStatus} />
            </View>
            <Picker
              value={profile.ecogStatus?.toString() ?? ''}
              onValueChange={v => updateProfileField('ecogStatus', v ? parseInt(v, 10) : undefined)}
              options={ECOG_OPTIONS}
            />
          </View>

          {/* Age + Zip */}
          <View sx={{ flexDirection: 'row', gap: '$4' }}>
            <View sx={{ flex: 1 }}>
              <Text sx={{ mb: '$1', fontSize: 14, fontWeight: '500', color: '#374151' }}>Age</Text>
              <TextInput
                value={profile.age?.toString() ?? ''}
                onChangeText={v => updateProfileField('age', v ? parseInt(v, 10) : undefined)}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }}
              />
            </View>
            <View sx={{ flex: 1 }}>
              <Text sx={{ mb: '$1', fontSize: 14, fontWeight: '500', color: '#374151' }}>Zip code</Text>
              <TextInput
                value={profile.zipCode ?? ''}
                onChangeText={v => updateProfileField('zipCode', v)}
                maxLength={10}
                placeholder="e.g., 94110"
                style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }}
              />
            </View>
          </View>

          {/* Financial assistance toggle */}
          <View sx={{ mt: '$6', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
            <Pressable onPress={() => setFinancialOpen(!financialOpen)}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', px: '$4', py: '$3' }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Financial assistance</Text>
                  <Text sx={{ ml: '$2', fontSize: 12, color: '#9CA3AF' }}>(optional)</Text>
                </View>
                <Text sx={{ fontSize: 14, color: '#9CA3AF' }}>{financialOpen ? '\u25B2' : '\u25BC'}</Text>
              </View>
            </Pressable>
            {financialOpen && (
              <View sx={{ gap: '$4', borderTopWidth: 1, borderTopColor: '$border', px: '$4', py: '$4' }}>
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                  Help us find financial assistance programs you may qualify for. All fields are optional and kept private.
                </Text>

                {/* Insurance type */}
                <View>
                  <Text sx={{ mb: '$1', fontSize: 14, fontWeight: '500', color: '#374151' }}>Insurance type</Text>
                  <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
                    {INSURANCE_TYPES.map(type => (
                      <Pressable key={type} onPress={() => setFinancialProfile(p => ({ ...p, insuranceType: p.insuranceType === type ? undefined : type }))}>
                        <View sx={{
                          borderRadius: 20, borderWidth: 1, px: '$3', py: '$1',
                          borderColor: financialProfile.insuranceType === type ? 'blue600' : '$border',
                          backgroundColor: financialProfile.insuranceType === type ? '#EFF6FF' : 'transparent',
                        }}>
                          <Text sx={{ fontSize: 12, color: financialProfile.insuranceType === type ? '#1D4ED8' : '#4B5563' }}>{type}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Household size */}
                <View>
                  <Text sx={{ mb: '$1', fontSize: 14, fontWeight: '500', color: '#374151' }}>Household size</Text>
                  <Picker
                    value={financialProfile.householdSize?.toString() ?? ''}
                    onValueChange={v => setFinancialProfile(p => ({ ...p, householdSize: v ? parseInt(v, 10) : undefined }))}
                    options={[
                      { label: 'Select...', value: '' },
                      ...([1, 2, 3, 4, 5, 6, 7, 8] as const).map(n => ({ label: `${n}${n === 8 ? '+' : ''}`, value: String(n) })),
                    ]}
                  />
                </View>

                {/* Income range */}
                <View>
                  <Text sx={{ mb: '$1', fontSize: 14, fontWeight: '500', color: '#374151' }}>Household income (annual)</Text>
                  <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
                    {INCOME_RANGES.map(range => (
                      <Pressable key={range} onPress={() => setFinancialProfile(p => ({ ...p, householdIncome: p.householdIncome === range ? undefined : range }))}>
                        <View sx={{
                          borderRadius: 20, borderWidth: 1, px: '$3', py: '$1',
                          borderColor: financialProfile.householdIncome === range ? 'blue600' : '$border',
                          backgroundColor: financialProfile.householdIncome === range ? '#EFF6FF' : 'transparent',
                        }}>
                          <Text sx={{ fontSize: 12, color: financialProfile.householdIncome === range ? '#1D4ED8' : '#4B5563' }}>{range}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Financial concerns */}
                <View>
                  <Text sx={{ mb: '$1', fontSize: 14, fontWeight: '500', color: '#374151' }}>What costs concern you most?</Text>
                  <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
                    {[
                      { key: ASSISTANCE_CATEGORIES.COPAY_TREATMENT, label: 'Drug copays' },
                      { key: ASSISTANCE_CATEGORIES.TRANSPORTATION, label: 'Transportation' },
                      { key: ASSISTANCE_CATEGORIES.LIVING_EXPENSES, label: 'Living expenses' },
                      { key: ASSISTANCE_CATEGORIES.CHILDCARE, label: 'Childcare' },
                      { key: ASSISTANCE_CATEGORIES.FOOD, label: 'Food' },
                      { key: ASSISTANCE_CATEGORIES.LODGING, label: 'Lodging' },
                    ].map(({ key, label }) => {
                      const selected = financialProfile.financialConcerns?.includes(key) ?? false;
                      return (
                        <Pressable key={key} onPress={() => {
                          setFinancialProfile(p => {
                            const current = p.financialConcerns ?? [];
                            return { ...p, financialConcerns: selected ? current.filter(c => c !== key) : [...current, key] };
                          });
                        }}>
                          <View sx={{
                            borderRadius: 20, borderWidth: 1, px: '$3', py: '$1',
                            borderColor: selected ? 'blue600' : '$border',
                            backgroundColor: selected ? '#EFF6FF' : 'transparent',
                          }}>
                            <Text sx={{ fontSize: 12, color: selected ? '#1D4ED8' : '#4B5563' }}>{label}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Auth section */}
        {state === 'auth_required' && (
          <View sx={{ mt: '$8' }}>
            <InlineMagicLink onAuthDetected={handleAuthDetected} redirectPath="/start/confirm" />
          </View>
        )}

        {/* Save error */}
        {saveError ? <Text sx={{ mt: '$4', fontSize: 14, color: 'red600' }}>{saveError}</Text> : null}

        {/* Actions */}
        <View sx={{ mt: '$8', flexDirection: 'row', gap: '$3' }}>
          <Pressable onPress={() => router.push(`/start/${path}`)}>
            <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$4', py: 10 }}>
              <Text sx={{ fontSize: 14, color: '#374151' }}>Back</Text>
            </View>
          </Pressable>
          <Pressable onPress={handleSave} disabled={state === 'saving'} style={{ flex: 1 }}>
            <View sx={{
              flex: 1,
              backgroundColor: state === 'saving' ? '#D1D5DB' : 'blue600',
              borderRadius: 8,
              px: '$6',
              py: 10,
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                {state === 'saving' ? 'Saving...' : 'Find my matches'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Upload another link */}
        {path === 'upload' && (
          <Pressable onPress={() => router.push('/start/upload')} style={{ marginTop: 16, alignSelf: 'center' }}>
            <Text sx={{ fontSize: 14, color: 'blue600' }}>Upload another document for more data</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
