import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useGetAppealRightsQuery } from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function AppealRightsScreen() {
  const { data, loading } = useGetAppealRightsQuery({ errorPolicy: 'ignore' });

  const [expandedAca, setExpandedAca] = useState(true);
  const [expandedState, setExpandedState] = useState(true);
  const [expandedPeer, setExpandedPeer] = useState(false);
  const [expandedExternal, setExpandedExternal] = useState(false);
  const [expandedErisa, setExpandedErisa] = useState(false);

  const rights = data?.appealRights;
  const aca = rights?.acaRights;
  const state = rights?.stateProtections;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Your Appeal Rights</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading appeal rights...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Your Appeal Rights
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Know what protections are available to you under federal and state law
        </Text>

        {/* ACA Protections */}
        <View sx={{ mt: '$6' }}>
          <CollapsibleHeader
            title="ACA Federal Protections"
            expanded={expandedAca}
            onToggle={() => setExpandedAca(!expandedAca)}
          />

          {expandedAca && (
            <View sx={{
              mt: '$3',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <RightRow
                title="Internal appeal deadline"
                description={`You have ${aca?.internalAppealDays ?? 180} days to file an internal appeal after receiving a denial. File as soon as possible — earlier is better.`}
                icon="clock"
                highlight
              />
              <RightRow
                title="Urgent appeals"
                description={`For urgent medical situations, your insurer must respond within ${aca?.urgentInternalHours ?? 72} hours. This applies when delay could seriously jeopardize your health, life, or ability to regain maximum function.`}
                icon="urgent"
              />
              <RightRow
                title="External review"
                description={
                  aca?.externalReviewAvailable !== false
                    ? `External review by an independent reviewer is available if your internal appeal is denied. You have ${aca?.externalReviewDays ?? 60} days after an internal appeal denial to request external review. The external reviewer's decision is binding on the insurer.`
                    : 'External review information is not available for your plan type. Contact your state insurance department for guidance.'
                }
                icon="external"
              />
              <RightRow
                title="Continuation of coverage"
                description={
                  aca?.continuationOfCoverage !== false
                    ? 'If you are currently receiving treatment that is being denied for continued coverage, your benefits must continue during the internal appeal process. This is critical for ongoing cancer treatments.'
                    : 'Continuation of coverage protections may vary by plan. Check with your plan administrator.'
                }
                icon="coverage"
              />
              <RightRow
                title="No retaliation"
                description="Your insurer cannot cancel your coverage, raise your premiums, or take any other retaliatory action because you filed an appeal. This protection is absolute."
                icon="shield"
                last
              />
            </View>
          )}
        </View>

        {/* State Protections */}
        <View sx={{ mt: '$6' }}>
          <CollapsibleHeader
            title="State-Specific Protections"
            expanded={expandedState}
            onToggle={() => setExpandedState(!expandedState)}
          />

          {expandedState && (
            <View sx={{ mt: '$3' }}>
              {state ? (
                <View sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {state.fertilityMandate && (
                    <RightRow
                      title="Fertility preservation mandate"
                      description="Your state requires insurers to cover fertility preservation for patients whose medical treatment may cause infertility. This includes egg/sperm freezing before cancer treatment."
                      icon="fertility"
                    />
                  )}
                  {state.clinicalTrialCoverage && (
                    <RightRow
                      title="Clinical trial coverage"
                      description="Your state requires insurers to cover routine patient care costs associated with clinical trial participation. The trial drug itself may be provided by the trial sponsor, but labs, imaging, and doctor visits must be covered."
                      icon="trial"
                    />
                  )}
                  {state.stepTherapyProtection && (
                    <RightRow
                      title="Step therapy protection"
                      description="Your state has protections against step therapy (fail-first) requirements for cancer patients. Insurers cannot force you to try cheaper treatments first if your oncologist recommends a specific therapy."
                      icon="therapy"
                    />
                  )}
                  {state.cancerSpecific && (
                    <RightRow
                      title="Cancer-specific protections"
                      description={state.cancerSpecific}
                      icon="cancer"
                      last
                    />
                  )}
                  {!state.fertilityMandate && !state.clinicalTrialCoverage && !state.stepTherapyProtection && !state.cancerSpecific && (
                    <RightRow
                      title="Limited state-specific protections"
                      description="Your state has limited cancer-specific insurance protections beyond federal requirements. Federal ACA protections still apply."
                      icon="info"
                      last
                    />
                  )}
                </View>
              ) : (
                <View sx={{
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$5',
                  alignItems: 'center',
                }}>
                  <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
                    Enter your state in your profile to see state-specific protections that may apply to your insurance plan.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Peer-to-Peer Review */}
        <View sx={{ mt: '$6' }}>
          <CollapsibleHeader
            title="What is a Peer-to-Peer Review?"
            expanded={expandedPeer}
            onToggle={() => setExpandedPeer(!expandedPeer)}
          />

          {expandedPeer && (
            <View sx={{
              mt: '$3',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                A peer-to-peer review is a phone call between your treating physician and the insurance
                company's medical director. During this call, your doctor can explain why the denied
                service is medically necessary for your specific situation.
              </Text>
              <View sx={{ mt: '$4', gap: '$2' }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>Key points:</Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {'\u2022'} You have the right to request a peer-to-peer review as part of the appeal process
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {'\u2022'} The reviewing physician should be in the same or similar specialty as your treating doctor
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {'\u2022'} Your doctor should reference NCCN guidelines, FDA approvals, and published literature
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {'\u2022'} Many denials are overturned at this stage — the reviewing physician often lacks full clinical context
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {'\u2022'} Use our "Generate Peer-to-Peer Prep" tool to prepare your doctor for the call
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* External Review Process */}
        <View sx={{ mt: '$6' }}>
          <CollapsibleHeader
            title="External Review Process"
            expanded={expandedExternal}
            onToggle={() => setExpandedExternal(!expandedExternal)}
          />

          {expandedExternal && (
            <View sx={{
              mt: '$3',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                If your internal appeal is denied, you can request an external review by an
                independent third party. The external reviewer is not employed by your insurance
                company and provides an unbiased evaluation.
              </Text>
              <View sx={{ mt: '$4', gap: '$2' }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>How it works:</Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  1. Your internal appeal must be completed (or qualify for expedited external review)
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  2. Request external review within 4 months of the internal appeal denial
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  3. An independent review organization (IRO) is assigned to your case
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  4. The IRO reviews all medical records, guidelines, and your appeal
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  5. Decision is typically rendered within 45 days (72 hours for urgent cases)
                </Text>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  6. The external reviewer's decision is binding on the insurer
                </Text>
              </View>
              <View sx={{
                mt: '$4',
                backgroundColor: '#DCFCE7',
                borderRadius: 8,
                p: '$3',
              }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>
                  External review overturns about 40-50% of cancer-related denials.
                  Do not give up after an internal appeal denial.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ERISA vs State */}
        <View sx={{ mt: '$6' }}>
          <CollapsibleHeader
            title="ERISA vs State-Regulated Plans"
            expanded={expandedErisa}
            onToggle={() => setExpandedErisa(!expandedErisa)}
          />

          {expandedErisa && (
            <View sx={{
              mt: '$3',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                The type of insurance plan you have determines which regulations apply.
                This distinction matters for your appeal rights.
              </Text>

              <View sx={{ mt: '$4', gap: '$4' }}>
                <View sx={{
                  backgroundColor: '#DBEAFE',
                  borderRadius: 10,
                  p: '$4',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: 'bold', color: '#1E40AF' }}>
                    Self-funded (ERISA) plans
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '#1E3A8A', lineHeight: 20 }}>
                    Most large employer plans are self-funded and regulated by federal ERISA law, not state
                    law. This means state-specific protections (like fertility mandates) may not apply.
                    However, ACA federal protections including external review still apply.
                  </Text>
                </View>

                <View sx={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 10,
                  p: '$4',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: 'bold', color: '#166534' }}>
                    Fully-insured (state-regulated) plans
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                    Marketplace plans, small employer plans, and individual plans are regulated by
                    your state's insurance department. All state-specific protections apply, and you
                    can file complaints with your state insurance commissioner.
                  </Text>
                </View>
              </View>

              <Text sx={{ mt: '$4', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                Not sure which type you have? Check your plan documents for "self-funded" or "self-insured"
                language, or call your HR department. Your Summary Plan Description (SPD) will specify the
                plan type.
              </Text>
            </View>
          )}
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
            This information is for educational purposes only and is not legal advice. Insurance
            regulations vary by state and plan type. Consult with a patient advocate or healthcare
            attorney for guidance specific to your situation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function CollapsibleHeader({
  title,
  expanded,
  onToggle,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle}>
      <View sx={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '$border',
        pb: '$3',
      }}>
        <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
          {title}
        </Text>
        <Text sx={{ fontSize: 18, color: '$mutedForeground' }}>
          {expanded ? '\u2212' : '+'}
        </Text>
      </View>
    </Pressable>
  );
}

function RightRow({
  title,
  description,
  icon: _icon,
  highlight,
  last,
}: {
  title: string;
  description: string;
  icon: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <View sx={{
      p: '$4',
      backgroundColor: highlight ? '#F0F9FF' : 'transparent',
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: '#F3F4F6',
    }}>
      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
        {title}
      </Text>
      <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
        {description}
      </Text>
    </View>
  );
}
