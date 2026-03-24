import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetMentorTrainingModulesQuery, useCompleteTrainingModuleMutation } from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function MentorTrainingScreen() {
  const { data, loading, refetch } = useGetMentorTrainingModulesQuery({ errorPolicy: 'ignore' });
  const [completeMutation, { loading: completing }] = useCompleteTrainingModuleMutation();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const modules = data?.mentorTrainingModules ?? [];
  const completedCount = modules.filter(m => m.completed).length;
  const allComplete = completedCount === modules.length && modules.length > 0;

  const handleComplete = async (moduleId: string) => {
    await completeMutation({ variables: { moduleId } });
    refetch();
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Mentor Training</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading training modules...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Mentor Training</Text>
        <Text sx={{ fontSize: 16, color: '$mutedForeground', mt: '$2', lineHeight: 24 }}>
          Complete all 6 modules to become a trained peer mentor. Each module takes 10-20 minutes.
        </Text>

        {/* Progress Bar */}
        <View sx={{ mt: '$6', bg: '$card', borderRadius: 12, p: '$5', borderWidth: 1, borderColor: '$border' }}>
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground' }}>Progress</Text>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: allComplete ? '#22C55E' : '#7C3AED' }}>
              {completedCount} / {modules.length}
            </Text>
          </View>
          <View sx={{ mt: '$3', bg: '#E5E7EB', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <View sx={{
              bg: allComplete ? '#22C55E' : '#7C3AED',
              borderRadius: 4, height: 8,
              width: modules.length > 0 ? `${(completedCount / modules.length) * 100}%` : '0%',
            }} />
          </View>
          {allComplete && (
            <View sx={{ mt: '$3', bg: '#DCFCE7', px: '$3', py: '$2', borderRadius: 8 }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534', textAlign: 'center' }}>
                Training complete! You're now eligible to be matched with mentees.
              </Text>
            </View>
          )}
        </View>

        {/* Modules */}
        <View sx={{ mt: '$6', gap: '$3' }}>
          {modules.map((mod, idx) => {
            const isExpanded = expandedModule === mod.id;
            return (
              <View
                key={mod.id}
                sx={{
                  bg: '$card', borderRadius: 12, borderWidth: 1,
                  borderColor: mod.completed ? '#22C55E' : '$border',
                  overflow: 'hidden',
                }}
              >
                <Pressable onPress={() => setExpandedModule(isExpanded ? null : mod.id)}>
                  <View sx={{ p: '$4', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                    {/* Step Number / Check */}
                    <View sx={{
                      width: 36, height: 36, borderRadius: 18,
                      bg: mod.completed ? '#22C55E' : '#F3F4F6',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text sx={{
                        fontSize: 14, fontWeight: '700',
                        color: mod.completed ? '#FFFFFF' : '$mutedForeground',
                      }}>
                        {mod.completed ? '✓' : idx + 1}
                      </Text>
                    </View>

                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>{mod.title}</Text>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                        {mod.estimatedMinutes} min · {mod.completed ? 'Completed' : 'Not started'}
                      </Text>
                    </View>

                    <Text sx={{ fontSize: 20, color: '$mutedForeground' }}>
                      {isExpanded ? '▲' : '▼'}
                    </Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View sx={{ px: '$4', pb: '$4', pt: 0 }}>
                    <View sx={{ bg: '#F9FAFB', borderRadius: 8, p: '$4' }}>
                      <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                        {mod.description}
                      </Text>
                    </View>

                    {!mod.completed && (
                      <Pressable
                        onPress={() => handleComplete(mod.id)}
                        disabled={completing}
                        sx={{ mt: '$3' }}
                      >
                        <View sx={{ bg: '#7C3AED', py: '$3', borderRadius: 10, alignItems: 'center' }}>
                          {completing ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text sx={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                              Mark as Complete
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    )}

                    {mod.completed && mod.completedAt && (
                      <Text sx={{ fontSize: 12, color: '#22C55E', mt: '$2', fontWeight: '600' }}>
                        Completed {new Date(mod.completedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Important Notes */}
        <View sx={{ mt: '$8', bg: '#FFF7ED', borderRadius: 12, p: '$5' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '#9A3412' }}>Important Reminders</Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            <Text sx={{ fontSize: 14, color: '#9A3412', lineHeight: 22 }}>
              • You are not a therapist or medical professional in this role
            </Text>
            <Text sx={{ fontSize: 14, color: '#9A3412', lineHeight: 22 }}>
              • Share your experience, not medical advice
            </Text>
            <Text sx={{ fontSize: 14, color: '#9A3412', lineHeight: 22 }}>
              • If someone expresses thoughts of self-harm, use the escalation protocol
            </Text>
            <Text sx={{ fontSize: 14, color: '#9A3412', lineHeight: 22 }}>
              • It's okay to say "I don't know" or "I can't help with that"
            </Text>
            <Text sx={{ fontSize: 14, color: '#9A3412', lineHeight: 22 }}>
              • Your own wellbeing matters too — take breaks when needed
            </Text>
          </View>
        </View>

        <View sx={{ mt: '$6' }}>
          <Link href="/peers">
            <Text sx={{ fontSize: 14, color: '#7C3AED', fontWeight: '600' }}>Back to Peer Support</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
