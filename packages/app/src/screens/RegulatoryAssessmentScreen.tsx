import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'solito/router';
import { Picker } from '../components';
import {
  useGetPatientQuery,
  useGetPipelineJobsQuery,
  useAssessRegulatoryPathwayMutation,
} from '../generated/graphql';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

export function RegulatoryAssessmentScreen() {
  const router = useRouter();
  const { data: patientData } = useGetPatientQuery();
  const { data: jobData } = useGetPipelineJobsQuery();
  const [assess, { loading: submitting }] = useAssessRegulatoryPathwayMutation();

  const [cancerType, setCancerType] = useState('');
  const [cancerStage, setCancerStage] = useState('');
  const [priorTreatmentsFailed, setPriorTreatmentsFailed] = useState('0');
  const [isLifeThreatening, setIsLifeThreatening] = useState(false);
  const [hasExhaustedOptions, setHasExhaustedOptions] = useState(false);
  const [hasPhysician, setHasPhysician] = useState(false);
  const [physicianName, setPhysicianName] = useState('');
  const [physicianEmail, setPhysicianEmail] = useState('');
  const [physicianInstitution, setPhysicianInstitution] = useState('');
  const [stateOfResidence, setStateOfResidence] = useState('');
  const [error, setError] = useState('');

  // Pre-fill from patient profile
  useEffect(() => {
    const profile = patientData?.patient?.profile;
    if (profile) {
      if (profile.cancerType) setCancerType(profile.cancerType);
      if (profile.stage) setCancerStage(profile.stage);
      if (profile.priorTreatments) setPriorTreatmentsFailed(String(profile.priorTreatments.length));
    }
  }, [patientData]);

  const completedJobs = (jobData?.pipelineJobs ?? []).filter((j) => j.status === 'complete');

  const handleSubmit = async () => {
    if (!cancerType || !cancerStage || !stateOfResidence) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    try {
      const { data } = await assess({
        variables: {
          input: {
            pipelineJobId: completedJobs[0]?.id,
            cancerType,
            cancerStage,
            priorTreatmentsFailed: parseInt(priorTreatmentsFailed) || 0,
            isLifeThreatening,
            hasExhaustedOptions,
            hasPhysician,
            physicianName: hasPhysician ? physicianName : undefined,
            physicianEmail: hasPhysician ? physicianEmail : undefined,
            physicianInstitution: hasPhysician ? physicianInstitution : undefined,
            stateOfResidence,
          },
        },
      });
      if (data?.assessRegulatoryPathway?.id) {
        router.push(`/manufacture/regulatory/recommendation?assessmentId=${data.assessRegulatoryPathway.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Pathway Assessment
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Answer these questions to determine which regulatory pathway may be best for your situation.
        </Text>

        <View sx={{ mt: '$8', gap: 24 }}>
          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>Cancer Type *</Text>
            <TextInput
              value={cancerType}
              onChangeText={setCancerType}
              placeholder="e.g., Breast, Lung, Melanoma"
              style={{ marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }}
            />
          </View>

          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>Stage *</Text>
            <Picker
              value={cancerStage}
              onValueChange={setCancerStage}
              options={[
                { label: 'Select stage...', value: '' },
                { label: 'Stage I', value: 'I' },
                { label: 'Stage II', value: 'II' },
                { label: 'Stage III', value: 'III' },
                { label: 'Stage IV', value: 'IV' },
              ]}
            />
          </View>

          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>
              Prior treatments that failed or were exhausted
            </Text>
            <Picker
              value={priorTreatmentsFailed}
              onValueChange={setPriorTreatmentsFailed}
              options={[
                { label: '0', value: '0' },
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4+', value: '4' },
              ]}
            />
          </View>

          <Pressable onPress={() => setIsLifeThreatening(!isLifeThreatening)}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                sx={{
                  width: 20, height: 20, borderRadius: 4, borderWidth: 1,
                  borderColor: isLifeThreatening ? 'blue600' : 'gray300',
                  bg: isLifeThreatening ? 'blue600' : 'white',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isLifeThreatening && <Text sx={{ color: 'white', fontSize: 12, fontWeight: '700' }}>&#10003;</Text>}
              </View>
              <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                Condition is life-threatening or seriously debilitating
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => setHasExhaustedOptions(!hasExhaustedOptions)}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                sx={{
                  width: 20, height: 20, borderRadius: 4, borderWidth: 1,
                  borderColor: hasExhaustedOptions ? 'blue600' : 'gray300',
                  bg: hasExhaustedOptions ? 'blue600' : 'white',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {hasExhaustedOptions && <Text sx={{ color: 'white', fontSize: 12, fontWeight: '700' }}>&#10003;</Text>}
              </View>
              <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                All approved treatment options have been exhausted
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => setHasPhysician(!hasPhysician)}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                sx={{
                  width: 20, height: 20, borderRadius: 4, borderWidth: 1,
                  borderColor: hasPhysician ? 'blue600' : 'gray300',
                  bg: hasPhysician ? 'blue600' : 'white',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {hasPhysician && <Text sx={{ color: 'white', fontSize: 12, fontWeight: '700' }}>&#10003;</Text>}
              </View>
              <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                I have a physician willing to support this pathway
              </Text>
            </View>
          </Pressable>

          {hasPhysician && (
            <View sx={{ pl: '$8', gap: 16 }}>
              <TextInput
                value={physicianName}
                onChangeText={setPhysicianName}
                placeholder="Physician name"
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }}
              />
              <TextInput
                value={physicianEmail}
                onChangeText={setPhysicianEmail}
                placeholder="Physician email"
                keyboardType="email-address"
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }}
              />
              <TextInput
                value={physicianInstitution}
                onChangeText={setPhysicianInstitution}
                placeholder="Institution"
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }}
              />
            </View>
          )}

          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>
              State of Residence *
            </Text>
            <Picker
              value={stateOfResidence}
              onValueChange={setStateOfResidence}
              options={[
                { label: 'Select state...', value: '' },
                ...US_STATES.map((s) => ({ label: s, value: s })),
              ]}
            />
          </View>

          {error ? <Text sx={{ fontSize: '$sm', color: 'red600' }}>{error}</Text> : null}

          <Pressable onPress={handleSubmit} disabled={submitting}>
            <View sx={{ bg: 'purple600', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center', opacity: submitting ? 0.5 : 1 }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
                {submitting ? 'Assessing...' : 'Get Recommendation'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
