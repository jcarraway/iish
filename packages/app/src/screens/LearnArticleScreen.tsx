import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetArticleQuery,
  useGeneratePersonalizedContextMutation,
  useGetRelatedResearchQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const ACTION_TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  ask_doctor: { bg: '#DBEAFE', fg: '#1E40AF' },
  check_eligibility: { bg: '#DCFCE7', fg: '#166534' },
  explore_platform: { bg: '#EDE9FE', fg: '#5B21B6' },
  learn_more: { bg: '#F3F4F6', fg: '#374151' },
  download: { bg: '#FEF3C7', fg: '#92400E' },
};

const URGENCY_INDICATORS: Record<string, { label: string; color: string }> = {
  time_sensitive: { label: 'Time-sensitive', color: '#EF4444' },
  important: { label: 'Important', color: '#F59E0B' },
  informational: { label: '', color: '' },
};

// ============================================================================
// Component
// ============================================================================

export function LearnArticleScreen({ slug, category }: { slug: string; category?: string }) {
  const [showClinical, setShowClinical] = useState(false);
  const [personalizedContext, setPersonalizedContext] = useState<string | null>(null);

  const { data, loading } = useGetArticleQuery({
    variables: { slug },
    errorPolicy: 'ignore',
  });

  const [generateContext, { loading: generatingContext }] = useGeneratePersonalizedContextMutation({
    onCompleted: (result) => {
      if (result?.generatePersonalizedContext?.content) {
        setPersonalizedContext(result.generatePersonalizedContext.content);
      }
    },
  });

  const { data: researchData } = useGetRelatedResearchQuery({
    variables: { slug },
    errorPolicy: 'ignore',
  });

  const article = data?.article;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading article...</Text>
        </View>
      </View>
    );
  }

  if (!article) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Article not found
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            This article may have been moved or is no longer available.
          </Text>
          <Link href="/learn">
            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2190'} Back to Learn</Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    );
  }

  const articleCategory = category ?? article.category ?? '';
  const patientContent = parseJsonArray(article.patientContent) as { heading: string; body: string }[];
  const clinicalContent = parseJsonArray(article.clinicalContent) as { heading: string; body: string }[];
  const keyStatistics = parseJsonArray(article.keyStatistics) as { label: string; value: string; source?: string }[];
  const actionItems = parseJsonArray(article.actionItems) as { text: string; link?: string }[];
  const references = parseJsonArray(article.references) as { title?: string; authors?: string; journal?: string; year?: string; citation?: string }[];
  const relatedSlugs: string[] = article.relatedArticleSlugs ?? [];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* ============================================================= */}
        {/* Breadcrumbs */}
        {/* ============================================================= */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4', flexWrap: 'wrap' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 13, color: 'blue600' }}>Learn</Text>
          </Link>
          {articleCategory ? (
            <>
              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
              <Link href={`/learn/${articleCategory}`}>
                <Text sx={{ fontSize: 13, color: 'blue600', textTransform: 'capitalize' }}>
                  {articleCategory.replace(/-/g, ' ')}
                </Text>
              </Link>
            </>
          ) : null}
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }} numberOfLines={1}>
            {article.title}
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Title + Meta */}
        {/* ============================================================= */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground', lineHeight: 38 }}>
          {article.title}
        </Text>

        <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$3', flexWrap: 'wrap' }}>
          {article.audienceLevel && (
            <View sx={{
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
              px: '$2',
              py: 3,
            }}>
              <Text sx={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'capitalize' }}>
                {article.audienceLevel}
              </Text>
            </View>
          )}
          {article.publishedAt && (
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              Published {new Date(article.publishedAt).toLocaleDateString()}
            </Text>
          )}
          {article.createdAt && (
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              Updated {new Date(article.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* ============================================================= */}
        {/* Patient Summary Box */}
        {/* ============================================================= */}
        {article.patientSummary && (
          <View sx={{
            mt: '$6',
            backgroundColor: '#F0F9FF',
            borderWidth: 1,
            borderColor: '#BAE6FD',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 13, fontWeight: '600', color: '#0C4A6E', mb: '$2' }}>
              In brief
            </Text>
            <Text sx={{ fontSize: 14, color: '#075985', lineHeight: 22 }}>
              {article.patientSummary}
            </Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Key Takeaways */}
        {/* ============================================================= */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Key Takeaways" />
            <View sx={{ mt: '$4', gap: '$3' }}>
              {article.keyTakeaways.map((takeaway: string, idx: number) => (
                <View key={idx} sx={{ flexDirection: 'row', gap: '$3' }}>
                  <View sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#DCFCE7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                  }}>
                    <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#166534' }}>
                      {'\u2713'}
                    </Text>
                  </View>
                  <Text sx={{ flex: 1, fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                    {takeaway}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Personalized Context Banner */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          borderWidth: 1,
          borderColor: '#C7D2FE',
          borderRadius: 12,
          p: '$5',
          backgroundColor: '#EEF2FF',
        }}>
          {personalizedContext ? (
            <>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#4338CA', mb: '$2' }}>
                What this means for you
              </Text>
              <Text sx={{ fontSize: 14, color: '#3730A3', lineHeight: 22 }}>
                {personalizedContext}
              </Text>
            </>
          ) : (
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
              <View sx={{ flex: 1 }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '#4338CA' }}>
                  Want to know what this means for your specific situation?
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: '#6366F1' }}>
                  Get a personalized interpretation based on your profile
                </Text>
              </View>
              <Pressable
                onPress={() => generateContext({ variables: { slug } })}
                disabled={generatingContext}
              >
                <View sx={{
                  backgroundColor: generatingContext ? '#9CA3AF' : '#4F46E5',
                  borderRadius: 8,
                  px: '$3',
                  py: '$2',
                }}>
                  {generatingContext ? (
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ActivityIndicator color="white" size="small" />
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                        Generating...
                      </Text>
                    </View>
                  ) : (
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                      Personalize
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Patient Content Sections */}
        {/* ============================================================= */}
        {patientContent.length > 0 && (
          <View sx={{ mt: '$6' }}>
            {patientContent.map((section: { heading: string; body: string }, idx: number) => (
              <View key={idx} sx={{ mb: '$6' }}>
                <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground', mb: '$3' }}>
                  {section.heading}
                </Text>
                <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 24 }}>
                  {section.body}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ============================================================= */}
        {/* Clinical Content (Collapsible) */}
        {/* ============================================================= */}
        {clinicalContent.length > 0 && (
          <View sx={{ mt: '$4' }}>
            <Pressable onPress={() => setShowClinical(!showClinical)}>
              <View sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$4',
                backgroundColor: '#FAFAFA',
              }}>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                    Clinical Detail
                  </Text>
                  <Text sx={{ mt: 2, fontSize: 12, color: '$mutedForeground' }}>
                    Detailed clinical information, data, and technical context
                  </Text>
                </View>
                <Text sx={{ fontSize: 18, color: '$mutedForeground' }}>
                  {showClinical ? '\u25B2' : '\u25BC'}
                </Text>
              </View>
            </Pressable>

            {showClinical && (
              <View sx={{
                mt: '$3',
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
                backgroundColor: '#FAFAFA',
              }}>
                {clinicalContent.map((section: { heading: string; body: string }, idx: number) => (
                  <View key={idx} sx={{ mb: idx < clinicalContent.length - 1 ? '$5' : '$0' }}>
                    <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                      {section.heading}
                    </Text>
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                      {section.body}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================================= */}
        {/* Action Items */}
        {/* ============================================================= */}
        {actionItems.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="What to Do Next" />
            <View sx={{ mt: '$4', gap: '$3' }}>
              {actionItems.map((item: {
                text: string;
                type?: string;
                platformLink?: string | null;
                urgency?: string;
              }, idx: number) => {
                const typeColors = ACTION_TYPE_COLORS[item.type ?? 'learn_more'] ?? ACTION_TYPE_COLORS.learn_more;
                const urgency = URGENCY_INDICATORS[item.urgency ?? 'informational'] ?? URGENCY_INDICATORS.informational;
                const content = (
                  <View sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                  }}>
                    <View sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: typeColors.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text sx={{ fontSize: 14, fontWeight: 'bold', color: typeColors.fg }}>
                        {idx + 1}
                      </Text>
                    </View>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 20 }}>
                        {item.text}
                      </Text>
                      {urgency.label ? (
                        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1', mt: '$1' }}>
                          <View sx={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: urgency.color,
                          }} />
                          <Text sx={{ fontSize: 11, color: urgency.color, fontWeight: '600' }}>
                            {urgency.label}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {item.platformLink && (
                      <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2192'}</Text>
                    )}
                  </View>
                );

                if (item.platformLink) {
                  return (
                    <Link key={idx} href={item.platformLink}>
                      {content}
                    </Link>
                  );
                }
                return <View key={idx}>{content}</View>;
              })}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Key Statistics */}
        {/* ============================================================= */}
        {keyStatistics.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Key Statistics" />
            <View sx={{ mt: '$4', gap: '$3' }}>
              {keyStatistics.map((stat: {
                label: string;
                value: string;
                context?: string;
                source?: string;
              }, idx: number) => (
                <View key={idx} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$mutedForeground' }}>
                    {stat.label}
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 18, fontWeight: 'bold', color: '$foreground' }}>
                    {stat.value}
                  </Text>
                  {stat.context && (
                    <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                      {stat.context}
                    </Text>
                  )}
                  {stat.source && (
                    <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground', fontStyle: 'italic' }}>
                      Source: {stat.source}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* References */}
        {/* ============================================================= */}
        {references.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="References" />
            <View sx={{ mt: '$4', gap: '$2' }}>
              {references.map((ref: {
                title?: string;
                authors?: string;
                journal?: string;
                year?: string;
                citation?: string;
              }, idx: number) => (
                <View key={idx} sx={{ flexDirection: 'row', gap: '$2' }}>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground', minWidth: 20 }}>
                    [{idx + 1}]
                  </Text>
                  <Text sx={{ flex: 1, fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                    {ref.citation ?? `${ref.authors ?? ''} ${ref.title ?? ''} ${ref.journal ?? ''} ${ref.year ?? ''}`.trim()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Related Articles */}
        {/* ============================================================= */}
        {relatedSlugs.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Related Articles" />
            <View sx={{ mt: '$4', gap: '$3' }}>
              {relatedSlugs.map((relSlug: string) => (
                <Link key={relSlug} href={`/learn/search?q=${encodeURIComponent(relSlug.replace(/-/g, ' '))}`}>
                  <View sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground', textTransform: 'capitalize' }}>
                      {relSlug.replace(/-/g, ' ')}
                    </Text>
                    <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2192'}</Text>
                  </View>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Latest Research (INTEL cross-link) */}
        {/* ============================================================= */}
        {researchData?.relatedResearch && researchData.relatedResearch.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Latest Research" />
            <Text sx={{ mt: '$2', mb: '$3', fontSize: 13, color: '$mutedForeground' }}>
              Recent research findings related to this topic
            </Text>
            <View sx={{ gap: '$3' }}>
              {researchData.relatedResearch.map((item: any) => {
                const tierColors: Record<string, { bg: string; fg: string }> = {
                  T1: { bg: '#DCFCE7', fg: '#166534' },
                  T2: { bg: '#CCFBF1', fg: '#0D9488' },
                  T3: { bg: '#DBEAFE', fg: '#2563EB' },
                };
                const tc = tierColors[item.maturityTier] ?? { bg: '#F3F4F6', fg: '#6B7280' };
                return (
                  <Link key={item.id} href={`/intel/${item.id}`}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 12,
                      p: '$4',
                    }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$2' }}>
                        {item.maturityTier && (
                          <View sx={{ backgroundColor: tc.bg, borderRadius: 8, px: '$2', py: 2 }}>
                            <Text sx={{ fontSize: 10, fontWeight: '600', color: tc.fg }}>
                              {item.maturityTier}
                            </Text>
                          </View>
                        )}
                        {item.publishedAt && (
                          <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground', lineHeight: 20 }}>
                        {item.title}
                      </Text>
                      {item.patientSummary && (
                        <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }} numberOfLines={2}>
                          {item.patientSummary}
                        </Text>
                      )}
                    </View>
                  </Link>
                );
              })}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Disclaimer */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            For informational purposes only
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This article is for informational purposes only and is not a substitute for professional
            medical advice, diagnosis, or treatment. Always seek the advice of your oncologist or
            other qualified health provider with any questions you may have regarding a medical condition.
          </Text>
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

// ============================================================================
// Helpers
// ============================================================================

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
