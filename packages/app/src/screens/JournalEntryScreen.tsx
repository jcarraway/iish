import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import {
  useSubmitJournalEntryMutation,
  useGetJournalEntriesQuery,
} from '../generated/graphql';

interface JournalEntryScreenProps {
  date?: string; // YYYY-MM-DD for editing a specific day
}

const ENERGY_LABELS = ['', 'Low', 'Fair', 'OK', 'Good', 'High'];
const PAIN_LABELS = ['None', 'Mild', 'Light', 'Moderate', 'Strong', 'Severe'];
const MOOD_LABELS = ['', 'Low', 'Fair', 'OK', 'Good', 'Great'];
const SLEEP_LABELS = ['', 'Poor', 'Fair', 'OK', 'Good', 'Great'];
const HOT_FLASH_LABELS = ['None', 'Mild', 'Moderate', 'Severe'];
const JOINT_PAIN_LABELS = ['None', 'Mild', 'Moderate', 'Severe'];

export function JournalEntryScreen({ date }: JournalEntryScreenProps) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split('T')[0];
  const entryDate = date || todayStr;

  const { data: existingData, loading: existingLoading } = useGetJournalEntriesQuery({
    variables: { limit: 30 },
    errorPolicy: 'ignore',
  });
  const [submitEntry, { loading: submitting }] = useSubmitJournalEntryMutation();

  const [energy, setEnergy] = useState<number | null>(null);
  const [pain, setPain] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [hotFlashes, setHotFlashes] = useState<number | null>(null);
  const [jointPain, setJointPain] = useState<number | null>(null);
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-fill if editing existing entry
  useEffect(() => {
    if (!existingData?.journalEntries) return;
    const existing = existingData.journalEntries.find(
      (e) => e.entryDate.split('T')[0] === entryDate,
    );
    if (existing) {
      setEnergy(existing.energy ?? null);
      setPain(existing.pain ?? null);
      setMood(existing.mood ?? null);
      setSleepQuality(existing.sleepQuality ?? null);
      setHotFlashes(existing.hotFlashes ?? null);
      setJointPain(existing.jointPain ?? null);
      setExerciseType(existing.exerciseType ?? '');
      setExerciseMinutes(existing.exerciseMinutes?.toString() ?? '');
      setNewSymptoms((existing.newSymptoms ?? []).join(', '));
      setNotes(existing.notes ?? '');
      if (existing.exerciseType || existing.exerciseMinutes || existing.newSymptoms?.length || existing.notes) {
        setShowOptional(true);
      }
    }
  }, [existingData, entryDate]);

  const canSubmit = energy != null && pain != null && mood != null && sleepQuality != null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await submitEntry({
        variables: {
          input: {
            entryDate,
            energy: energy!,
            pain: pain!,
            mood: mood!,
            sleepQuality: sleepQuality!,
            hotFlashes,
            jointPain,
            newSymptoms: newSymptoms.trim() ? newSymptoms.split(',').map((s) => s.trim()).filter(Boolean) : null,
            exerciseType: exerciseType.trim() || null,
            exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes, 10) : null,
            notes: notes.trim() || null,
          },
        },
        refetchQueries: ['GetJournalEntries', 'GetJournalTrends'],
      });
      setSaved(true);
    } catch {}
  };

  if (existingLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (saved) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <Text sx={{ fontSize: 48 }}>{'✓'}</Text>
        <Text sx={{ mt: '$4', fontSize: 22, fontWeight: 'bold', color: '$foreground' }}>Saved</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
          Your journal entry for {formatDate(entryDate)} has been recorded.
        </Text>
        <Pressable onPress={() => router.push('/survive/journal')}>
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: '$border', borderRadius: 8, px: '$6', py: '$3' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>View history</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 26, fontWeight: 'bold', color: '$foreground' }}>
          How are you today?
        </Text>
        <Text sx={{ mt: '$1', fontSize: 14, color: '$mutedForeground' }}>
          {formatDate(entryDate)}
        </Text>

        {/* Core dimensions */}
        <View sx={{ mt: '$8', gap: '$6' }}>
          <RatingRow
            label="Energy"
            sublabel="How's your energy level?"
            min={1}
            max={5}
            labels={ENERGY_LABELS}
            value={energy}
            onChange={setEnergy}
          />
          <RatingRow
            label="Pain"
            sublabel="Any physical discomfort?"
            min={0}
            max={5}
            labels={PAIN_LABELS}
            value={pain}
            onChange={setPain}
          />
          <RatingRow
            label="Mood"
            sublabel="How are you feeling emotionally?"
            min={1}
            max={5}
            labels={MOOD_LABELS}
            value={mood}
            onChange={setMood}
          />
          <RatingRow
            label="Sleep Quality"
            sublabel="How did you sleep?"
            min={1}
            max={5}
            labels={SLEEP_LABELS}
            value={sleepQuality}
            onChange={setSleepQuality}
          />
        </View>

        {/* Conditional: treatment side effects */}
        <View sx={{ mt: '$8', gap: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
            Treatment side effects
          </Text>
          <RatingRow
            label="Hot Flashes"
            min={0}
            max={3}
            labels={HOT_FLASH_LABELS}
            value={hotFlashes}
            onChange={setHotFlashes}
          />
          <RatingRow
            label="Joint Pain"
            min={0}
            max={3}
            labels={JOINT_PAIN_LABELS}
            value={jointPain}
            onChange={setJointPain}
          />
        </View>

        {/* Optional expansion */}
        <Pressable onPress={() => setShowOptional(!showOptional)} sx={{ mt: '$6' }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: 'blue600' }}>
              {showOptional ? 'Hide' : 'Add'} details (exercise, symptoms, notes)
            </Text>
          </View>
        </Pressable>

        {showOptional && (
          <View sx={{ mt: '$4', gap: '$4' }}>
            <View>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>Exercise</Text>
              <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3' }}>
                <TextInput
                  value={exerciseType}
                  onChangeText={setExerciseType}
                  placeholder="Type (e.g., walking)"
                  placeholderTextColor="#9CA3AF"
                  sx={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 8,
                    px: '$3',
                    py: '$2',
                    fontSize: 14,
                    color: '$foreground',
                  }}
                />
                <TextInput
                  value={exerciseMinutes}
                  onChangeText={setExerciseMinutes}
                  placeholder="Min"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  sx={{
                    width: 72,
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 8,
                    px: '$3',
                    py: '$2',
                    fontSize: 14,
                    color: '$foreground',
                  }}
                />
              </View>
            </View>

            <View>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>New symptoms</Text>
              <TextInput
                value={newSymptoms}
                onChangeText={setNewSymptoms}
                placeholder="Comma-separated (e.g., headache, fatigue)"
                placeholderTextColor="#9CA3AF"
                sx={{
                  mt: '$2',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                  px: '$3',
                  py: '$2',
                  fontSize: 14,
                  color: '$foreground',
                }}
              />
            </View>

            <View>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything else you want to note..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                sx={{
                  mt: '$2',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                  px: '$3',
                  py: '$2',
                  fontSize: 14,
                  color: '$foreground',
                  minHeight: 80,
                }}
              />
            </View>
          </View>
        )}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          sx={{ mt: '$8' }}
        >
          <View sx={{
            backgroundColor: canSubmit ? 'blue600' : '#D1D5DB',
            borderRadius: 10,
            py: '$3',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
              {submitting ? 'Saving...' : 'Save'}
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function RatingRow({
  label,
  sublabel,
  min,
  max,
  labels,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  min: number;
  max: number;
  labels: string[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View>
      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{label}</Text>
      {sublabel && (
        <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>{sublabel}</Text>
      )}
      <View sx={{ mt: '$2', flexDirection: 'row', gap: '$1' }}>
        {range.map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} sx={{ flex: 1 }}>
            <View sx={{
              py: '$2',
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: value === n ? 'blue600' : '$muted',
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
      <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mt: 4 }}>
        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{labels[min]}</Text>
        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{labels[max]}</Text>
      </View>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
