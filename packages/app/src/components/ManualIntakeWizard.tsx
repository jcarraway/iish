import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'dripsy';
import type { PatientProfile } from '@oncovax/shared';
import { Picker } from './Picker';

interface Props {
  onComplete: (profile: PatientProfile) => void;
}

const CANCER_TYPES = [
  'Breast', 'Lung (non-small cell)', 'Lung (small cell)', 'Melanoma',
  'Colorectal', 'Pancreatic', 'Ovarian', 'Prostate', 'Bladder',
  'Head and neck', 'Kidney (renal cell)', 'Liver (hepatocellular)',
  'Gastric/Esophageal', 'Endometrial', 'Cervical', 'Other',
];

const STAGES = ['I', 'IA', 'IB', 'II', 'IIA', 'IIB', 'III', 'IIIA', 'IIIB', 'IIIC', 'IV', 'IVA', 'IVB', 'Unknown'];

const TREATMENT_TYPES = [
  'chemotherapy', 'immunotherapy', 'radiation', 'surgery',
  'targeted_therapy', 'hormone_therapy', 'other',
];

const RECEPTOR_OPTIONS = [
  { value: '', label: 'Unknown' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
];

const HER2_OPTIONS = [
  { value: '', label: 'Unknown' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'equivocal', label: 'Equivocal' },
];

const ECOG_OPTIONS = [
  { value: '', label: 'Unknown' },
  { value: '0', label: '0 \u2014 Fully active' },
  { value: '1', label: '1 \u2014 Restricted but ambulatory' },
  { value: '2', label: '2 \u2014 Ambulatory, capable of self-care' },
  { value: '3', label: '3 \u2014 Limited self-care, confined 50%+ of waking hours' },
  { value: '4', label: '4 \u2014 Completely disabled' },
  { value: '5', label: '5 \u2014 Dead' },
];

const STEPS = ['Cancer basics', 'Biomarkers', 'Treatment history', 'Demographics'];

export function ManualIntakeWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  // Step 0: Cancer basics
  const [cancerType, setCancerType] = useState('');
  const [cancerTypeOther, setCancerTypeOther] = useState('');
  const [stage, setStage] = useState('');

  // Step 1: Biomarkers
  const [erStatus, setErStatus] = useState('');
  const [prStatus, setPrStatus] = useState('');
  const [her2Status, setHer2Status] = useState('');
  const [biomarkerEntries, setBiomarkerEntries] = useState<{ key: string; value: string }[]>([]);

  // Step 2: Treatments
  const [treatments, setTreatments] = useState<
    { name: string; type: string; startDate: string; endDate: string }[]
  >([]);
  const [ecogStatus, setEcogStatus] = useState('');

  // Step 3: Demographics
  const [age, setAge] = useState('');
  const [zipCode, setZipCode] = useState('');

  const isBreastCancer = cancerType.toLowerCase().includes('breast');

  const addTreatment = () => {
    setTreatments([...treatments, { name: '', type: 'chemotherapy', startDate: '', endDate: '' }]);
  };

  const updateTreatment = (i: number, field: string, value: string) => {
    setTreatments(treatments.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  };

  const removeTreatment = (i: number) => {
    setTreatments(treatments.filter((_, idx) => idx !== i));
  };

  const addBiomarker = () => {
    setBiomarkerEntries([...biomarkerEntries, { key: '', value: '' }]);
  };

  const updateBiomarker = (i: number, field: 'key' | 'value', value: string) => {
    setBiomarkerEntries(biomarkerEntries.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));
  };

  const handleComplete = () => {
    const resolvedCancerType = cancerType === 'Other' ? cancerTypeOther : cancerType;
    const profile: PatientProfile = {
      cancerType: resolvedCancerType,
      cancerTypeNormalized: resolvedCancerType.toLowerCase().replace(/\s+\(.*\)/, ''),
      stage: stage || undefined,
      receptorStatus: isBreastCancer
        ? {
            ...(erStatus ? { er: { status: erStatus } } : {}),
            ...(prStatus ? { pr: { status: prStatus } } : {}),
            ...(her2Status ? { her2: { status: her2Status } } : {}),
          }
        : undefined,
      biomarkers:
        biomarkerEntries.length > 0
          ? Object.fromEntries(
              biomarkerEntries.filter((b) => b.key && b.value).map((b) => [b.key, b.value]),
            )
          : undefined,
      priorTreatments:
        treatments.length > 0
          ? treatments
              .filter((t) => t.name)
              .map((t) => ({
                name: t.name,
                type: t.type,
                ...(t.startDate ? { startDate: t.startDate } : {}),
                ...(t.endDate ? { endDate: t.endDate } : {}),
              }))
          : undefined,
      ecogStatus: ecogStatus ? parseInt(ecogStatus, 10) : undefined,
      age: age ? parseInt(age, 10) : undefined,
      zipCode: zipCode || undefined,
    };
    onComplete(profile);
  };

  const canAdvance = () => {
    if (step === 0) return cancerType !== '' && (cancerType !== 'Other' || cancerTypeOther !== '');
    return true;
  };

  return (
    <View sx={{ gap: '$6' }}>
      {/* Step indicator */}
      <View sx={{ flexDirection: 'row', gap: '$1' }}>
        {STEPS.map((label, i) => (
          <View key={label} sx={{ flex: 1 }}>
            <View
              sx={{
                height: 6,
                borderRadius: '$full',
                bg: i <= step ? 'blue600' : 'gray200',
              }}
            />
            <Text
              sx={{
                mt: '$1',
                fontSize: '$xs',
                fontWeight: i === step ? '500' : '400',
                color: i === step ? 'blue600' : 'gray400',
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Step 0: Cancer basics */}
      {step === 0 && (
        <View sx={{ gap: '$4' }}>
          <View>
            <Text sx={{ mb: '$1', fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
              Cancer type
            </Text>
            <Picker
              value={cancerType}
              onValueChange={setCancerType}
              options={CANCER_TYPES.map((t) => ({ label: t, value: t }))}
              placeholder="Select cancer type..."
            />
            {cancerType === 'Other' && (
              <TextInput
                value={cancerTypeOther}
                onChangeText={setCancerTypeOther}
                placeholder="Enter cancer type..."
                sx={{
                  mt: '$2',
                  width: '100%',
                  borderRadius: '$lg',
                  borderWidth: 1,
                  borderColor: 'gray300',
                  px: '$3',
                  py: '$2',
                  fontSize: '$sm',
                }}
              />
            )}
          </View>
          <View>
            <Text sx={{ mb: '$1', fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
              Stage
            </Text>
            <Picker
              value={stage}
              onValueChange={setStage}
              options={STAGES.map((s) => ({ label: s, value: s }))}
              placeholder="Select stage..."
            />
          </View>
        </View>
      )}

      {/* Step 1: Biomarkers */}
      {step === 1 && (
        <View sx={{ gap: '$4' }}>
          {isBreastCancer && (
            <>
              <Text sx={{ fontSize: '$sm', color: 'gray600' }}>
                Receptor status for breast cancer:
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$3' }}>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ mb: '$1', fontSize: '$xs', fontWeight: '500', color: 'gray600' }}>
                    ER
                  </Text>
                  <Picker value={erStatus} onValueChange={setErStatus} options={RECEPTOR_OPTIONS} />
                </View>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ mb: '$1', fontSize: '$xs', fontWeight: '500', color: 'gray600' }}>
                    PR
                  </Text>
                  <Picker value={prStatus} onValueChange={setPrStatus} options={RECEPTOR_OPTIONS} />
                </View>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ mb: '$1', fontSize: '$xs', fontWeight: '500', color: 'gray600' }}>
                    HER2
                  </Text>
                  <Picker
                    value={her2Status}
                    onValueChange={setHer2Status}
                    options={HER2_OPTIONS}
                  />
                </View>
              </View>
            </>
          )}

          <View>
            <Text sx={{ mb: '$2', fontSize: '$sm', color: 'gray600' }}>
              Other biomarkers{isBreastCancer ? '' : ' (e.g., PD-L1, KRAS, EGFR, MSI)'}:
            </Text>
            {biomarkerEntries.map((b, i) => (
              <View key={i} sx={{ mb: '$2', flexDirection: 'row', gap: '$2', alignItems: 'center' }}>
                <TextInput
                  placeholder="Biomarker name"
                  value={b.key}
                  onChangeText={(v) => updateBiomarker(i, 'key', v)}
                  sx={{
                    flex: 1,
                    borderRadius: '$lg',
                    borderWidth: 1,
                    borderColor: 'gray300',
                    px: '$3',
                    py: 6,
                    fontSize: '$sm',
                  }}
                />
                <TextInput
                  placeholder="Value/Status"
                  value={b.value}
                  onChangeText={(v) => updateBiomarker(i, 'value', v)}
                  sx={{
                    flex: 1,
                    borderRadius: '$lg',
                    borderWidth: 1,
                    borderColor: 'gray300',
                    px: '$3',
                    py: 6,
                    fontSize: '$sm',
                  }}
                />
                <Pressable
                  onPress={() =>
                    setBiomarkerEntries(biomarkerEntries.filter((_, idx) => idx !== i))
                  }
                >
                  <Text sx={{ fontSize: '$sm', color: 'red500' }}>Remove</Text>
                </Pressable>
              </View>
            ))}
            <Pressable onPress={addBiomarker}>
              <Text sx={{ fontSize: '$sm', color: 'blue600' }}>+ Add biomarker</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 2: Treatment history */}
      {step === 2 && (
        <View sx={{ gap: '$4' }}>
          <Text sx={{ fontSize: '$sm', color: 'gray600' }}>List any prior treatments:</Text>
          {treatments.map((t, i) => (
            <View
              key={i}
              sx={{
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray200',
                p: '$3',
                gap: '$2',
              }}
            >
              <View
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray500' }}>
                  Treatment {i + 1}
                </Text>
                <Pressable onPress={() => removeTreatment(i)}>
                  <Text sx={{ fontSize: '$xs', color: 'red500' }}>Remove</Text>
                </Pressable>
              </View>
              <TextInput
                placeholder="Treatment name (e.g., Pembrolizumab)"
                value={t.name}
                onChangeText={(v) => updateTreatment(i, 'name', v)}
                sx={{
                  width: '100%',
                  borderRadius: '$lg',
                  borderWidth: 1,
                  borderColor: 'gray300',
                  px: '$3',
                  py: 6,
                  fontSize: '$sm',
                }}
              />
              <Picker
                value={t.type}
                onValueChange={(v) => updateTreatment(i, 'type', v)}
                options={TREATMENT_TYPES.map((tt) => ({
                  label: tt.replace('_', ' '),
                  value: tt,
                }))}
              />
              <View sx={{ flexDirection: 'row', gap: '$2' }}>
                <TextInput
                  placeholder="Start date (YYYY-MM-DD)"
                  value={t.startDate}
                  onChangeText={(v) => updateTreatment(i, 'startDate', v)}
                  sx={{
                    flex: 1,
                    borderRadius: '$lg',
                    borderWidth: 1,
                    borderColor: 'gray300',
                    px: '$3',
                    py: 6,
                    fontSize: '$sm',
                  }}
                />
                <TextInput
                  placeholder="End date (YYYY-MM-DD)"
                  value={t.endDate}
                  onChangeText={(v) => updateTreatment(i, 'endDate', v)}
                  sx={{
                    flex: 1,
                    borderRadius: '$lg',
                    borderWidth: 1,
                    borderColor: 'gray300',
                    px: '$3',
                    py: 6,
                    fontSize: '$sm',
                  }}
                />
              </View>
            </View>
          ))}
          <Pressable onPress={addTreatment}>
            <Text sx={{ fontSize: '$sm', color: 'blue600' }}>+ Add treatment</Text>
          </Pressable>

          <View>
            <Text sx={{ mb: '$1', fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
              ECOG Performance Status
            </Text>
            <Picker
              value={ecogStatus}
              onValueChange={setEcogStatus}
              options={ECOG_OPTIONS}
              placeholder="Unknown"
            />
          </View>
        </View>
      )}

      {/* Step 3: Demographics */}
      {step === 3 && (
        <View sx={{ gap: '$4' }}>
          <View>
            <Text sx={{ mb: '$1', fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Your age"
              keyboardType="number-pad"
              sx={{
                width: '100%',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray300',
                px: '$3',
                py: '$2',
                fontSize: '$sm',
              }}
            />
          </View>
          <View>
            <Text sx={{ mb: '$1', fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
              Zip code
            </Text>
            <TextInput
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="e.g., 94110"
              maxLength={10}
              sx={{
                width: '100%',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray300',
                px: '$3',
                py: '$2',
                fontSize: '$sm',
              }}
            />
            <Text sx={{ mt: '$1', fontSize: '$xs', color: 'gray400' }}>
              Used to find nearby trial sites
            </Text>
          </View>
        </View>
      )}

      {/* Navigation buttons */}
      <View sx={{ flexDirection: 'row', gap: '$3' }}>
        {step > 0 && (
          <Pressable
            onPress={() => setStep(step - 1)}
            sx={{
              borderRadius: '$lg',
              borderWidth: 1,
              borderColor: 'gray300',
              px: '$6',
              py: 10,
            }}
          >
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>Back</Text>
          </Pressable>
        )}
        {step < STEPS.length - 1 ? (
          <Pressable
            onPress={() => canAdvance() && setStep(step + 1)}
            disabled={!canAdvance()}
            sx={{
              flex: 1,
              borderRadius: '$lg',
              bg: canAdvance() ? 'blue600' : 'gray300',
              px: '$6',
              py: 10,
              alignItems: 'center',
            }}
          >
            <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleComplete}
            sx={{
              flex: 1,
              borderRadius: '$lg',
              bg: 'blue600',
              px: '$6',
              py: 10,
              alignItems: 'center',
            }}
          >
            <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
              Continue to review
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
