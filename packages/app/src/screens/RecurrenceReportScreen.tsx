import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { useReportRecurrenceMutation } from '../generated/graphql';

const DETECTION_METHODS = [
  { label: 'My doctor told me', value: 'doctor_reported' },
  { label: 'Scan or imaging results', value: 'imaging' },
  { label: 'New symptoms', value: 'new_symptoms' },
  { label: 'ctDNA / liquid biopsy positive', value: 'ctdna_positive' },
  { label: 'Biopsy confirmed', value: 'biopsy_confirmed' },
];

const RECURRENCE_SITES = [
  'Bone', 'Liver', 'Lung', 'Brain', 'Chest wall', 'Lymph nodes', 'Skin', 'Other',
];

const RECURRENCE_TYPES = [
  { label: 'Local (same area)', value: 'local' },
  { label: 'Regional (nearby)', value: 'regional' },
  { label: 'Distant (spread)', value: 'distant' },
  { label: 'Contralateral (other side)', value: 'contralateral' },
  { label: "I'm not sure", value: 'unknown' },
];

export function RecurrenceReportScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [detectionMethod, setDetectionMethod] = useState('');
  const [detectedDate, setDetectedDate] = useState('');
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [recurrenceType, setRecurrenceType] = useState('');
  const [confirmedByBiopsy, setConfirmedByBiopsy] = useState<boolean | null>(null);
  const [newStage, setNewStage] = useState('');

  const [reportRecurrence, { loading }] = useReportRecurrenceMutation();

  const toggleSite = (site: string) => {
    setSelectedSites(prev =>
      prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site],
    );
  };

  const canProceed = () => {
    if (step === 1) return !!detectionMethod;
    if (step === 2) return detectedDate.match(/^\d{4}-\d{2}-\d{2}$/);
    if (step === 3) return true;
    if (step === 4) return !!recurrenceType;
    if (step === 5) return confirmedByBiopsy !== null;
    return false;
  };

  const handleSubmit = async () => {
    try {
      await reportRecurrence({
        variables: {
          input: {
            detectedDate,
            detectionMethod,
            recurrenceType: recurrenceType !== 'unknown' ? recurrenceType : null,
            recurrenceSites: selectedSites,
            confirmedByBiopsy: confirmedByBiopsy ?? false,
            newStage: newStage || null,
          },
        },
      });
      router.push('/survive/recurrence');
    } catch {
      // Error handled by Apollo
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
          Step {step} of 5
        </Text>
        <View sx={{
          mt: '$2', height: 4, backgroundColor: '$border', borderRadius: 2,
        }}>
          <View sx={{
            height: 4, backgroundColor: 'blue600', borderRadius: 2,
            width: `${(step / 5) * 100}%` as any,
          }} />
        </View>

        {step === 1 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              What happened?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              We're here with you. Take your time.
            </Text>
            <View sx={{ mt: '$6', gap: '$3' }}>
              {DETECTION_METHODS.map(m => (
                <Pressable key={m.value} onPress={() => setDetectionMethod(m.value)}>
                  <View sx={{
                    borderRadius: 12, borderWidth: 2, p: '$4',
                    borderColor: detectionMethod === m.value ? 'blue600' : '$border',
                    backgroundColor: detectionMethod === m.value ? '#EFF6FF' : undefined,
                  }}>
                    <Text sx={{
                      fontSize: 15, fontWeight: '500',
                      color: detectionMethod === m.value ? 'blue600' : '$foreground',
                    }}>
                      {m.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              When did you find out?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              An approximate date is fine.
            </Text>
            <TextInput
              value={detectedDate}
              onChangeText={setDetectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={{
                marginTop: 24, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
                padding: 16, fontSize: 18, color: '#111827',
              }}
            />
          </View>
        )}

        {step === 3 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Where in your body?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Select all that apply, or skip if you don't know yet.
            </Text>
            <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
              {RECURRENCE_SITES.map(site => (
                <Pressable key={site} onPress={() => toggleSite(site)}>
                  <View sx={{
                    borderRadius: 10, borderWidth: 2, px: '$4', py: '$3',
                    borderColor: selectedSites.includes(site) ? 'blue600' : '$border',
                    backgroundColor: selectedSites.includes(site) ? '#EFF6FF' : undefined,
                  }}>
                    <Text sx={{
                      fontSize: 14, fontWeight: '500',
                      color: selectedSites.includes(site) ? 'blue600' : '$foreground',
                    }}>
                      {site}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              What type?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              Your oncologist may have described the recurrence as one of these.
            </Text>
            <View sx={{ mt: '$6', gap: '$3' }}>
              {RECURRENCE_TYPES.map(t => (
                <Pressable key={t.value} onPress={() => setRecurrenceType(t.value)}>
                  <View sx={{
                    borderRadius: 12, borderWidth: 2, p: '$4',
                    borderColor: recurrenceType === t.value ? 'blue600' : '$border',
                    backgroundColor: recurrenceType === t.value ? '#EFF6FF' : undefined,
                  }}>
                    <Text sx={{
                      fontSize: 15, fontWeight: '500',
                      color: recurrenceType === t.value ? 'blue600' : '$foreground',
                    }}>
                      {t.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              Has it been confirmed by biopsy?
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
              A tissue biopsy of the recurrent tumor.
            </Text>
            <View sx={{ mt: '$6', gap: '$3' }}>
              {[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
                { label: 'Not yet / Waiting for results', value: false },
              ].map((opt, i) => (
                <Pressable key={i} onPress={() => setConfirmedByBiopsy(opt.value)}>
                  <View sx={{
                    borderRadius: 12, borderWidth: 2, p: '$4',
                    borderColor: confirmedByBiopsy === opt.value && (i === 0 ? confirmedByBiopsy : !confirmedByBiopsy) ? 'blue600' : '$border',
                    backgroundColor: confirmedByBiopsy === opt.value && (i === 0 ? confirmedByBiopsy : !confirmedByBiopsy) ? '#EFF6FF' : undefined,
                  }}>
                    <Text sx={{ fontSize: 15, fontWeight: '500', color: '$foreground' }}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Navigation */}
        <View sx={{ mt: '$8', flexDirection: 'row', gap: '$3' }}>
          {step > 1 && (
            <Pressable onPress={() => setStep(step - 1)}>
              <View sx={{
                borderRadius: 8, borderWidth: 1, borderColor: '$border',
                px: '$6', py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>Back</Text>
              </View>
            </Pressable>
          )}

          {step < 5 ? (
            <Pressable onPress={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}>
              <View sx={{
                borderRadius: 8, px: '$6', py: '$3',
                backgroundColor: canProceed() ? 'blue600' : '#D1D5DB',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {step === 3 ? (selectedSites.length > 0 ? 'Continue' : 'Skip') : 'Continue'}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable onPress={handleSubmit} disabled={loading || !canProceed()}>
              <View sx={{
                borderRadius: 8, px: '$6', py: '$3',
                backgroundColor: loading ? '#D1D5DB' : 'blue600',
                flexDirection: 'row', alignItems: 'center', gap: '$2',
              }}>
                {loading && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {loading ? 'Submitting...' : 'Submit'}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
