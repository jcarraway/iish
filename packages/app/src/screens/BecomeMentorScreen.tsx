import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { useGetPeerMentorProfileQuery, useEnrollAsMentorMutation, useUpdateMentorProfileMutation } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const COMFORT_TOPICS = [
  { id: 'diagnosis_shock', label: 'Diagnosis & Initial Shock' },
  { id: 'treatment_decisions', label: 'Treatment Decisions' },
  { id: 'side_effects', label: 'Side Effects' },
  { id: 'body_image', label: 'Body Image' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'fertility', label: 'Fertility' },
  { id: 'financial_stress', label: 'Financial Stress' },
  { id: 'work_career', label: 'Work & Career' },
  { id: 'fear_of_recurrence', label: 'Fear of Recurrence' },
  { id: 'survivorship', label: 'Survivorship' },
  { id: 'clinical_trials', label: 'Clinical Trials' },
  { id: 'mental_health', label: 'Mental Health' },
  { id: 'family_impact', label: 'Family Impact' },
  { id: 'sexuality', label: 'Sexuality & Intimacy' },
];

const HOURS_OPTIONS = ['1-2 hours/week', '3-5 hours/week', '5+ hours/week', 'Flexible'];
const COMM_OPTIONS = ['messaging', 'video', 'phone', 'any'];

// ============================================================================
// Component
// ============================================================================

export function BecomeMentorScreen() {
  const router = useRouter();
  const { data, loading } = useGetPeerMentorProfileQuery({ errorPolicy: 'ignore' });
  const [enrollMutation, { loading: enrolling }] = useEnrollAsMentorMutation();
  const [updateMutation, { loading: updating }] = useUpdateMentorProfileMutation();

  const existingProfile = data?.peerMentorProfile;

  const [bio, setBio] = useState(existingProfile?.bio ?? '');
  const [maxMentees, setMaxMentees] = useState(existingProfile?.maxMentees ?? 3);
  const [availableHours, setAvailableHours] = useState(existingProfile?.availableHours ?? '');
  const [communicationPreference, setCommunicationPreference] = useState(existingProfile?.communicationPreference ?? 'any');
  const [comfortable, setComfortable] = useState<string[]>(existingProfile?.comfortableDiscussing ?? []);
  const [notComfortable, setNotComfortable] = useState<string[]>(existingProfile?.notComfortableWith ?? []);

  const toggleTopic = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter(t => t !== id) : [...list, id]);
  };

  const handleSubmit = async () => {
    const input = {
      bio: bio || null,
      maxMentees,
      availableHours: availableHours || null,
      communicationPreference,
      comfortableDiscussing: comfortable,
      notComfortableWith: notComfortable,
    };

    if (existingProfile) {
      await updateMutation({ variables: { input } });
    } else {
      await enrollMutation({ variables: { input } });
    }
    router.push('/peers');
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Become a Mentor</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          {existingProfile ? 'Edit Mentor Profile' : 'Become a Peer Mentor'}
        </Text>
        <Text sx={{ fontSize: 16, color: '$mutedForeground', mt: '$2', lineHeight: 24 }}>
          Your experience can help someone going through the same thing. Share what you're comfortable with and set your own boundaries.
        </Text>

        {/* Bio */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>About You</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mb: '$2' }}>
            Write a brief introduction. This will be shown to potential mentees (privacy-preserving).
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholder="I was diagnosed with stage II HER2+ breast cancer in 2023. I've been through chemo, surgery, and targeted therapy. Happy to share what helped me get through it..."
            sx={{
              borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
              fontSize: 14, color: '$foreground', bg: '$card', minHeight: 100,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Max Mentees */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            How many mentees can you support at once?
          </Text>
          <View sx={{ flexDirection: 'row', gap: '$3' }}>
            {[1, 2, 3, 5].map(n => (
              <Pressable key={n} onPress={() => setMaxMentees(n)}>
                <View sx={{
                  px: '$4', py: '$2', borderRadius: 8,
                  bg: maxMentees === n ? '#7C3AED' : '$card',
                  borderWidth: 1, borderColor: maxMentees === n ? '#7C3AED' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 14, fontWeight: '600',
                    color: maxMentees === n ? '#FFFFFF' : '$foreground',
                  }}>{n}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Available Hours */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            Availability
          </Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            {HOURS_OPTIONS.map(h => (
              <Pressable key={h} onPress={() => setAvailableHours(h)}>
                <View sx={{
                  px: '$4', py: '$2', borderRadius: 8,
                  bg: availableHours === h ? '#7C3AED' : '$card',
                  borderWidth: 1, borderColor: availableHours === h ? '#7C3AED' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 14, fontWeight: '600',
                    color: availableHours === h ? '#FFFFFF' : '$foreground',
                  }}>{h}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Communication Preference */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            Preferred Communication
          </Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            {COMM_OPTIONS.map(c => (
              <Pressable key={c} onPress={() => setCommunicationPreference(c)}>
                <View sx={{
                  px: '$4', py: '$2', borderRadius: 8,
                  bg: communicationPreference === c ? '#7C3AED' : '$card',
                  borderWidth: 1, borderColor: communicationPreference === c ? '#7C3AED' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 14, fontWeight: '600',
                    color: communicationPreference === c ? '#FFFFFF' : '$foreground',
                  }}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Comfortable Discussing */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            Comfortable Discussing
          </Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mb: '$3' }}>
            Select topics you feel comfortable talking about with mentees.
          </Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            {COMFORT_TOPICS.map(t => (
              <Pressable key={t.id} onPress={() => toggleTopic(t.id, comfortable, setComfortable)}>
                <View sx={{
                  px: '$3', py: '$2', borderRadius: 20,
                  bg: comfortable.includes(t.id) ? '#DCFCE7' : '$card',
                  borderWidth: 1, borderColor: comfortable.includes(t.id) ? '#22C55E' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 13, fontWeight: '600',
                    color: comfortable.includes(t.id) ? '#166534' : '$foreground',
                  }}>{t.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* NOT Comfortable Discussing */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            Boundaries — Not Comfortable With
          </Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mb: '$3' }}>
            Select topics that are too difficult for you to discuss. This is important and completely okay.
          </Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            {COMFORT_TOPICS.map(t => (
              <Pressable key={t.id} onPress={() => toggleTopic(t.id, notComfortable, setNotComfortable)}>
                <View sx={{
                  px: '$3', py: '$2', borderRadius: 20,
                  bg: notComfortable.includes(t.id) ? '#FEE2E2' : '$card',
                  borderWidth: 1, borderColor: notComfortable.includes(t.id) ? '#EF4444' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 13, fontWeight: '600',
                    color: notComfortable.includes(t.id) ? '#991B1B' : '$foreground',
                  }}>{t.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit */}
        <View sx={{ mt: '$10', mb: '$6' }}>
          <Pressable onPress={handleSubmit} disabled={enrolling || updating}>
            <View sx={{ bg: '#7C3AED', py: '$4', borderRadius: 12, alignItems: 'center' }}>
              {(enrolling || updating) ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text sx={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  {existingProfile ? 'Save Changes' : 'Enroll as Mentor'}
                </Text>
              )}
            </View>
          </Pressable>
          <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$3', textAlign: 'center' }}>
            You'll need to complete 6 training modules before being matched with mentees.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
