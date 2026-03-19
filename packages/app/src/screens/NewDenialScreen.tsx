import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import {
  useCreateInsuranceDenialMutation,
  GetInsuranceDenialsDocument,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

// ============================================================================
// Constants
// ============================================================================

const SERVICE_CATEGORY_OPTIONS = [
  { label: 'Select category', value: '' },
  { label: 'Genomic Testing', value: 'genomic_testing' },
  { label: 'Clinical Trial', value: 'clinical_trial' },
  { label: 'Fertility Preservation', value: 'fertility_preservation' },
  { label: 'Imaging', value: 'imaging' },
  { label: 'Medication', value: 'medication' },
  { label: 'Surgery', value: 'surgery' },
  { label: 'Other', value: 'other' },
];

const PLAN_TYPE_OPTIONS = [
  { label: 'Select plan type', value: '' },
  { label: 'Employer-sponsored', value: 'employer' },
  { label: 'Marketplace (ACA)', value: 'marketplace' },
  { label: 'Medicaid', value: 'medicaid' },
  { label: 'Medicare', value: 'medicare' },
  { label: 'Other', value: 'other' },
];

const DENIAL_CATEGORY_OPTIONS = [
  { label: 'Select denial reason', value: '' },
  { label: 'Medical Necessity', value: 'medical_necessity' },
  { label: 'Experimental / Investigational', value: 'experimental' },
  { label: 'Not Covered by Plan', value: 'not_covered' },
];

// ============================================================================
// Component
// ============================================================================

export function NewDenialScreen() {
  const router = useRouter();

  const [deniedService, setDeniedService] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [denialDate, setDenialDate] = useState('');
  const [insurerName, setInsurerName] = useState('');
  const [planType, setPlanType] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [denialCategory, setDenialCategory] = useState('');

  const [createDenial, { loading }] = useCreateInsuranceDenialMutation({
    refetchQueries: [{ query: GetInsuranceDenialsDocument }],
  });

  const isValid =
    deniedService.trim() &&
    serviceCategory &&
    denialDate.match(/^\d{4}-\d{2}-\d{2}$/) &&
    insurerName.trim() &&
    denialReason.trim() &&
    denialCategory;

  // Auto-calculate appeal deadline: denial date + 180 days
  const appealDeadline = (() => {
    if (!denialDate.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
    const date = new Date(denialDate);
    if (isNaN(date.getTime())) return null;
    date.setDate(date.getDate() + 180);
    return date.toLocaleDateString();
  })();

  async function handleSubmit() {
    if (!isValid) return;
    try {
      const result = await createDenial({
        variables: {
          input: {
            deniedService: deniedService.trim(),
            serviceCategory,
            denialDate,
            insurerName: insurerName.trim(),
            planType: planType || undefined,
            claimNumber: claimNumber.trim() || undefined,
            denialReason: denialReason.trim(),
            denialCategory,
          },
        },
      });
      const id = result.data?.createInsuranceDenial.id;
      if (id) {
        router.push(`/advocate/appeal/${id}`);
      }
    } catch {
      // Error handled by Apollo
    }
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Report a Denial
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Tell us what was denied and we'll help you build an appeal
        </Text>

        <View sx={{ mt: '$8', gap: '$5' }}>
          {/* Denied Service */}
          <FormField label="What was denied? *">
            <TextInput
              value={deniedService}
              onChangeText={setDeniedService}
              placeholder="e.g., Oncotype DX genomic testing, Keytruda, fertility preservation"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />
          </FormField>

          {/* Service Category */}
          <FormField label="Category *">
            <Picker
              value={serviceCategory}
              onValueChange={setServiceCategory}
              options={SERVICE_CATEGORY_OPTIONS}
            />
          </FormField>

          {/* Denial Date */}
          <FormField label="Date of denial *">
            <TextInput
              value={denialDate}
              onChangeText={setDenialDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />
            {appealDeadline && (
              <View sx={{
                mt: '$2',
                backgroundColor: '#DBEAFE',
                borderRadius: 8,
                px: '$3',
                py: '$2',
              }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>
                  Estimated appeal deadline: {appealDeadline}
                </Text>
                <Text sx={{ fontSize: 11, color: '#1E3A8A', mt: 2 }}>
                  Most plans allow 180 days for internal appeals under the ACA
                </Text>
              </View>
            )}
          </FormField>

          {/* Insurer Name */}
          <FormField label="Insurance company *">
            <TextInput
              value={insurerName}
              onChangeText={setInsurerName}
              placeholder="e.g., UnitedHealthcare, Aetna, Blue Cross Blue Shield"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />
          </FormField>

          {/* Plan Type */}
          <FormField label="Plan type">
            <Picker
              value={planType}
              onValueChange={setPlanType}
              options={PLAN_TYPE_OPTIONS}
            />
            <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>
              Plan type affects which appeal rights and regulations apply
            </Text>
          </FormField>

          {/* Claim Number */}
          <FormField label="Claim number (optional)">
            <TextInput
              value={claimNumber}
              onChangeText={setClaimNumber}
              placeholder="Found on your Explanation of Benefits (EOB)"
              placeholderTextColor="#9CA3AF"
              style={inputStyle}
            />
          </FormField>

          {/* Denial Reason */}
          <FormField label="Why was it denied? *">
            <TextInput
              value={denialReason}
              onChangeText={setDenialReason}
              placeholder="Copy the reason from your denial letter, or describe in your own words"
              placeholderTextColor="#9CA3AF"
              style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
              multiline
              numberOfLines={3}
            />
          </FormField>

          {/* Denial Category */}
          <FormField label="Denial category *">
            <Picker
              value={denialCategory}
              onValueChange={setDenialCategory}
              options={DENIAL_CATEGORY_OPTIONS}
            />
            <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>
              This determines the appeal strategy we'll recommend
            </Text>
          </FormField>

          {/* Submit */}
          <Pressable onPress={handleSubmit} disabled={loading || !isValid}>
            <View sx={{
              mt: '$2',
              backgroundColor: isValid ? 'blue600' : '#D1D5DB',
              borderRadius: 8,
              py: '$3',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: '$2',
            }}>
              {loading && <ActivityIndicator size="small" color="white" />}
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                {loading ? 'Submitting...' : 'Submit Denial Report'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Info card */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#0C4A6E' }}>
            What happens next?
          </Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20 }}>
              {'\u2022'} We'll analyze your denial and recommend an appeal strategy
            </Text>
            <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20 }}>
              {'\u2022'} Our AI will generate a personalized appeal letter using clinical guidelines
            </Text>
            <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20 }}>
              {'\u2022'} Your physician reviews and signs the letter
            </Text>
            <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20 }}>
              {'\u2022'} We'll guide you through submission and track the outcome
            </Text>
          </View>
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

const inputStyle = {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  padding: 12,
  fontSize: 15,
  color: '#111827',
} as const;
