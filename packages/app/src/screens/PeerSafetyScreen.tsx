import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { Link } from 'solito/link';
import { useGetPeerConnectionsQuery, useReportPeerConcernMutation } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const CONCERN_TYPES = [
  { id: 'medical_advice', label: 'Giving Medical Advice', description: 'Your peer is telling you what treatment to pursue or making medical recommendations' },
  { id: 'boundary_violation', label: 'Boundary Violation', description: 'Your peer is pushing past boundaries you set or making you uncomfortable' },
  { id: 'harassment', label: 'Harassment', description: 'Inappropriate behavior, language, or unwanted contact' },
  { id: 'crisis_concern', label: 'Crisis Concern', description: 'You are worried your peer may be in crisis or having thoughts of self-harm' },
  { id: 'other', label: 'Other', description: 'Something else that concerns you about this connection' },
];

const CRISIS_RESOURCES = [
  { name: '988 Suicide & Crisis Lifeline', phone: '988', description: 'Free, confidential support 24/7' },
  { name: 'Crisis Text Line', phone: 'Text HOME to 741741', description: 'Free crisis counseling via text' },
  { name: 'Cancer Support Helpline', phone: '1-888-793-9355', description: 'CancerCare professional social workers' },
];

// ============================================================================
// Component
// ============================================================================

export function PeerSafetyScreen() {
  const router = useRouter();
  const { data } = useGetPeerConnectionsQuery({ errorPolicy: 'ignore' });
  const [reportMutation, { loading: reporting }] = useReportPeerConcernMutation();

  const activeConnections = (data?.peerConnections ?? []).filter(c => c.status === 'active');
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedConnection || !selectedConcern || !description.trim()) return;
    await reportMutation({
      variables: {
        connectionId: selectedConnection,
        concernType: selectedConcern,
        description: description.trim(),
      },
    });
    setSubmitted(true);
  };

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Safety & Guidelines</Text>

        {/* Crisis Resources — Always Visible */}
        <View sx={{ mt: '$6', bg: '#FEF2F2', borderRadius: 12, p: '$5' }}>
          <Text sx={{ fontSize: 18, fontWeight: '700', color: '#991B1B' }}>
            If you or someone you know is in crisis
          </Text>
          <View sx={{ mt: '$3', gap: '$3' }}>
            {CRISIS_RESOURCES.map(r => (
              <View key={r.name} sx={{ bg: '#FFFFFF', borderRadius: 10, p: '$3' }}>
                <Text sx={{ fontSize: 15, fontWeight: '700', color: '#DC2626' }}>{r.name}</Text>
                <Text sx={{ fontSize: 18, fontWeight: '700', color: '#991B1B', mt: 2 }}>{r.phone}</Text>
                <Text sx={{ fontSize: 13, color: '#7F1D1D', mt: 2 }}>{r.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Community Guidelines */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 20, fontWeight: '700', color: '$foreground' }}>Community Guidelines</Text>
          <View sx={{ mt: '$3', gap: '$4' }}>
            <View sx={{ bg: '#DCFCE7', borderRadius: 10, p: '$4' }}>
              <Text sx={{ fontSize: 15, fontWeight: '700', color: '#166534' }}>Do</Text>
              <View sx={{ mt: '$2', gap: '$1' }}>
                <Text sx={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>• Share your personal experience</Text>
                <Text sx={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>• Listen actively and validate feelings</Text>
                <Text sx={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>• Respect boundaries — yours and theirs</Text>
                <Text sx={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>• Ask open-ended questions</Text>
                <Text sx={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>• Take breaks when you need them</Text>
              </View>
            </View>

            <View sx={{ bg: '#FEE2E2', borderRadius: 10, p: '$4' }}>
              <Text sx={{ fontSize: 15, fontWeight: '700', color: '#991B1B' }}>Don't</Text>
              <View sx={{ mt: '$2', gap: '$1' }}>
                <Text sx={{ fontSize: 14, color: '#991B1B', lineHeight: 22 }}>• Give medical advice or treatment recommendations</Text>
                <Text sx={{ fontSize: 14, color: '#991B1B', lineHeight: 22 }}>• Diagnose or interpret test results</Text>
                <Text sx={{ fontSize: 14, color: '#991B1B', lineHeight: 22 }}>• Push past stated boundaries</Text>
                <Text sx={{ fontSize: 14, color: '#991B1B', lineHeight: 22 }}>• Share others' information without consent</Text>
                <Text sx={{ fontSize: 14, color: '#991B1B', lineHeight: 22 }}>• Ignore signs of crisis</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Report a Concern */}
        {activeConnections.length > 0 && !submitted && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 20, fontWeight: '700', color: '$foreground' }}>Report a Concern</Text>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: '$2', lineHeight: 22 }}>
              If something in a peer connection doesn't feel right, let us know. All reports are reviewed by our team.
            </Text>

            {/* Select Connection */}
            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$2' }}>Which connection?</Text>
              <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
                {activeConnections.map(c => (
                  <Pressable key={c.id} onPress={() => setSelectedConnection(c.id)}>
                    <View sx={{
                      px: '$4', py: '$2', borderRadius: 8,
                      bg: selectedConnection === c.id ? '#7C3AED' : '$card',
                      borderWidth: 1, borderColor: selectedConnection === c.id ? '#7C3AED' : '$border',
                    }}>
                      <Text sx={{
                        fontSize: 13, fontWeight: '600',
                        color: selectedConnection === c.id ? '#FFFFFF' : '$foreground',
                      }}>
                        {c.role === 'mentor' ? 'Mentee' : 'Mentor'} ({c.id.slice(0, 8)}...)
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Select Concern Type */}
            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$2' }}>Type of concern</Text>
              <View sx={{ gap: '$2' }}>
                {CONCERN_TYPES.map(ct => (
                  <Pressable key={ct.id} onPress={() => setSelectedConcern(ct.id)}>
                    <View sx={{
                      p: '$3', borderRadius: 10,
                      bg: selectedConcern === ct.id ? '#F5F3FF' : '$card',
                      borderWidth: 1, borderColor: selectedConcern === ct.id ? '#7C3AED' : '$border',
                    }}>
                      <Text sx={{
                        fontSize: 14, fontWeight: '600',
                        color: selectedConcern === ct.id ? '#7C3AED' : '$foreground',
                      }}>{ct.label}</Text>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>{ct.description}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$2' }}>Describe what happened</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholder="Please describe the situation..."
                sx={{
                  borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
                  fontSize: 14, color: '$foreground', bg: '$card', minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={!selectedConnection || !selectedConcern || !description.trim() || reporting}
              sx={{ mt: '$4' }}
            >
              <View sx={{
                bg: (selectedConnection && selectedConcern && description.trim()) ? '#EF4444' : '#E5E7EB',
                py: '$3', borderRadius: 10, alignItems: 'center',
              }}>
                {reporting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text sx={{
                    color: (selectedConnection && selectedConcern && description.trim()) ? '#FFFFFF' : '#9CA3AF',
                    fontSize: 15, fontWeight: '700',
                  }}>
                    Submit Report
                  </Text>
                )}
              </View>
            </Pressable>
          </View>
        )}

        {submitted && (
          <View sx={{ mt: '$8', bg: '#DCFCE7', borderRadius: 12, p: '$5', alignItems: 'center' }}>
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '#166534' }}>Report Submitted</Text>
            <Text sx={{ fontSize: 14, color: '#166534', mt: '$2', textAlign: 'center' }}>
              Thank you for reporting. Our team will review this and take appropriate action.
            </Text>
          </View>
        )}

        <View sx={{ mt: '$6' }}>
          <Link href="/peers">
            <Text sx={{ fontSize: 14, color: '#7C3AED', fontWeight: '600' }}>Back to Peer Support</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
