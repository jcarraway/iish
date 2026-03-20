import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetIngestionSyncStatesQuery,
  useTriggerIngestionMutation,
  useGetFeedConfigQuery,
  useUpdateFeedConfigMutation,
} from '../generated/graphql';

// ============================================================================
// Source metadata
// ============================================================================

const SOURCE_INFO: Record<string, { name: string; description: string; badge: string; badgeColor: string; badgeBg: string }> = {
  pubmed: {
    name: 'PubMed',
    description: 'Peer-reviewed biomedical literature from the National Library of Medicine. 11 breast cancer search terms.',
    badge: 'Academic',
    badgeColor: '#1E40AF',
    badgeBg: '#DBEAFE',
  },
  fda: {
    name: 'FDA openFDA',
    description: 'Drug label updates and adverse event reports from the U.S. Food and Drug Administration.',
    badge: 'Federal',
    badgeColor: '#166534',
    badgeBg: '#DCFCE7',
  },
  preprints: {
    name: 'bioRxiv / medRxiv',
    description: 'Pre-peer-review manuscripts from bioRxiv and medRxiv preprint servers.',
    badge: 'Preprint',
    badgeColor: '#92400E',
    badgeBg: '#FEF3C7',
  },
  clinicaltrials: {
    name: 'ClinicalTrials.gov',
    description: 'New registrations and results postings from the federal clinical trials registry.',
    badge: 'Federal',
    badgeColor: '#166534',
    badgeBg: '#DCFCE7',
  },
  institutions: {
    name: 'Institutional Newsrooms',
    description: 'Cancer research news from NCI, MSK, MD Anderson, Dana-Farber, Mayo, Hopkins, and Cleveland Clinic.',
    badge: 'News',
    badgeColor: '#6B21A8',
    badgeBg: '#F3E8FF',
  },
  nih_reporter: {
    name: 'NIH Reporter',
    description: 'Funded research grants from the National Institutes of Health breast cancer portfolio.',
    badge: 'Federal',
    badgeColor: '#166534',
    badgeBg: '#DCFCE7',
  },
};

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

// ============================================================================
// Feed config options
// ============================================================================

const AUDIENCE_OPTIONS = [
  { key: 'patient', label: 'Patient' },
  { key: 'clinician', label: 'Clinician' },
];

const DEPTH_OPTIONS = [
  { key: 'simplified', label: 'Simplified' },
  { key: 'standard', label: 'Standard' },
  { key: 'detailed', label: 'Detailed' },
];

// ============================================================================
// Screen
// ============================================================================

export function IntelSettingsScreen() {
  const { data, loading, error, refetch } = useGetIngestionSyncStatesQuery();
  const [triggerIngestion] = useTriggerIngestionMutation();
  const [syncingSource, setSyncingSource] = useState<string | null>(null);

  // Feed config
  const { data: configData, loading: configLoading } = useGetFeedConfigQuery();
  const [updateConfig] = useUpdateFeedConfigMutation();

  const handleSync = async (sourceId: string) => {
    setSyncingSource(sourceId);
    try {
      await triggerIngestion({ variables: { sourceId } });
      await refetch();
    } catch (err) {
      console.error(`Sync failed for ${sourceId}:`, err);
    } finally {
      setSyncingSource(null);
    }
  };

  const handleConfigUpdate = async (field: string, value: any) => {
    await updateConfig({
      variables: { input: { [field]: value } },
      optimisticResponse: {
        updateFeedConfig: {
          __typename: 'UserFeedConfig',
          id: configData?.feedConfig?.id ?? 'temp',
          audienceType: field === 'audienceType' ? value : (configData?.feedConfig?.audienceType ?? 'patient'),
          contentDepth: field === 'contentDepth' ? value : (configData?.feedConfig?.contentDepth ?? 'standard'),
          showPreclinical: field === 'showPreclinical' ? value : (configData?.feedConfig?.showPreclinical ?? true),
          showNegativeResults: field === 'showNegativeResults' ? value : (configData?.feedConfig?.showNegativeResults ?? true),
        },
      },
    });
  };

  const syncStates = data?.ingestionSyncStates ?? [];
  const allSourceIds = ['pubmed', 'fda', 'preprints', 'clinicaltrials', 'institutions', 'nih_reporter'];
  const config = configData?.feedConfig;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Intel Settings
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Manage data sources and personalize your research feed.
        </Text>

        {/* Feed Preferences */}
        {!configLoading && config && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '$foreground', mb: '$4' }}>
              Feed Preferences
            </Text>

            {/* Audience type */}
            <View sx={{ mb: '$4' }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                AUDIENCE
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$2' }}>
                {AUDIENCE_OPTIONS.map(opt => {
                  const active = config.audienceType === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => handleConfigUpdate('audienceType', opt.key)}
                      sx={{
                        borderRadius: 20,
                        px: '$4',
                        py: '$2',
                        backgroundColor: active ? '#7C3AED' : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? '#7C3AED' : '$border',
                      }}
                    >
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: active ? 'white' : '$mutedForeground' }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Content depth */}
            <View sx={{ mb: '$4' }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                CONTENT DEPTH
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$2' }}>
                {DEPTH_OPTIONS.map(opt => {
                  const active = config.contentDepth === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => handleConfigUpdate('contentDepth', opt.key)}
                      sx={{
                        borderRadius: 20,
                        px: '$4',
                        py: '$2',
                        backgroundColor: active ? '#7C3AED' : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? '#7C3AED' : '$border',
                      }}
                    >
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: active ? 'white' : '$mutedForeground' }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Toggles */}
            <View sx={{ gap: '$3' }}>
              <Pressable
                onPress={() => handleConfigUpdate('showPreclinical', !config.showPreclinical)}
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: '$3',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                }}
              >
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    Show preclinical research
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                    Include T4 (early) and T5 (hypothesis) tier items
                  </Text>
                </View>
                <View sx={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: config.showPreclinical ? '#7C3AED' : '#D1D5DB',
                  justifyContent: 'center',
                  paddingLeft: config.showPreclinical ? 22 : 2,
                }}>
                  <View sx={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' }} />
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleConfigUpdate('showNegativeResults', !config.showNegativeResults)}
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: '$3',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                }}
              >
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    Show negative results
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                    Include studies with negative or null findings
                  </Text>
                </View>
                <View sx={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: config.showNegativeResults ? '#7C3AED' : '#D1D5DB',
                  justifyContent: 'center',
                  paddingLeft: config.showNegativeResults ? 22 : 2,
                }}>
                  <View sx={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' }} />
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Research Digest */}
        {!configLoading && config && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '$foreground', mb: '$4' }}>
              Research Digest
            </Text>
            <View sx={{ mb: '$3' }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                EMAIL FREQUENCY
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                {[
                  { key: null, label: 'Off' },
                  { key: 'daily', label: 'Daily' },
                  { key: 'weekly', label: 'Weekly' },
                  { key: 'monthly', label: 'Monthly' },
                ].map(opt => {
                  const active = ((config as any).digestFrequency ?? null) === opt.key;
                  return (
                    <Pressable
                      key={opt.key ?? 'off'}
                      onPress={() => handleConfigUpdate('digestFrequency', opt.key)}
                      sx={{
                        borderRadius: 20,
                        px: '$4',
                        py: '$2',
                        backgroundColor: active ? '#7C3AED' : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? '#7C3AED' : '$border',
                      }}
                    >
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: active ? 'white' : '$mutedForeground' }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }}>
                Get a personalized summary of new research, safety alerts, and community highlights.
              </Text>
            </View>
            {(config as any).digestFrequency && (
              <Link href="/intel/community">
                <Text sx={{ fontSize: 13, color: '#2563EB' }}>Preview next digest →</Text>
              </Link>
            )}
          </View>
        )}

        {/* Ingestion Sources */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 18, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            Ingestion Sources
          </Text>
          <Text sx={{ fontSize: 14, color: '$mutedForeground', mb: '$4' }}>
            Each source feeds into the classify → summarize → QC pipeline.
          </Text>

          {loading ? (
            <View sx={{ mt: '$4', alignItems: 'center' }}>
              <ActivityIndicator size="small" />
              <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>Loading sources...</Text>
            </View>
          ) : error ? (
            <View sx={{ mt: '$4', p: '$4', backgroundColor: '#FEF2F2', borderRadius: 8 }}>
              <Text sx={{ fontSize: 14, color: '#DC2626' }}>Failed to load ingestion sources. Please sign in to manage sources.</Text>
            </View>
          ) : (
            <View sx={{ gap: '$4' }}>
              {allSourceIds.map(sourceId => {
                const info = SOURCE_INFO[sourceId] ?? { name: sourceId, description: '', badge: '?', badgeColor: '#6B7280', badgeBg: '#F3F4F6' };
                const state = syncStates.find((s: any) => s.sourceId === sourceId);
                const isSyncing = syncingSource === sourceId;

                return (
                  <View key={sourceId} sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    {/* Header: name + badge */}
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$2' }}>
                      <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground' }}>
                        {info.name}
                      </Text>
                      <View sx={{ backgroundColor: info.badgeBg, borderRadius: 12, px: '$2', py: 2 }}>
                        <Text sx={{ fontSize: 11, fontWeight: '600', color: info.badgeColor }}>
                          {info.badge}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 19, mb: '$3' }}>
                      {info.description}
                    </Text>

                    {/* Stats row */}
                    {state ? (
                      <View sx={{ flexDirection: 'row', gap: '$4', flexWrap: 'wrap', mb: '$3' }}>
                        <View>
                          <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Last sync</Text>
                          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                            {formatRelativeTime(state.lastSyncAt)}
                          </Text>
                        </View>
                        <View>
                          <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Total ingested</Text>
                          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                            {state.itemsIngestedTotal}
                          </Text>
                        </View>
                        <View>
                          <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Last run</Text>
                          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                            +{state.itemsIngestedLastRun}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text sx={{ fontSize: 13, color: '$mutedForeground', fontStyle: 'italic', mb: '$3' }}>
                        Not yet synced
                      </Text>
                    )}

                    {/* Last error */}
                    {state?.lastError && (
                      <Text sx={{ fontSize: 12, color: '#DC2626', mb: '$2' }}>
                        Error: {state.lastError}
                      </Text>
                    )}

                    {/* Sync button */}
                    <Pressable
                      onPress={() => handleSync(sourceId)}
                      disabled={isSyncing || syncingSource !== null}
                      sx={{
                        backgroundColor: isSyncing ? '#E5E7EB' : '#7C3AED',
                        borderRadius: 8,
                        px: '$4',
                        py: '$2',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {isSyncing ? (
                        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                          <ActivityIndicator size="small" color="#6B7280" />
                          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#6B7280' }}>Syncing...</Text>
                        </View>
                      ) : (
                        <Text sx={{ fontSize: 13, fontWeight: '600', color: syncingSource !== null ? '#9CA3AF' : 'white' }}>
                          Sync Now
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View sx={{ mt: '$6' }}>
          <Link href="/intel">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>← Back to Research Feed</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
