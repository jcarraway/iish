import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPreventProfileQuery,
  useUpdateFamilyHistoryMutation,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function PreventFamilyHistoryScreen() {
  const { data, loading } = useGetPreventProfileQuery({ errorPolicy: 'ignore' });
  const [updateFamilyHistory, { loading: saving }] = useUpdateFamilyHistoryMutation();

  const existing = data?.preventProfile?.familyHistory as any;

  const [motherBreastCancer, setMotherBreastCancer] = useState(existing?.motherBreastCancer ?? false);
  const [sistersWithBreastCancer, setSistersWithBreastCancer] = useState(existing?.sistersWithBreastCancer ?? 0);
  const [daughtersWithBreastCancer, setDaughtersWithBreastCancer] = useState(existing?.daughtersWithBreastCancer ?? 0);
  const [grandmothersWithBreastCancer, setGrandmothersWithBreastCancer] = useState(existing?.grandmothersWithBreastCancer ?? 0);
  const [auntsWithBreastCancer, setAuntsWithBreastCancer] = useState(existing?.auntsWithBreastCancer ?? 0);
  const [knownBrcaMutation, setKnownBrcaMutation] = useState<boolean | null>(existing?.knownBrcaMutation ?? null);
  const [relativeWithOvarianCancer, setRelativeWithOvarianCancer] = useState<boolean | null>(existing?.relativeWithOvarianCancer ?? null);
  const [youngestDiagnosisAge, setYoungestDiagnosisAge] = useState<string>(
    existing?.youngestDiagnosisAge != null ? String(existing.youngestDiagnosisAge) : ''
  );
  const [saved, setSaved] = useState(false);

  // Recalculate when data loads
  const firstDegreeCount = (motherBreastCancer ? 1 : 0) + sistersWithBreastCancer + daughtersWithBreastCancer;
  const isHighRisk =
    firstDegreeCount >= 2 ||
    knownBrcaMutation === true ||
    (youngestDiagnosisAge !== '' && parseInt(youngestDiagnosisAge, 10) < 45);

  async function handleSave() {
    const familyHistory = {
      motherBreastCancer,
      sistersWithBreastCancer,
      daughtersWithBreastCancer,
      grandmothersWithBreastCancer,
      auntsWithBreastCancer,
      knownBrcaMutation: knownBrcaMutation ?? false,
      relativeWithOvarianCancer: relativeWithOvarianCancer ?? false,
      youngestDiagnosisAge: youngestDiagnosisAge ? parseInt(youngestDiagnosisAge, 10) : null,
    };
    await updateFamilyHistory({ variables: { familyHistory } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Family History
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/prevent/risk">
          <Text sx={{ fontSize: 13, color: 'blue600', mb: '$4' }}>
            {'\u2190'} Back to Risk Assessment
          </Text>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Family History
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
          Understanding your family's cancer history helps personalize your risk assessment
        </Text>

        {/* Why we ask */}
        <View sx={{
          mt: '$6', backgroundColor: '#F0F9FF', borderWidth: 1,
          borderColor: '#BAE6FD', borderRadius: 12, p: '$5',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E' }}>
            Why we ask
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
            Family history is one of the strongest indicators of breast cancer risk. First-degree
            relatives (mother, sisters, daughters) share about 50% of your genes, making their
            cancer history highly relevant to your own risk. Second-degree relatives (grandmothers,
            aunts) also contribute to your risk profile, though to a lesser degree. This information
            helps us calculate a more accurate risk estimate and recommend appropriate screening.
          </Text>
        </View>

        {/* ================================================================ */}
        {/* First-Degree Relatives                                           */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="First-degree relatives" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
            Mother, sisters, and daughters with breast cancer
          </Text>

          <View sx={{ mt: '$4', gap: '$4' }}>
            {/* Mother */}
            <View sx={{
              borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$4',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
                Mother diagnosed with breast cancer?
              </Text>
              <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3' }}>
                {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                  <Pressable key={opt.label} onPress={() => setMotherBreastCancer(opt.value)}>
                    <View sx={{
                      px: '$4', py: '$2', borderRadius: 8,
                      borderWidth: 1,
                      borderColor: motherBreastCancer === opt.value ? 'blue600' : '$border',
                      backgroundColor: motherBreastCancer === opt.value ? '#EFF6FF' : 'white',
                    }}>
                      <Text sx={{ fontSize: 14, color: motherBreastCancer === opt.value ? 'blue600' : '$foreground' }}>
                        {opt.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Sisters */}
            <CounterField
              label="Sisters with breast cancer"
              value={sistersWithBreastCancer}
              onChange={setSistersWithBreastCancer}
            />

            {/* Daughters */}
            <CounterField
              label="Daughters with breast cancer"
              value={daughtersWithBreastCancer}
              onChange={setDaughtersWithBreastCancer}
            />
          </View>
        </View>

        {/* ================================================================ */}
        {/* Second-Degree Relatives                                          */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Second-degree relatives" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
            Grandmothers and aunts with breast cancer
          </Text>

          <View sx={{ mt: '$4', gap: '$4' }}>
            <CounterField
              label="Grandmothers with breast cancer"
              value={grandmothersWithBreastCancer}
              onChange={setGrandmothersWithBreastCancer}
            />

            <CounterField
              label="Aunts with breast cancer"
              value={auntsWithBreastCancer}
              onChange={setAuntsWithBreastCancer}
            />
          </View>
        </View>

        {/* ================================================================ */}
        {/* Known BRCA Mutation                                              */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Genetic mutations" />

          <View sx={{
            mt: '$4', borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$4',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Do you have a known BRCA1 or BRCA2 mutation?
            </Text>
            <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3' }}>
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                <Pressable key={opt.label} onPress={() => setKnownBrcaMutation(opt.value)}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1,
                    borderColor: knownBrcaMutation === opt.value ? 'blue600' : '$border',
                    backgroundColor: knownBrcaMutation === opt.value ? '#EFF6FF' : 'white',
                  }}>
                    <Text sx={{ fontSize: 14, color: knownBrcaMutation === opt.value ? 'blue600' : '$foreground' }}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View sx={{
            mt: '$4', borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$4',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Any relative with ovarian cancer?
            </Text>
            <View sx={{ mt: '$2', flexDirection: 'row', gap: '$3' }}>
              {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                <Pressable key={opt.label} onPress={() => setRelativeWithOvarianCancer(opt.value)}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1,
                    borderColor: relativeWithOvarianCancer === opt.value ? 'blue600' : '$border',
                    backgroundColor: relativeWithOvarianCancer === opt.value ? '#EFF6FF' : 'white',
                  }}>
                    <Text sx={{ fontSize: 14, color: relativeWithOvarianCancer === opt.value ? 'blue600' : '$foreground' }}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Youngest Age at Diagnosis                                        */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Age at diagnosis" />

          <View sx={{
            mt: '$4', borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$4',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Youngest age at diagnosis in your family
            </Text>
            <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
              If known, enter the youngest age a family member was diagnosed with breast cancer
            </Text>
            <View sx={{ mt: '$3', flexDirection: 'row', gap: '$3', alignItems: 'center' }}>
              {['<40', '40-44', '45-49', '50-59', '60+', 'Unknown'].map(range => {
                const rangeValue = range === '<40' ? '35' : range === '40-44' ? '42' :
                  range === '45-49' ? '47' : range === '50-59' ? '55' :
                  range === '60+' ? '65' : '';
                const isSelected = youngestDiagnosisAge === rangeValue;
                return (
                  <Pressable key={range} onPress={() => setYoungestDiagnosisAge(rangeValue)}>
                    <View sx={{
                      px: '$3', py: '$2', borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? 'blue600' : '$border',
                      backgroundColor: isSelected ? '#EFF6FF' : 'white',
                    }}>
                      <Text sx={{ fontSize: 13, color: isSelected ? 'blue600' : '$foreground' }}>
                        {range}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ================================================================ */}
        {/* High Risk Alert                                                  */}
        {/* ================================================================ */}
        {isHighRisk && (
          <View sx={{
            mt: '$6', backgroundColor: '#FEE2E2', borderWidth: 2,
            borderColor: '#FECACA', borderRadius: 12, p: '$5',
          }}>
            <Text sx={{ fontSize: 15, fontWeight: '700', color: '#991B1B' }}>
              High-risk criteria identified
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#7F1D1D', lineHeight: 20 }}>
              Based on your family history, you may benefit from genetic counseling and enhanced
              screening. The following criteria triggered this recommendation:
            </Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {firstDegreeCount >= 2 && (
                <View sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                  <Text sx={{ fontSize: 13, color: '#991B1B' }}>{'\u2022'}</Text>
                  <Text sx={{ fontSize: 13, color: '#7F1D1D', flex: 1 }}>
                    {firstDegreeCount} first-degree relatives with breast cancer
                  </Text>
                </View>
              )}
              {knownBrcaMutation === true && (
                <View sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                  <Text sx={{ fontSize: 13, color: '#991B1B' }}>{'\u2022'}</Text>
                  <Text sx={{ fontSize: 13, color: '#7F1D1D', flex: 1 }}>
                    Known BRCA1/BRCA2 mutation carrier
                  </Text>
                </View>
              )}
              {youngestDiagnosisAge !== '' && parseInt(youngestDiagnosisAge, 10) < 45 && (
                <View sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                  <Text sx={{ fontSize: 13, color: '#991B1B' }}>{'\u2022'}</Text>
                  <Text sx={{ fontSize: 13, color: '#7F1D1D', flex: 1 }}>
                    Family member diagnosed before age 45
                  </Text>
                </View>
              )}
            </View>

            <Text sx={{ mt: '$4', fontSize: 13, fontWeight: '600', color: '#991B1B' }}>
              Recommended next step: Genetic counseling
            </Text>
            <Text sx={{ mt: '$1', fontSize: 12, color: '#7F1D1D', lineHeight: 18 }}>
              A genetic counselor can assess your full family history in detail, recommend appropriate
              genetic testing, and help you understand your options. If you carry a mutation, cascade
              testing for your other family members may also be recommended.
            </Text>

            {/* Cascade testing note */}
            <View sx={{
              mt: '$4', backgroundColor: '#FEF2F2', borderWidth: 1,
              borderColor: '#FECACA', borderRadius: 10, p: '$4',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#991B1B' }}>
                About cascade testing
              </Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '#7F1D1D', lineHeight: 18 }}>
                If a pathogenic variant is identified in you, your first-degree relatives should be
                offered testing for that specific variant. This targeted approach is more efficient and
                cost-effective than broad panel testing. Insurance typically covers cascade testing when
                a family member has a known pathogenic variant.
              </Text>
            </View>
          </View>
        )}

        {/* ================================================================ */}
        {/* Save Button                                                      */}
        {/* ================================================================ */}
        <View sx={{ mt: '$6', flexDirection: 'row', alignItems: 'center', gap: '$4' }}>
          <Pressable onPress={handleSave} disabled={saving}>
            <View sx={{
              backgroundColor: saving ? '#9CA3AF' : 'blue600',
              borderRadius: 8, px: '$6', py: '$3',
              flexDirection: 'row', alignItems: 'center', gap: '$2',
            }}>
              {saving && <ActivityIndicator color="white" size="small" />}
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                {saving ? 'Saving...' : 'Save Family History'}
              </Text>
            </View>
          </Pressable>
          {saved && (
            <Text sx={{ fontSize: 13, color: '#166534', fontWeight: '500' }}>
              Saved successfully
            </Text>
          )}
        </View>

        {/* Link to genomic testing */}
        <View sx={{
          mt: '$6', p: '$5', borderRadius: 12,
          backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#93C5FD',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#1E40AF' }}>
            Interested in genetic testing?
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#1E40AF', lineHeight: 20 }}>
            Based on your family history, genetic testing may help clarify your risk and guide
            screening and prevention decisions.
          </Text>
          <Link href="/prevent/risk/genomic">
            <View sx={{
              mt: '$3', backgroundColor: '#1E40AF', borderRadius: 8,
              px: '$5', py: '$3', alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                Learn about genetic testing {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}

function CounterField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View sx={{
      borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$4',
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground', flex: 1 }}>
        {label}
      </Text>
      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))}>
          <View sx={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: value === 0 ? '#F1F5F9' : '#DBEAFE',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text sx={{ fontSize: 16, fontWeight: '700', color: value === 0 ? '#9CA3AF' : '#1E40AF' }}>
              -
            </Text>
          </View>
        </Pressable>
        <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', minWidth: 24, textAlign: 'center' }}>
          {value}
        </Text>
        <Pressable onPress={() => onChange(value + 1)}>
          <View sx={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: '#DBEAFE',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text sx={{ fontSize: 16, fontWeight: '700', color: '#1E40AF' }}>
              +
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
