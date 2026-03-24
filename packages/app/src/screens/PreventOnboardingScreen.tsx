import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { useCreatePreventProfileMutation } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const STEPS = [
  { key: 'demographics', label: 'Demographics', number: 1 },
  { key: 'reproductive', label: 'Reproductive History', number: 2 },
  { key: 'family', label: 'Family History', number: 3 },
  { key: 'personal', label: 'Personal History', number: 4 },
  { key: 'lifestyle', label: 'Lifestyle', number: 5 },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const ETHNICITY_OPTIONS = [
  { value: 'white', label: 'White / Caucasian' },
  { value: 'black', label: 'Black / African American' },
  { value: 'hispanic', label: 'Hispanic / Latina' },
  { value: 'asian', label: 'Asian / Pacific Islander' },
  { value: 'other', label: 'Other / Prefer not to say' },
];

const MENOPAUSAL_OPTIONS = [
  { value: 'premenopausal', label: 'Pre-menopausal' },
  { value: 'perimenopausal', label: 'Peri-menopausal' },
  { value: 'postmenopausal', label: 'Post-menopausal' },
  { value: 'unknown', label: 'Not sure' },
];

const DENSITY_OPTIONS = [
  { value: 'almost_entirely_fatty', label: 'Almost entirely fatty (A)' },
  { value: 'scattered_fibroglandular', label: 'Scattered fibroglandular (B)' },
  { value: 'heterogeneously_dense', label: 'Heterogeneously dense (C)' },
  { value: 'extremely_dense', label: 'Extremely dense (D)' },
  { value: 'unknown', label: "I don't know" },
];

const SMOKING_OPTIONS = [
  { value: 'never', label: 'Never smoked' },
  { value: 'former', label: 'Former smoker' },
  { value: 'current', label: 'Current smoker' },
];

// ============================================================================
// Component
// ============================================================================

export function PreventOnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [createProfile, { loading }] = useCreatePreventProfileMutation();

  const currentStep = STEPS[step];

  const update = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canAdvance = () => {
    switch (currentStep.key) {
      case 'demographics':
        return formData.ethnicity;
      case 'reproductive':
        return formData.ageAtMenarche != null;
      case 'family':
        return true; // optional
      case 'personal':
        return true; // optional
      case 'lifestyle':
        return true; // optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const input = {
        ageAtMenarche: formData.ageAtMenarche != null ? Number(formData.ageAtMenarche) : null,
        pregnancies: formData.pregnancies != null ? Number(formData.pregnancies) : null,
        ageAtFirstLiveBirth: formData.ageAtFirstLiveBirth != null ? Number(formData.ageAtFirstLiveBirth) : null,
        breastfeedingMonths: formData.breastfeedingMonths != null ? Number(formData.breastfeedingMonths) : null,
        menopausalStatus: formData.menopausalStatus ?? null,
        ageAtMenopause: formData.ageAtMenopause != null ? Number(formData.ageAtMenopause) : null,
        ocEver: formData.ocEver ?? null,
        ocCurrent: formData.ocCurrent ?? null,
        ocTotalYears: formData.ocTotalYears != null ? Number(formData.ocTotalYears) : null,
        hrtEver: formData.hrtEver ?? null,
        hrtCurrent: formData.hrtCurrent ?? null,
        hrtType: formData.hrtType ?? null,
        hrtTotalYears: formData.hrtTotalYears != null ? Number(formData.hrtTotalYears) : null,
        previousBiopsies: formData.previousBiopsies != null ? Number(formData.previousBiopsies) : null,
        atypicalHyperplasia: formData.atypicalHyperplasia ?? null,
        lcis: formData.lcis ?? null,
        chestRadiation: formData.chestRadiation ?? null,
        breastDensity: formData.breastDensity ?? null,
        bmi: formData.bmi != null ? Number(formData.bmi) : null,
        alcoholDrinksPerWeek: formData.alcoholDrinksPerWeek != null ? Number(formData.alcoholDrinksPerWeek) : null,
        exerciseMinutesPerWeek: formData.exerciseMinutesPerWeek != null ? Number(formData.exerciseMinutesPerWeek) : null,
        smokingStatus: formData.smokingStatus ?? null,
        familyHistory: formData.familyHistory ?? null,
        ethnicity: formData.ethnicity ?? null,
      };
      await createProfile({ variables: { input } });
      router.push('/prevent/risk');
    } catch {
      // handled by Apollo error policy
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Risk Assessment Onboarding
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Answer a few questions to calculate your personalized breast cancer risk estimate
        </Text>

        {/* Progress Bar */}
        <View sx={{ mt: '$6', flexDirection: 'row', gap: '$2' }}>
          {STEPS.map((s, i) => (
            <View
              key={s.key}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= step ? 'blue600' : '$border',
              }}
            />
          ))}
        </View>
        <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
          Step {step + 1} of {STEPS.length}: {currentStep.label}
        </Text>

        {/* Step Content */}
        <View sx={{ mt: '$6' }}>
          {currentStep.key === 'demographics' && (
            <DemographicsStep formData={formData} update={update} />
          )}
          {currentStep.key === 'reproductive' && (
            <ReproductiveStep formData={formData} update={update} />
          )}
          {currentStep.key === 'family' && (
            <FamilyStep formData={formData} update={update} />
          )}
          {currentStep.key === 'personal' && (
            <PersonalStep formData={formData} update={update} />
          )}
          {currentStep.key === 'lifestyle' && (
            <LifestyleStep formData={formData} update={update} />
          )}
        </View>

        {/* Navigation */}
        <View sx={{ mt: '$8', flexDirection: 'row', gap: '$3' }}>
          {step > 0 && (
            <Pressable onPress={() => setStep(step - 1)}>
              <View
                sx={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '$border',
                  px: '$6',
                  py: '$3',
                }}
              >
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>Back</Text>
              </View>
            </Pressable>
          )}
          <View sx={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <Pressable onPress={() => setStep(step + 1)} disabled={!canAdvance()}>
              <View
                sx={{
                  backgroundColor: canAdvance() ? 'blue600' : '#CBD5E1',
                  borderRadius: 8,
                  px: '$6',
                  py: '$3',
                }}
              >
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Continue</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable onPress={handleSubmit} disabled={loading}>
              <View
                sx={{
                  backgroundColor: 'blue600',
                  borderRadius: 8,
                  px: '$6',
                  py: '$3',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '$2',
                }}
              >
                {loading && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {loading ? 'Calculating...' : 'Calculate Risk'}
                </Text>
              </View>
            </Pressable>
          )}
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
            This tool uses the Gail model (NCI BCRAT) to estimate breast cancer risk. It is a
            screening tool, not a diagnosis. Results should be discussed with your healthcare
            provider. The model has limitations and may not accurately reflect risk for all
            populations.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Step Components
// ============================================================================

function DemographicsStep({ formData, update }: { formData: any; update: (k: string, v: any) => void }) {
  return (
    <View sx={{ gap: '$5' }}>
      <FieldLabel label="Ethnicity" required />
      <OptionPills
        options={ETHNICITY_OPTIONS}
        selected={formData.ethnicity}
        onSelect={(v) => update('ethnicity', v)}
      />
    </View>
  );
}

function ReproductiveStep({ formData, update }: { formData: any; update: (k: string, v: any) => void }) {
  return (
    <View sx={{ gap: '$5' }}>
      <View>
        <FieldLabel label="Age at first menstrual period" required />
        <NumberInput value={formData.ageAtMenarche} onChange={(v) => update('ageAtMenarche', v)} min={8} max={20} />
      </View>

      <View>
        <FieldLabel label="Number of pregnancies" />
        <NumberInput value={formData.pregnancies} onChange={(v) => update('pregnancies', v)} min={0} max={15} />
      </View>

      {(formData.pregnancies ?? 0) > 0 && (
        <View>
          <FieldLabel label="Age at first live birth" />
          <NumberInput value={formData.ageAtFirstLiveBirth} onChange={(v) => update('ageAtFirstLiveBirth', v)} min={12} max={50} />
        </View>
      )}

      <View>
        <FieldLabel label="Months of breastfeeding (total)" />
        <NumberInput value={formData.breastfeedingMonths} onChange={(v) => update('breastfeedingMonths', v)} min={0} max={120} />
      </View>

      <View>
        <FieldLabel label="Menopausal status" />
        <OptionPills
          options={MENOPAUSAL_OPTIONS}
          selected={formData.menopausalStatus}
          onSelect={(v) => update('menopausalStatus', v)}
        />
      </View>

      {formData.menopausalStatus === 'postmenopausal' && (
        <View>
          <FieldLabel label="Age at menopause" />
          <NumberInput value={formData.ageAtMenopause} onChange={(v) => update('ageAtMenopause', v)} min={30} max={65} />
        </View>
      )}

      <View>
        <FieldLabel label="Ever used oral contraceptives?" />
        <BooleanPills value={formData.ocEver} onChange={(v) => update('ocEver', v)} />
      </View>

      <View>
        <FieldLabel label="Ever used hormone replacement therapy (HRT)?" />
        <BooleanPills value={formData.hrtEver} onChange={(v) => update('hrtEver', v)} />
      </View>

      {formData.hrtEver && (
        <View>
          <FieldLabel label="Currently using HRT?" />
          <BooleanPills value={formData.hrtCurrent} onChange={(v) => update('hrtCurrent', v)} />
        </View>
      )}
    </View>
  );
}

function FamilyStep({ formData, update }: { formData: any; update: (k: string, v: any) => void }) {
  const fh = formData.familyHistory ?? { firstDegreeCount: 0, secondDegreeCount: 0, details: [] };

  const updateFH = (key: string, val: any) => {
    const updated = { ...fh, [key]: val };
    update('familyHistory', updated);
  };

  return (
    <View sx={{ gap: '$5' }}>
      <View
        sx={{
          backgroundColor: '#EFF6FF',
          borderRadius: 12,
          p: '$4',
        }}
      >
        <Text sx={{ fontSize: 14, fontWeight: '600', color: '#1E40AF' }}>
          Why we ask about family history
        </Text>
        <Text sx={{ mt: '$2', fontSize: 13, color: '#1E3A5F', lineHeight: 20 }}>
          Having first-degree relatives (mother, sister, daughter) with breast cancer significantly
          affects your risk estimate. Second-degree relatives (aunts, grandmothers) also contribute.
        </Text>
      </View>

      <View>
        <FieldLabel label="First-degree relatives with breast cancer" />
        <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$2' }}>
          Mother, sisters, daughters
        </Text>
        <NumberInput
          value={fh.firstDegreeCount}
          onChange={(v) => updateFH('firstDegreeCount', v)}
          min={0}
          max={10}
        />
      </View>

      <View>
        <FieldLabel label="Second-degree relatives with breast cancer" />
        <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$2' }}>
          Grandmothers, aunts, half-sisters
        </Text>
        <NumberInput
          value={fh.secondDegreeCount}
          onChange={(v) => updateFH('secondDegreeCount', v)}
          min={0}
          max={10}
        />
      </View>

      <View>
        <FieldLabel label="Any family member with BRCA1/BRCA2 mutation?" />
        <BooleanPills value={fh.knownBrcaMutation} onChange={(v) => updateFH('knownBrcaMutation', v)} />
      </View>
    </View>
  );
}

function PersonalStep({ formData, update }: { formData: any; update: (k: string, v: any) => void }) {
  return (
    <View sx={{ gap: '$5' }}>
      <View>
        <FieldLabel label="Number of previous breast biopsies" />
        <NumberInput value={formData.previousBiopsies} onChange={(v) => update('previousBiopsies', v)} min={0} max={10} />
      </View>

      {(formData.previousBiopsies ?? 0) > 0 && (
        <View>
          <FieldLabel label="Any biopsy showed atypical hyperplasia?" />
          <BooleanPills value={formData.atypicalHyperplasia} onChange={(v) => update('atypicalHyperplasia', v)} />
        </View>
      )}

      <View>
        <FieldLabel label="History of LCIS (lobular carcinoma in situ)?" />
        <BooleanPills value={formData.lcis} onChange={(v) => update('lcis', v)} />
      </View>

      <View>
        <FieldLabel label="Prior chest radiation (e.g., for Hodgkin lymphoma)?" />
        <BooleanPills value={formData.chestRadiation} onChange={(v) => update('chestRadiation', v)} />
      </View>

      <View>
        <FieldLabel label="Breast density (from most recent mammogram)" />
        <OptionPills
          options={DENSITY_OPTIONS}
          selected={formData.breastDensity}
          onSelect={(v) => update('breastDensity', v)}
        />
      </View>
    </View>
  );
}

function LifestyleStep({ formData, update }: { formData: any; update: (k: string, v: any) => void }) {
  return (
    <View sx={{ gap: '$5' }}>
      <View>
        <FieldLabel label="BMI (Body Mass Index)" />
        <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$2' }}>
          Approximate is fine — you can update later
        </Text>
        <NumberInput value={formData.bmi} onChange={(v) => update('bmi', v)} min={15} max={60} decimal />
      </View>

      <View>
        <FieldLabel label="Alcoholic drinks per week" />
        <NumberInput value={formData.alcoholDrinksPerWeek} onChange={(v) => update('alcoholDrinksPerWeek', v)} min={0} max={50} />
      </View>

      <View>
        <FieldLabel label="Exercise (minutes per week)" />
        <NumberInput value={formData.exerciseMinutesPerWeek} onChange={(v) => update('exerciseMinutesPerWeek', v)} min={0} max={600} />
      </View>

      <View>
        <FieldLabel label="Smoking status" />
        <OptionPills
          options={SMOKING_OPTIONS}
          selected={formData.smokingStatus}
          onSelect={(v) => update('smokingStatus', v)}
        />
      </View>
    </View>
  );
}

// ============================================================================
// Shared Form Primitives
// ============================================================================

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', mb: '$2' }}>
      {label}
      {required && <Text sx={{ color: '#DC2626' }}> *</Text>}
    </Text>
  );
}

function OptionPills({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string | undefined;
  onSelect: (v: string) => void;
}) {
  return (
    <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable key={opt.value} onPress={() => onSelect(opt.value)}>
            <View
              sx={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? 'blue600' : '$border',
                backgroundColor: isSelected ? '#DBEAFE' : 'transparent',
                px: '$3',
                py: '$2',
              }}
            >
              <Text
                sx={{
                  fontSize: 13,
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? '#1D4ED8' : '$foreground',
                }}
              >
                {opt.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function BooleanPills({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <View sx={{ flexDirection: 'row', gap: '$2' }}>
      {[
        { v: true, label: 'Yes' },
        { v: false, label: 'No' },
      ].map((opt) => {
        const isSelected = value === opt.v;
        return (
          <Pressable key={String(opt.v)} onPress={() => onChange(opt.v)}>
            <View
              sx={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? 'blue600' : '$border',
                backgroundColor: isSelected ? '#DBEAFE' : 'transparent',
                px: '$4',
                py: '$2',
              }}
            >
              <Text
                sx={{
                  fontSize: 13,
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? '#1D4ED8' : '$foreground',
                }}
              >
                {opt.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  decimal,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  min: number;
  max: number;
  decimal?: boolean;
}) {
  // Simple tappable number buttons for small ranges, text display for large ranges
  const range = max - min;
  if (range <= 20 && !decimal) {
    const nums = [];
    for (let i = min; i <= max; i++) nums.push(i);
    return (
      <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {nums.map((n) => {
          const selected = value === n;
          return (
            <Pressable key={n} onPress={() => onChange(n)}>
              <View
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: selected ? 'blue600' : '$border',
                  backgroundColor: selected ? 'blue600' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  sx={{
                    fontSize: 13,
                    fontWeight: selected ? 'bold' : '400',
                    color: selected ? 'white' : '$foreground',
                  }}
                >
                  {n}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // For larger ranges, show increment/decrement buttons
  const current = value ?? min;
  const step = decimal ? 0.5 : (range > 100 ? 10 : 1);
  return (
    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
      <Pressable onPress={() => onChange(Math.max(min, current - step))}>
        <View
          sx={{
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '$border',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text sx={{ fontSize: 18, color: '$foreground' }}>-</Text>
        </View>
      </Pressable>
      <Text sx={{ fontSize: 18, fontWeight: 'bold', color: '$foreground', minWidth: 50, textAlign: 'center' }}>
        {decimal ? current.toFixed(1) : current}
      </Text>
      <Pressable onPress={() => onChange(Math.min(max, current + step))}>
        <View
          sx={{
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '$border',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text sx={{ fontSize: 18, color: '$foreground' }}>+</Text>
        </View>
      </Pressable>
    </View>
  );
}
