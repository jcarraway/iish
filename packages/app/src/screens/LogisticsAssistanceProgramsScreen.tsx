import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetAssistanceProgramsQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_META: Record<string, { emoji: string; label: string; order: number }> = {
  flights: { emoji: '\u2708\uFE0F', label: 'Flights', order: 0 },
  lodging: { emoji: '\uD83C\uDFE8', label: 'Lodging', order: 1 },
  ground: { emoji: '\uD83D\uDE97', label: 'Ground Transportation', order: 2 },
  trial_specific: { emoji: '\uD83D\uDD2C', label: 'Trial-Specific', order: 3 },
  childcare: { emoji: '\uD83D\uDC76', label: 'Childcare', order: 4 },
  other: { emoji: '\uD83D\uDC8A', label: 'Other', order: 5 },
};

interface AssistanceProgram {
  key: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  coverage: string;
  eligibility: string;
  eligible: boolean;
  eligibleReason?: string | null;
  phone?: string | null;
  url?: string | null;
}

// ============================================================================
// Component
// ============================================================================

export function LogisticsAssistanceProgramsScreen() {
  const { data, loading } = useGetAssistanceProgramsQuery({ errorPolicy: 'ignore' });
  const programs: AssistanceProgram[] = data?.assistancePrograms ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Assistance Programs
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading programs...</Text>
        </View>
      </View>
    );
  }

  // Group by category
  const grouped: Record<string, AssistanceProgram[]> = {};
  for (const program of programs) {
    const cat = program.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(program);
  }

  // Sort categories by predefined order
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const orderA = CATEGORY_META[a]?.order ?? 99;
    const orderB = CATEGORY_META[b]?.order ?? 99;
    return orderA - orderB;
  });

  const eligibleCount = programs.filter((p) => p.eligible).length;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Assistance Programs
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Financial assistance for clinical trial participation
        </Text>

        {/* Info box */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#0C4A6E' }}>
            These programs help cover the hidden costs of clinical trial participation
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
            Travel, lodging, meals, childcare, and other expenses can add up quickly when
            participating in a clinical trial, especially one far from home. Many organizations
            offer free or subsidized assistance to eligible patients.
          </Text>
          {eligibleCount > 0 && (
            <View sx={{
              mt: '$3',
              backgroundColor: '#DCFCE7',
              borderRadius: 8,
              px: '$3',
              py: '$2',
              alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                {eligibleCount} program{eligibleCount !== 1 ? 's' : ''} you may be eligible for
              </Text>
            </View>
          )}
        </View>

        {/* Empty state */}
        {programs.length === 0 && (
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No programs available yet
            </Text>
            <Text sx={{
              mt: '$3', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400, lineHeight: 22,
            }}>
              Assistance programs will be matched based on your trial location, diagnosis,
              and financial situation. Complete a logistics assessment to see matched programs.
            </Text>
            <Link href="/logistics">
              <View sx={{
                mt: '$4',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Go to Logistics Dashboard
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* Programs grouped by category */}
        {sortedCategories.map((category) => {
          const meta = CATEGORY_META[category] ?? { emoji: '\uD83D\uDCE6', label: category, order: 99 };
          const categoryPrograms = grouped[category];

          return (
            <View key={category} sx={{ mt: '$6' }}>
              <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
                <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                  {meta.emoji} {meta.label}
                </Text>
              </View>

              <View sx={{ mt: '$4', gap: '$3' }}>
                {categoryPrograms.map((program) => (
                  <View key={program.key} sx={{
                    borderWidth: 1,
                    borderColor: program.eligible ? '#BBF7D0' : '$border',
                    borderLeftWidth: program.eligible ? 4 : 1,
                    borderLeftColor: program.eligible ? '#22C55E' : '$border',
                    borderRadius: 12,
                    p: '$5',
                  }}>
                    <View sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <View sx={{ flex: 1, mr: '$3' }}>
                        <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                          {program.name}
                        </Text>
                        {program.provider && (
                          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                            {program.provider}
                          </Text>
                        )}
                      </View>
                      {program.eligible && (
                        <View sx={{
                          backgroundColor: '#DCFCE7',
                          borderRadius: 12,
                          px: '$3',
                          py: 4,
                        }}>
                          <Text sx={{ fontSize: 11, fontWeight: 'bold', color: '#166534', textTransform: 'uppercase' }}>
                            Eligible
                          </Text>
                        </View>
                      )}
                    </View>

                    {program.coverage && (
                      <View sx={{ mt: '$3' }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                          Coverage
                        </Text>
                        <Text sx={{ mt: '$1', fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                          {program.coverage}
                        </Text>
                      </View>
                    )}

                    {program.eligibility && (
                      <View sx={{ mt: '$3' }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                          Eligibility
                        </Text>
                        <Text sx={{ mt: '$1', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                          {program.eligibility}
                        </Text>
                      </View>
                    )}

                    {(program.phone || program.url) && (
                      <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
                        {program.phone && (
                          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Phone:</Text>
                            <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                              {program.phone}
                            </Text>
                          </View>
                        )}
                        {program.url && (
                          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Website:</Text>
                            <Text sx={{ fontSize: 13, fontWeight: '500', color: 'blue600' }}>
                              {program.url}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Navigation */}
        <View sx={{ mt: '$8', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/logistics">
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                {'\u2190'} Dashboard
              </Text>
            </View>
          </Link>
          <Link href="/logistics/applications">
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                My Applications {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            Eligibility information is based on general program criteria and your profile data.
            Contact each program directly to confirm eligibility and apply. Program availability
            and requirements may change without notice.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
