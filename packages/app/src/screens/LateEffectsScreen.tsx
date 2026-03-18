import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetSurvivorshipPlanQuery } from '../generated/graphql';

interface LateEffect {
  name: string;
  likelihood: string;
  onset: string;
  duration: string;
  management: string[];
  whenToWorry: string[];
}

interface TreatmentEffects {
  treatment: string;
  effects: LateEffect[];
}

export function LateEffectsScreen() {
  const { data, loading } = useGetSurvivorshipPlanQuery({ errorPolicy: 'ignore' });
  const plan = data?.survivorshipPlan;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Late Effects</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Late Effects</Text>
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'📋'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No survivorship plan yet
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
              Complete your treatment transition to generate a personalized care plan with late effect guidance.
            </Text>
            <Link href="/survive/complete">
              <View sx={{ mt: '$5', backgroundColor: 'blue600', borderRadius: 8, px: '$6', py: '$3' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Begin transition</Text>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Parse late effects from planContent
  const planContent = plan.planContent as Record<string, unknown>;
  const lateEffects = (planContent?.lateEffects as Record<string, unknown>) ?? {};
  const byTreatment: TreatmentEffects[] = Array.isArray(lateEffects.byTreatment)
    ? (lateEffects.byTreatment as TreatmentEffects[])
    : [];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Late Effects</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Possible long-term effects from your treatments. Most are manageable with the right support.
        </Text>

        {byTreatment.length === 0 && (
          <View sx={{
            mt: '$8',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$6',
          }}>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
              No specific late effects data found in your care plan. Ask your care team for personalized guidance.
            </Text>
          </View>
        )}

        <View sx={{ mt: '$6', gap: '$6' }}>
          {byTreatment.map((group, gi) => (
            <View key={gi}>
              <View sx={{
                backgroundColor: '#F0F9FF',
                borderRadius: 10,
                px: '$4',
                py: '$3',
                mb: '$3',
              }}>
                <Text sx={{ fontSize: 16, fontWeight: '700', color: '#0C4A6E' }}>
                  {group.treatment}
                </Text>
              </View>

              <View sx={{ gap: '$3' }}>
                {(group.effects ?? []).map((effect, ei) => (
                  <EffectCard key={ei} effect={effect} />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View sx={{
          mt: '$8',
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
            This information is generated from your care plan and general medical guidelines.
            It is not a substitute for professional medical advice. Always discuss concerns with
            your oncologist or care team. Not everyone experiences these effects.
          </Text>
        </View>

        {/* Reassurance */}
        <View sx={{
          mt: '$4',
          backgroundColor: '#F0FDF4',
          borderWidth: 1,
          borderColor: '#BBF7D0',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
            You are not alone
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#14532D', lineHeight: 18 }}>
            Many survivors experience late effects and find ways to manage them effectively.
            Tracking symptoms in your journal helps your care team support you better.
            Reach out whenever something feels different.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function EffectCard({ effect }: { effect: LateEffect }) {
  const [expanded, setExpanded] = useState(false);

  const likelihoodColor = getLikelihoodColor(effect.likelihood);

  return (
    <View sx={{
      borderWidth: 1,
      borderColor: '$border',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View sx={{ p: '$4' }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', flex: 1 }}>
              {effect.name}
            </Text>
            {effect.likelihood && (
              <View sx={{
                backgroundColor: likelihoodColor.bg,
                borderRadius: 12,
                px: '$2',
                py: 3,
              }}>
                <Text sx={{ fontSize: 11, fontWeight: '600', color: likelihoodColor.fg }}>
                  {effect.likelihood}
                </Text>
              </View>
            )}
          </View>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3', mt: '$2' }}>
            {effect.onset && (
              <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                Onset: {effect.onset}
              </Text>
            )}
            {effect.duration && (
              <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                Duration: {effect.duration}
              </Text>
            )}
          </View>
          <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>
            {expanded ? 'Hide details' : 'View management tips'}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View sx={{ px: '$4', pb: '$4', gap: '$4' }}>
          {effect.management && effect.management.length > 0 && (
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>Management</Text>
              {effect.management.map((tip, i) => (
                <Text key={i} sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {'\u2022'} {tip}
                </Text>
              ))}
            </View>
          )}

          {effect.whenToWorry && effect.whenToWorry.length > 0 && (
            <View sx={{
              backgroundColor: '#FEF2F2',
              borderRadius: 10,
              p: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#991B1B' }}>
                When to call your doctor
              </Text>
              {effect.whenToWorry.map((sign, i) => (
                <Text key={i} sx={{ mt: '$1', fontSize: 13, color: '#7F1D1D', lineHeight: 20 }}>
                  {'\u2022'} {sign}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function getLikelihoodColor(likelihood: string): { bg: string; fg: string } {
  const l = (likelihood ?? '').toLowerCase();
  if (l.includes('common') || l.includes('high') || l.includes('very likely')) {
    return { bg: '#FEE2E2', fg: '#991B1B' };
  }
  if (l.includes('moderate') || l.includes('possible')) {
    return { bg: '#FEF3C7', fg: '#92400E' };
  }
  return { bg: '#DCFCE7', fg: '#166534' };
}
