import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import {
  useGetCareTeamQuery,
  useAddCareTeamMemberMutation,
  useUpdateCareTeamMemberMutation,
  useRemoveCareTeamMemberMutation,
  useRouteSymptomLazyQuery,
  useGetSurvivorshipPlanQuery,
  useGetSurveillanceScheduleQuery,
  useGenerateAppointmentPrepMutation,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

// ============================================================================
// Constants
// ============================================================================

const ROLE_OPTIONS = [
  { label: 'Oncologist', value: 'Oncologist' },
  { label: 'Primary Care (PCP)', value: 'PCP' },
  { label: 'Surgeon', value: 'Surgeon' },
  { label: 'Radiation Oncologist', value: 'Radiation Oncologist' },
  { label: 'Nurse Practitioner', value: 'Nurse Practitioner' },
  { label: 'Mental Health', value: 'Mental Health' },
  { label: 'Physical Therapist', value: 'Physical Therapist' },
  { label: 'Nutritionist', value: 'Nutritionist' },
  { label: 'Cardiologist', value: 'Cardiologist' },
  { label: 'Gynecologist', value: 'Gynecologist' },
  { label: 'Other', value: 'Other' },
];

const CONTACT_FOR_OPTIONS = [
  'New symptoms',
  'Side effects',
  'Medication questions',
  'Emotional distress',
  'Pain management',
  'Follow-up scheduling',
  'Insurance/billing',
  'Urgent concerns',
  'General questions',
];

const URGENCY_COLORS: Record<string, { bg: string; fg: string }> = {
  emergency: { bg: '#FEE2E2', fg: '#991B1B' },
  urgent: { bg: '#FEF3C7', fg: '#92400E' },
  soon: { bg: '#DBEAFE', fg: '#1E40AF' },
  routine: { bg: '#DCFCE7', fg: '#166534' },
};

// ============================================================================
// Component
// ============================================================================

export function CareTeamScreen() {
  const { data: teamData, loading: teamLoading, refetch: refetchTeam } = useGetCareTeamQuery({ errorPolicy: 'ignore' });
  const { data: planData } = useGetSurvivorshipPlanQuery({ errorPolicy: 'ignore' });
  const { data: scheduleData } = useGetSurveillanceScheduleQuery({ errorPolicy: 'ignore' });

  const [routeSymptom, { data: routingData, loading: routing }] = useRouteSymptomLazyQuery();
  const [addMember, { loading: adding }] = useAddCareTeamMemberMutation({ onCompleted: () => { refetchTeam(); setShowAddForm(false); resetForm(); } });
  const [updateMember, { loading: updating }] = useUpdateCareTeamMemberMutation({ onCompleted: () => { refetchTeam(); setEditingId(null); } });
  const [removeMember] = useRemoveCareTeamMemberMutation({ onCompleted: () => refetchTeam() });
  const [generatePrep, { data: prepData, loading: prepping }] = useGenerateAppointmentPrepMutation();

  const team = teamData?.careTeam ?? [];
  const planContent = planData?.survivorshipPlan?.planContent as Record<string, unknown> | undefined;
  const careTeamFromPlan = (planContent?.careTeam as { whoToCallFor?: { concern: string; contact: string; urgency: string }[] })?.whoToCallFor ?? [];
  const events = scheduleData?.surveillanceSchedule ?? [];

  // Find next upcoming event
  const now = new Date();
  const nextEvent = events
    .filter(e => e.status === 'upcoming' && e.dueDate && new Date(e.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

  // Form state
  const [symptomInput, setSymptomInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Oncologist');
  const [formPractice, setFormPractice] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formContactFor, setFormContactFor] = useState<string[]>([]);

  const routingResult = routingData?.routeSymptom;
  const prep = prepData?.generateAppointmentPrep;

  function resetForm() {
    setFormName('');
    setFormRole('Oncologist');
    setFormPractice('');
    setFormPhone('');
    setFormContactFor([]);
  }

  function startEdit(member: typeof team[0]) {
    setEditingId(member.id);
    setFormName(member.name);
    setFormRole(member.role);
    setFormPractice(member.practice ?? '');
    setFormPhone(member.phone ?? '');
    setFormContactFor([...member.contactFor]);
  }

  function toggleContactFor(item: string) {
    setFormContactFor(prev =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  }

  function handleSubmitSymptom() {
    if (!symptomInput.trim()) return;
    routeSymptom({ variables: { symptom: symptomInput.trim() } });
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Care Team
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Your providers, symptom routing, and appointment prep
        </Text>

        {/* ============================================================= */}
        {/* Who should I call? */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          borderWidth: 1,
          borderColor: '#C7D2FE',
          backgroundColor: '#EEF2FF',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#3730A3' }}>
            Who should I call?
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '#4338CA' }}>
            Describe your symptom or concern and we'll recommend who to contact
          </Text>

          <View sx={{ mt: '$3' }}>
            <TextInput
              value={symptomInput}
              onChangeText={setSymptomInput}
              placeholder="e.g., new pain in my side, feeling very anxious..."
              placeholderTextColor="#94A3B8"
              style={{
                borderWidth: 1,
                borderColor: '#C7D2FE',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                backgroundColor: 'white',
                color: '#1E293B',
              }}
              multiline
              numberOfLines={2}
            />
            {routing ? (
              <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 13, color: '#4338CA' }}>Analyzing your concern...</Text>
              </View>
            ) : (
              <Pressable onPress={handleSubmitSymptom}>
                <View sx={{
                  mt: '$3',
                  backgroundColor: '#4338CA',
                  borderRadius: 8,
                  px: '$4',
                  py: '$3',
                  alignSelf: 'flex-start',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                    Get recommendation
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {routingResult && (
            <View sx={{
              mt: '$4',
              backgroundColor: 'white',
              borderRadius: 10,
              p: '$4',
              borderWidth: 1,
              borderColor: '#E0E7FF',
            }}>
              {/* Emergency override */}
              {routingResult.urgency === 'emergency' && (
                <View sx={{
                  backgroundColor: '#FEE2E2',
                  borderRadius: 8,
                  p: '$3',
                  mb: '$3',
                }}>
                  <Text sx={{ fontSize: 15, fontWeight: 'bold', color: '#991B1B' }}>
                    {routingResult.immediateAction}
                  </Text>
                </View>
              )}

              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <UrgencyBadge urgency={routingResult.urgency} />
                {routingResult.providerName && (
                  <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                    Contact: {routingResult.providerName}
                  </Text>
                )}
              </View>
              {routingResult.providerRole && (
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                  {routingResult.providerRole}
                  {routingResult.providerPhone && ` \u2022 ${routingResult.providerPhone}`}
                </Text>
              )}
              <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                {routingResult.reasoning}
              </Text>
              {routingResult.immediateAction && routingResult.urgency !== 'emergency' && (
                <View sx={{
                  mt: '$2',
                  backgroundColor: '#FEF3C7',
                  borderRadius: 8,
                  p: '$3',
                }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: '#92400E' }}>
                    In the meantime: {routingResult.immediateAction}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Your Providers */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <View sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '$border',
            pb: '$3',
          }}>
            <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
              Your Providers
            </Text>
            {!showAddForm && (
              <Pressable onPress={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}>
                <View sx={{
                  backgroundColor: 'blue600',
                  borderRadius: 8,
                  px: '$3',
                  py: '$2',
                }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                    + Add Provider
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {teamLoading && (
            <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Loading...</Text>
            </View>
          )}

          {/* Add/Edit form */}
          {(showAddForm || editingId) && (
            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$4',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$3' }}>
                {editingId ? 'Edit Provider' : 'Add Provider'}
              </Text>

              <FormField label="Name *">
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Dr. Jane Smith"
                  placeholderTextColor="#94A3B8"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Role">
                <Picker
                  value={formRole}
                  onValueChange={setFormRole}
                  options={ROLE_OPTIONS}
                />
              </FormField>

              <FormField label="Practice">
                <TextInput
                  value={formPractice}
                  onChangeText={setFormPractice}
                  placeholder="Memorial Sloan Kettering"
                  placeholderTextColor="#94A3B8"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Phone">
                <TextInput
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#94A3B8"
                  style={inputStyle}
                  keyboardType="phone-pad"
                />
              </FormField>

              <FormField label="Contact for">
                <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
                  {CONTACT_FOR_OPTIONS.map(opt => (
                    <Pressable key={opt} onPress={() => toggleContactFor(opt)}>
                      <View sx={{
                        borderRadius: 20,
                        px: '$3',
                        py: '$2',
                        borderWidth: 1,
                        borderColor: formContactFor.includes(opt) ? 'blue600' : '$border',
                        backgroundColor: formContactFor.includes(opt) ? '#DBEAFE' : 'transparent',
                      }}>
                        <Text sx={{
                          fontSize: 12,
                          color: formContactFor.includes(opt) ? '#1E40AF' : '$mutedForeground',
                        }}>
                          {opt}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </FormField>

              <View sx={{ flexDirection: 'row', gap: '$2', mt: '$3' }}>
                <Pressable onPress={() => {
                  if (editingId) {
                    updateMember({
                      variables: {
                        input: {
                          memberId: editingId,
                          name: formName || undefined,
                          role: formRole || undefined,
                          practice: formPractice || undefined,
                          phone: formPhone || undefined,
                          contactFor: formContactFor,
                        },
                      },
                    });
                  } else {
                    if (!formName.trim()) return;
                    addMember({
                      variables: {
                        input: {
                          name: formName.trim(),
                          role: formRole,
                          practice: formPractice || undefined,
                          phone: formPhone || undefined,
                          contactFor: formContactFor,
                        },
                      },
                    });
                  }
                }}>
                  <View sx={{
                    backgroundColor: 'blue600',
                    borderRadius: 8,
                    px: '$4',
                    py: '$3',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                      {adding || updating ? 'Saving...' : editingId ? 'Update' : 'Add'}
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => { setShowAddForm(false); setEditingId(null); resetForm(); }}>
                  <View sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 8,
                    px: '$4',
                    py: '$3',
                  }}>
                    <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {/* Provider list */}
          {!teamLoading && team.length === 0 && !showAddForm && (
            <View sx={{
              mt: '$4',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '$border',
              borderRadius: 12,
              p: '$6',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
                Add your care team members
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center', maxWidth: 360 }}>
                Adding your providers enables personalized symptom routing — we'll tell you exactly who to call for what.
              </Text>
            </View>
          )}

          <View sx={{ mt: '$4', gap: '$3' }}>
            {team.map(member => (
              <View key={member.id} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$4',
              }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {member.name}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                      {member.role}
                      {member.practice && ` \u2022 ${member.practice}`}
                    </Text>
                    {member.phone && (
                      <Text sx={{ mt: '$1', fontSize: 13, color: 'blue600' }}>
                        {member.phone}
                      </Text>
                    )}
                  </View>
                  <View sx={{ flexDirection: 'row', gap: '$2' }}>
                    <Pressable onPress={() => startEdit(member)}>
                      <Text sx={{ fontSize: 12, color: 'blue600' }}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => removeMember({ variables: { memberId: member.id } })}>
                      <Text sx={{ fontSize: 12, color: '#DC2626' }}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
                {member.contactFor.length > 0 && (
                  <View sx={{ mt: '$2', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
                    {member.contactFor.map(cf => (
                      <View key={cf} sx={{
                        backgroundColor: '#F1F5F9',
                        borderRadius: 6,
                        px: 6,
                        py: 2,
                      }}>
                        <Text sx={{ fontSize: 10, color: '#64748B' }}>{cf}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ============================================================= */}
        {/* From Your Care Plan */}
        {/* ============================================================= */}
        {careTeamFromPlan.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                From Your Care Plan
              </Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                Suggested by your survivorship care plan
              </Text>
            </View>
            <View sx={{ mt: '$4', gap: '$2' }}>
              {careTeamFromPlan.map((item, i) => (
                <View key={i} sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '$3',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 10,
                  p: '$3',
                }}>
                  <View sx={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: item.urgency === 'emergency' ? '#EF4444'
                      : item.urgency === 'urgent' ? '#F59E0B'
                      : item.urgency === 'routine' ? '#22C55E' : '#3B82F6',
                  }} />
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      {item.concern}
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                      {item.contact} \u2022 {item.urgency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Appointment Prep */}
        {/* ============================================================= */}
        {nextEvent && (
          <View sx={{ mt: '$8' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                Appointment Prep
              </Text>
            </View>

            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$4',
            }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                {nextEvent.title}
              </Text>
              {nextEvent.dueDate && (
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                  Due {new Date(nextEvent.dueDate).toLocaleDateString()}
                </Text>
              )}

              {!prep && (
                prepping ? (
                  <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator size="small" />
                    <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                      Preparing your appointment guide...
                    </Text>
                  </View>
                ) : (
                  <Pressable onPress={() => generatePrep({ variables: { eventId: nextEvent.id } })}>
                    <View sx={{
                      mt: '$3',
                      backgroundColor: 'blue600',
                      borderRadius: 8,
                      px: '$4',
                      py: '$3',
                      alignSelf: 'flex-start',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                        Generate prep document
                      </Text>
                    </View>
                  </Pressable>
                )
              )}
            </View>

            {prep && (
              <View sx={{ mt: '$4', gap: '$3' }}>
                {/* Symptom trends */}
                {prep.symptomSummary.length > 0 && (
                  <PrepSection title="Symptom Trends (Last 30 Days)">
                    {prep.symptomSummary.map((s, i) => (
                      <View key={i} sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: '$2',
                        borderBottomWidth: i < prep.symptomSummary.length - 1 ? 1 : 0,
                        borderBottomColor: '#F1F5F9',
                      }}>
                        <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                          {s.dimension}
                        </Text>
                        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                          {s.average != null && (
                            <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                              avg {s.average.toFixed(1)}
                            </Text>
                          )}
                          <TrendBadge trend={s.trend} />
                        </View>
                      </View>
                    ))}
                  </PrepSection>
                )}

                {/* Completed since */}
                {prep.completedSince.length > 0 && (
                  <PrepSection title="Completed Since Last Visit">
                    {prep.completedSince.map((item, i) => (
                      <Text key={i} sx={{ fontSize: 13, color: '#166534', lineHeight: 20 }}>
                        {'\u2713'} {item}
                      </Text>
                    ))}
                  </PrepSection>
                )}

                {/* Overdue */}
                {prep.overdueItems.length > 0 && (
                  <PrepSection title="Overdue Items" bg="#FEF2F2" borderColor="#FECACA">
                    {prep.overdueItems.map((item, i) => (
                      <Text key={i} sx={{ fontSize: 13, color: '#991B1B', lineHeight: 20 }}>
                        {'\u2022'} {item}
                      </Text>
                    ))}
                  </PrepSection>
                )}

                {/* Upcoming tests */}
                {prep.upcomingTests.length > 0 && (
                  <PrepSection title="Other Upcoming Tests">
                    {prep.upcomingTests.map((item, i) => (
                      <Text key={i} sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                        {'\u2022'} {item}
                      </Text>
                    ))}
                  </PrepSection>
                )}

                {/* Questions to ask */}
                {prep.questionsToAsk.length > 0 && (
                  <PrepSection title="Questions to Ask">
                    {prep.questionsToAsk.map((q, i) => (
                      <View key={i} sx={{ mb: '$2' }}>
                        <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', lineHeight: 20 }}>
                          {q.question}
                        </Text>
                        <Text sx={{ fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                          {q.context}
                        </Text>
                      </View>
                    ))}
                  </PrepSection>
                )}

                {/* Medication notes */}
                {prep.medicationNotes.length > 0 && (
                  <PrepSection title="Medication Notes">
                    {prep.medicationNotes.map((note, i) => (
                      <Text key={i} sx={{ fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                        {'\u2022'} {note}
                      </Text>
                    ))}
                  </PrepSection>
                )}

                <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                  Generated {new Date(prep.generatedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}

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
            Symptom routing suggestions are AI-generated and not a substitute for medical advice. In any
            emergency, call 911 immediately. Always use your own judgment when deciding how urgently to seek care.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function UrgencyBadge({ urgency }: { urgency: string }) {
  const colors = URGENCY_COLORS[urgency] ?? { bg: '#F1F5F9', fg: '#64748B' };
  return (
    <View sx={{ backgroundColor: colors.bg, borderRadius: 12, px: '$2', py: 3 }}>
      <Text sx={{ fontSize: 11, fontWeight: 'bold', color: colors.fg, textTransform: 'uppercase' }}>
        {urgency}
      </Text>
    </View>
  );
}

function TrendBadge({ trend }: { trend: string }) {
  const colors = trend === 'improving' ? { bg: '#DCFCE7', fg: '#166534' }
    : trend === 'worsening' ? { bg: '#FEE2E2', fg: '#991B1B' }
    : { bg: '#F1F5F9', fg: '#64748B' };
  return (
    <View sx={{ backgroundColor: colors.bg, borderRadius: 6, px: 6, py: 2 }}>
      <Text sx={{ fontSize: 10, fontWeight: '600', color: colors.fg }}>{trend}</Text>
    </View>
  );
}

function PrepSection({
  title,
  children,
  bg,
  borderColor,
}: {
  title: string;
  children: React.ReactNode;
  bg?: string;
  borderColor?: string;
}) {
  return (
    <View sx={{
      borderWidth: 1,
      borderColor: borderColor ?? '$border',
      backgroundColor: bg ?? 'transparent',
      borderRadius: 12,
      p: '$4',
    }}>
      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$2' }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View sx={{ mb: '$3' }}>
      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground', mb: '$1' }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 8,
  padding: 10,
  fontSize: 14,
  backgroundColor: 'white',
  color: '#1E293B',
} as const;
