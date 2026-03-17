import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'solito/router';
import { Picker } from '../components/Picker';
import { useCompleteTreatmentMutation } from '../generated/graphql';

const COMPLETION_TYPES = [
  { label: 'Curative intent — finished active treatment', value: 'curative_intent' },
  { label: 'Ongoing maintenance therapy', value: 'ongoing_maintenance' },
  { label: 'Palliative — focusing on quality of life', value: 'palliative' },
];

const ONGOING_THERAPIES = [
  'Tamoxifen',
  'Letrozole',
  'Anastrozole',
  'Trastuzumab',
  'Pembrolizumab',
  'Other',
];

export function TreatmentCompleteScreen() {
  const router = useRouter();
  const [completionDate, setCompletionDate] = useState('');
  const [completionType, setCompletionType] = useState('curative_intent');
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([]);
  const [newSymptoms, setNewSymptoms] = useState('');
  const [wantsReminders, setWantsReminders] = useState(true);

  const [completeTreatment, { loading, error }] = useCompleteTreatmentMutation();

  const toggleTherapy = (therapy: string) => {
    setSelectedTherapies(prev =>
      prev.includes(therapy) ? prev.filter(t => t !== therapy) : [...prev, therapy]
    );
  };

  const canSubmit = completionDate.match(/^\d{4}-\d{2}-\d{2}$/) && completionType;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await completeTreatment({
        variables: {
          input: {
            completionDate,
            completionType,
            ongoingTherapies: selectedTherapies,
            newSymptoms: newSymptoms || null,
            wantsReminders,
          },
        },
      });
      router.push('/survive/plan');
    } catch {
      // error is shown via the error state
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Treatment Complete
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Congratulations on reaching this milestone. Let's set up your survivorship care plan.
        </Text>

        <View sx={{ mt: '$8', gap: '$6' }}>
          {/* Step 1: Completion date */}
          <View>
            <Text sx={{ fontWeight: '600', color: '$foreground', mb: '$2' }}>
              When did you complete treatment?
            </Text>
            <TextInput
              value={completionDate}
              onChangeText={setCompletionDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#111827',
              }}
            />
            <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>
              Enter as YYYY-MM-DD (e.g. 2025-12-15)
            </Text>
          </View>

          {/* Step 2: Completion type */}
          <View>
            <Text sx={{ fontWeight: '600', color: '$foreground', mb: '$2' }}>
              Type of completion
            </Text>
            <Picker
              value={completionType}
              onValueChange={setCompletionType}
              options={COMPLETION_TYPES}
            />
          </View>

          {/* Step 3: Ongoing therapies */}
          <View>
            <Text sx={{ fontWeight: '600', color: '$foreground', mb: '$2' }}>
              Any ongoing therapies?
            </Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$3' }}>
              Select all that apply
            </Text>
            <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
              {ONGOING_THERAPIES.map(therapy => {
                const selected = selectedTherapies.includes(therapy);
                return (
                  <Pressable key={therapy} onPress={() => toggleTherapy(therapy)}>
                    <View sx={{
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: selected ? 'blue600' : '$border',
                      backgroundColor: selected ? '#EFF6FF' : 'transparent',
                      px: '$3',
                      py: '$2',
                    }}>
                      <Text sx={{
                        fontSize: 13,
                        fontWeight: selected ? '600' : '400',
                        color: selected ? 'blue600' : '$foreground',
                      }}>
                        {therapy}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Step 4: New symptoms */}
          <View>
            <Text sx={{ fontWeight: '600', color: '$foreground', mb: '$2' }}>
              Any new symptoms since completing treatment?
            </Text>
            <TextInput
              value={newSymptoms}
              onChangeText={setNewSymptoms}
              placeholder="Optional — describe any new or lingering symptoms"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                color: '#111827',
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Step 5: Reminders */}
          <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View sx={{ flex: 1, mr: '$3' }}>
              <Text sx={{ fontWeight: '600', color: '$foreground' }}>
                Surveillance reminders
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                We'll remind you when check-ups and screenings are due
              </Text>
            </View>
            <Switch
              value={wantsReminders}
              onValueChange={setWantsReminders}
              trackColor={{ true: '#3B82F6', false: '#D1D5DB' }}
            />
          </View>

          {error && (
            <View sx={{ bg: '#FEF2F2', borderRadius: 8, p: '$4' }}>
              <Text sx={{ fontSize: 13, color: '#991B1B' }}>
                Something went wrong generating your plan. Please try again.
              </Text>
            </View>
          )}

          {/* Submit */}
          <Pressable onPress={handleSubmit} disabled={!canSubmit || loading}>
            <View sx={{
              backgroundColor: canSubmit && !loading ? 'blue600' : '#9CA3AF',
              borderRadius: 8,
              px: '$6',
              py: '$4',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '$2',
            }}>
              {loading && <ActivityIndicator size="small" color="white" />}
              <Text sx={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                {loading ? 'Generating your care plan...' : 'Create my survivorship plan'}
              </Text>
            </View>
          </Pressable>

          {loading && (
            <Text sx={{ fontSize: 12, color: '$mutedForeground', textAlign: 'center' }}>
              This may take 15-30 seconds while we analyze your treatment history and generate
              personalized recommendations.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
