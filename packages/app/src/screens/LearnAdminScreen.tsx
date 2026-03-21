import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetArticlesAdminQuery,
  useGetArticleEngagementQuery,
  useGetArticleRefreshStatusQuery,
  useUpdateArticleStatusMutation,
  useCheckArticleQualityMutation,
  useInsertPlatformLinksMutation,
  useGenerateRefreshSuggestionMutation,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  draft: { bg: '#FEF3C7', fg: '#92400E' },
  review: { bg: '#DBEAFE', fg: '#1E40AF' },
  published: { bg: '#DCFCE7', fg: '#166534' },
};

const CATEGORY_LABELS: Record<string, string> = {
  diagnosis: 'Diagnosis',
  biomarkers: 'Biomarkers',
  treatment: 'Treatment',
  testing: 'Testing',
  decisions: 'Decisions',
  'side-effects': 'Side Effects',
  survivorship: 'Survivorship',
  innovation: 'Innovation',
};

const FILTER_OPTIONS = ['All', 'draft', 'review', 'published'];
const TAB_OPTIONS = ['Articles', 'Engagement'];

// ============================================================================
// Screen
// ============================================================================

export function LearnAdminScreen() {
  const [activeTab, setActiveTab] = useState('Articles');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [qcResults, setQcResults] = useState<Record<string, any>>({});
  const [refreshStatuses, setRefreshStatuses] = useState<Record<string, any>>({});

  const filters = statusFilter !== 'All' ? { status: statusFilter } : undefined;
  const { data, loading, refetch } = useGetArticlesAdminQuery({
    variables: { filters },
    errorPolicy: 'ignore',
  });

  const [updateStatus, { loading: updatingStatus }] = useUpdateArticleStatusMutation({
    onCompleted: () => refetch(),
  });
  const [checkQuality, { loading: checkingQuality }] = useCheckArticleQualityMutation();
  const [insertLinks, { loading: insertingLinks }] = useInsertPlatformLinksMutation({
    onCompleted: () => refetch(),
  });
  const [generateRefresh] = useGenerateRefreshSuggestionMutation();

  const { data: engagementData, loading: engagementLoading } = useGetArticleEngagementQuery({
    skip: activeTab !== 'Engagement',
  });

  const articles = data?.articlesAdmin ?? [];

  const handleCheckQuality = async (articleId: string) => {
    const result = await checkQuality({ variables: { articleId } });
    if (result.data?.checkArticleQuality) {
      setQcResults((prev) => ({ ...prev, [articleId]: result.data!.checkArticleQuality }));
    }
  };

  const handleStatusChange = (articleId: string, newStatus: string) => {
    updateStatus({ variables: { articleId, status: newStatus } });
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 1024, px: '$6', py: '$10', width: '100%' }}>
        {/* Header */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Article Administration
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', mb: '$4' }}>
          Manage article quality, status, and platform integration.
        </Text>

        {/* Tab bar */}
        <View sx={{ flexDirection: 'row', gap: '$3', mb: '$6', borderBottomWidth: 1, borderBottomColor: '$border' }}>
          {TAB_OPTIONS.map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <View sx={{
                pb: '$2',
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: '#4F46E5',
              }}>
                <Text sx={{
                  fontSize: 14,
                  fontWeight: activeTab === tab ? '600' : '400',
                  color: activeTab === tab ? '#4F46E5' : '$mutedForeground',
                }}>
                  {tab}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Articles Tab */}
        {activeTab === 'Articles' && (<>
        <View sx={{ flexDirection: 'row', gap: '$2', mb: '$6', flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map((opt) => (
            <Pressable key={opt} onPress={() => setStatusFilter(opt)}>
              <View sx={{
                backgroundColor: statusFilter === opt ? '#4F46E5' : '#F3F4F6',
                borderRadius: 20,
                px: '$3',
                py: '$1',
              }}>
                <Text sx={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: statusFilter === opt ? 'white' : '#6B7280',
                  textTransform: 'capitalize',
                }}>
                  {opt === 'All' ? `All (${data?.articlesAdmin?.length ?? '...'})` : opt}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Loading */}
        {loading && (
          <View sx={{ alignItems: 'center', py: '$10' }}>
            <ActivityIndicator size="small" />
            <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>Loading articles...</Text>
          </View>
        )}

        {/* Article list */}
        {!loading && (
          <View sx={{ gap: '$4' }}>
            {articles.map((article: any) => {
              const statusColor = STATUS_COLORS[article.status] ?? STATUS_COLORS.draft;
              const qc = qcResults[article.id];

              return (
                <View key={article.id} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}>
                  {/* Title + badges */}
                  <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$2', flexWrap: 'wrap' }}>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                        {article.title}
                      </Text>
                      <View sx={{ flexDirection: 'row', gap: '$2', mt: '$2', flexWrap: 'wrap' }}>
                        <View sx={{ backgroundColor: statusColor.bg, borderRadius: 8, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: statusColor.fg, textTransform: 'capitalize' }}>
                            {article.status}
                          </Text>
                        </View>
                        <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 8, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, color: '#6B7280' }}>
                            {CATEGORY_LABELS[article.category] ?? article.category}
                          </Text>
                        </View>
                        <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 8, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, color: '#6B7280' }}>
                            {article.viewCount} views
                          </Text>
                        </View>
                        {qc && (
                          <View sx={{
                            backgroundColor: qc.score >= 80 ? '#DCFCE7' : qc.score >= 50 ? '#FEF3C7' : '#FEE2E2',
                            borderRadius: 8,
                            px: '$2',
                            py: 2,
                          }}>
                            <Text sx={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: qc.score >= 80 ? '#166534' : qc.score >= 50 ? '#92400E' : '#991B1B',
                            }}>
                              QC: {qc.score}/100
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View sx={{ flexDirection: 'row', gap: '$2', mt: '$3', flexWrap: 'wrap' }}>
                    <Pressable
                      onPress={() => handleCheckQuality(article.id)}
                      disabled={checkingQuality}
                    >
                      <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 8, px: '$3', py: '$1' }}>
                        <Text sx={{ fontSize: 12, color: '#374151' }}>Run QC</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => insertLinks({ variables: { articleId: article.id } })}
                      disabled={insertingLinks}
                    >
                      <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 8, px: '$3', py: '$1' }}>
                        <Text sx={{ fontSize: 12, color: '#374151' }}>Insert Links</Text>
                      </View>
                    </Pressable>
                    {article.status === 'draft' && (
                      <Pressable
                        onPress={() => handleStatusChange(article.id, 'review')}
                        disabled={updatingStatus}
                      >
                        <View sx={{ backgroundColor: '#DBEAFE', borderRadius: 8, px: '$3', py: '$1' }}>
                          <Text sx={{ fontSize: 12, color: '#1E40AF' }}>Send to Review</Text>
                        </View>
                      </Pressable>
                    )}
                    {article.status === 'review' && (
                      <>
                        <Pressable
                          onPress={() => handleStatusChange(article.id, 'published')}
                          disabled={updatingStatus}
                        >
                          <View sx={{ backgroundColor: '#DCFCE7', borderRadius: 8, px: '$3', py: '$1' }}>
                            <Text sx={{ fontSize: 12, color: '#166534' }}>Publish</Text>
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => handleStatusChange(article.id, 'draft')}
                          disabled={updatingStatus}
                        >
                          <View sx={{ backgroundColor: '#FEE2E2', borderRadius: 8, px: '$3', py: '$1' }}>
                            <Text sx={{ fontSize: 12, color: '#991B1B' }}>Return to Draft</Text>
                          </View>
                        </Pressable>
                      </>
                    )}
                    {article.status === 'published' && (
                      <Pressable
                        onPress={() => handleStatusChange(article.id, 'review')}
                        disabled={updatingStatus}
                      >
                        <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 8, px: '$3', py: '$1' }}>
                          <Text sx={{ fontSize: 12, color: '#92400E' }}>Unpublish</Text>
                        </View>
                      </Pressable>
                    )}
                  </View>

                  {/* QC Results */}
                  {qc && qc.issues.length > 0 && (
                    <View sx={{ mt: '$3', backgroundColor: '#FAFAFA', borderRadius: 8, p: '$3' }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                        QUALITY ISSUES ({qc.issues.length})
                      </Text>
                      <View sx={{ gap: '$2' }}>
                        {qc.issues.map((issue: any, idx: number) => (
                          <View key={idx} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                            <View sx={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: issue.severity === 'high' ? '#EF4444' : issue.severity === 'medium' ? '#F59E0B' : '#6B7280',
                              mt: 5,
                            }} />
                            <View sx={{ flex: 1 }}>
                              <Text sx={{ fontSize: 12, color: '$foreground' }}>
                                {issue.description}
                              </Text>
                              {issue.section && (
                                <Text sx={{ fontSize: 11, color: '$mutedForeground', mt: 1 }}>
                                  Section: {issue.section}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {!loading && articles.length === 0 && (
          <View sx={{
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>
              No articles found for this filter.
            </Text>
          </View>
        )}
        </>)}

        {/* Engagement Tab */}
        {activeTab === 'Engagement' && (
          <>
            {engagementLoading && (
              <View sx={{ alignItems: 'center', py: '$10' }}>
                <ActivityIndicator size="small" />
              </View>
            )}
            {!engagementLoading && engagementData?.articleEngagement && (
              <View sx={{ gap: '$3' }}>
                {engagementData.articleEngagement.map((article: any, idx: number) => (
                  <View key={article.id} sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    <View sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: idx < 3 ? '#DCFCE7' : '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: 'bold', color: idx < 3 ? '#166534' : '#6B7280' }}>
                        {idx + 1}
                      </Text>
                    </View>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }} numberOfLines={1}>
                        {article.title}
                      </Text>
                      <View sx={{ flexDirection: 'row', gap: '$2', mt: '$1' }}>
                        <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 6, px: '$2', py: 1 }}>
                          <Text sx={{ fontSize: 10, color: '#6B7280', textTransform: 'capitalize' }}>
                            {(CATEGORY_LABELS as any)[article.category] ?? article.category}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View sx={{ alignItems: 'flex-end' }}>
                      <Text sx={{ fontSize: 18, fontWeight: 'bold', color: '$foreground' }}>
                        {article.viewCount}
                      </Text>
                      <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>views</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Back link */}
        <View sx={{ mt: '$6' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>{'\u2190'} Back to Learn</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
