import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { OrderProgressBar } from '../components';
import { SEQUENCING_ORDER_STATUSES } from '@iish/shared';
import {
  useGetSequencingOrderQuery,
  useUpdateSequencingOrderStatusMutation,
  useGetWaitingContentLazyQuery,
} from '../generated/graphql';

const STATUS_FLOW = [
  SEQUENCING_ORDER_STATUSES.PENDING,
  SEQUENCING_ORDER_STATUSES.INSURANCE_CHECK,
  SEQUENCING_ORDER_STATUSES.PRIOR_AUTH,
  SEQUENCING_ORDER_STATUSES.SAMPLE_NEEDED,
  SEQUENCING_ORDER_STATUSES.SAMPLE_RECEIVED,
  SEQUENCING_ORDER_STATUSES.PROCESSING,
  SEQUENCING_ORDER_STATUSES.RESULTS_READY,
  SEQUENCING_ORDER_STATUSES.COMPLETED,
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Created',
  insurance_check: 'Checking Insurance',
  prior_auth: 'Prior Authorization',
  sample_needed: 'Sample Needed',
  sample_received: 'Sample Received',
  processing: 'Processing in Lab',
  results_ready: 'Results Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function SequencingOrderDetailScreen({ orderId }: { orderId: string }) {
  const { data, loading, error, refetch } = useGetSequencingOrderQuery({ variables: { id: orderId } });
  const [updateStatus, { loading: updating }] = useUpdateSequencingOrderStatusMutation();
  const [fetchWaiting, { data: waitingData }] = useGetWaitingContentLazyQuery();

  const order = data?.sequencingOrder;
  const waitingContent = waitingData?.waitingContent;

  useEffect(() => {
    if (order && (order.status === 'sample_received' || order.status === 'processing')) {
      fetchWaiting();
    }
  }, [order?.status]);

  const currentIndex = STATUS_FLOW.indexOf(order?.status as any);
  const isCancelled = order?.status === 'cancelled';
  const isCompleted = order?.status === 'completed';
  const canAdvance = !isCancelled && !isCompleted && currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1;
  const canCancel = !isCancelled && !isCompleted;

  const advanceStatus = useCallback(async () => {
    if (!order || currentIndex < 0 || currentIndex >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    await updateStatus({ variables: { orderId, status: nextStatus } });
    refetch();
  }, [order, currentIndex, orderId]);

  const cancelOrder = useCallback(async () => {
    await updateStatus({ variables: { orderId, status: 'cancelled' } });
    refetch();
  }, [orderId]);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
        <ActivityIndicator size="small" />
        <Text sx={{ fontSize: 14, color: 'gray600' }}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700' }}>Order Details</Text>
        <Text sx={{ mt: '$4', fontSize: 14, color: '#DC2626' }}>{error?.message ?? 'Order not found'}</Text>
        <Link href="/sequencing/orders">
          <View sx={{ mt: '$4', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
            <Text sx={{ fontSize: 14 }}>Back to orders</Text>
          </View>
        </Link>
      </View>
    );
  }

  const coverage = order.insuranceCoverage as { insurer?: string; status?: string; priorAuthRequired?: boolean; reasoning?: string } | null;

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/sequencing/orders">
          <Text sx={{ fontSize: 14, color: '#2563EB' }}>{'<'} All orders</Text>
        </Link>

        <View sx={{ mt: '$4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text sx={{ fontSize: 28, fontWeight: '700' }}>{order.provider?.name ?? 'Provider'}</Text>
            <Text sx={{ mt: '$1', color: 'gray500' }}>{order.testType.replace(/_/g, ' ')}</Text>
          </View>
          <View sx={{
            bg: isCancelled ? '#FEE2E2' : isCompleted ? '#DCFCE7' : '#DBEAFE',
            borderRadius: 12, px: '$3', py: '$1',
          }}>
            <Text sx={{
              fontSize: 14, fontWeight: '600',
              color: isCancelled ? '#B91C1C' : isCompleted ? '#14532D' : '#1E40AF',
            }}>
              {STATUS_LABELS[order.status] ?? order.status}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View sx={{ mt: '$8' }}>
          <OrderProgressBar currentStatus={order.status} />
        </View>

        {/* Status timeline */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900' }}>Status Timeline</Text>
          <View sx={{ mt: '$4' }}>
            {STATUS_FLOW.map((status, i) => {
              const isComplete = i < currentIndex;
              const isCurrent = i === currentIndex && !isCancelled;
              return (
                <View key={status} sx={{ flexDirection: 'row', mb: '$5' }}>
                  {/* Dot + line */}
                  <View sx={{ width: 24, alignItems: 'center' }}>
                    <View sx={{
                      width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                      bg: isComplete ? '#22C55E' : isCurrent ? '#3B82F6' : '#E5E7EB',
                    }}>
                      {isComplete ? (
                        <Text sx={{ color: 'white', fontSize: 12, fontWeight: '700' }}>✓</Text>
                      ) : (
                        <View sx={{ width: 8, height: 8, borderRadius: 4, bg: isCurrent ? 'white' : '#9CA3AF' }} />
                      )}
                    </View>
                    {i < STATUS_FLOW.length - 1 && (
                      <View sx={{ width: 2, flex: 1, minHeight: 20, bg: isComplete ? '#BBF7D0' : '#E5E7EB' }} />
                    )}
                  </View>
                  <View sx={{ ml: '$2', flex: 1 }}>
                    <Text sx={{
                      fontSize: 14,
                      fontWeight: isCurrent ? '600' : '400',
                      color: isCurrent ? '#1D4ED8' : isComplete ? 'gray700' : '#9CA3AF',
                    }}>
                      {STATUS_LABELS[status]}
                    </Text>
                    {isCurrent && <Text sx={{ fontSize: 12, color: 'gray500' }}>Current status</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Insurance coverage */}
        {coverage && (
          <View sx={{ mt: '$8', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Insurance Coverage</Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {coverage.insurer && (
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, color: 'gray500' }}>Insurer</Text>
                  <Text sx={{ fontSize: 14, color: 'gray900' }}>{coverage.insurer}</Text>
                </View>
              )}
              {coverage.status && (
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, color: 'gray500' }}>Status</Text>
                  <Text sx={{ fontSize: 14, color: 'gray900' }}>{coverage.status.replace(/_/g, ' ')}</Text>
                </View>
              )}
              {coverage.priorAuthRequired != null && (
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, color: 'gray500' }}>Prior auth required</Text>
                  <Text sx={{ fontSize: 14, color: 'gray900' }}>{coverage.priorAuthRequired ? 'Yes' : 'No'}</Text>
                </View>
              )}
              {coverage.reasoning && (
                <Text sx={{ fontSize: 14, color: 'gray600', mt: '$2' }}>{coverage.reasoning}</Text>
              )}
            </View>
          </View>
        )}

        {/* While You Wait */}
        {waitingContent && (order.status === 'sample_received' || order.status === 'processing') && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 20, fontWeight: '700', color: 'gray900' }}>While You Wait</Text>
            <Text sx={{ mt: '$1', fontSize: 14, color: 'gray500' }}>Learn about what your results might show</Text>

            <View sx={{ mt: '$4', gap: '$4' }}>
              <View sx={{ borderRadius: 8, bg: '#EEF2FF', p: '$5' }}>
                <Text sx={{ fontWeight: '600', color: '#312E81' }}>What mutations mean</Text>
                <Text sx={{ mt: '$2', fontSize: 14, color: '#3730A3', lineHeight: 22 }}>
                  {waitingContent.whatMutationsMean}
                </Text>
              </View>

              <View>
                <Text sx={{ fontWeight: '600', color: 'gray900' }}>
                  Common mutations in {waitingContent.cancerType}
                </Text>
                <View sx={{ mt: '$2', gap: '$2' }}>
                  {waitingContent.commonMutations.map((mut, i) => (
                    <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$3' }}>
                      <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text sx={{ fontWeight: '500', color: 'gray900' }}>{mut.name}</Text>
                        <Text sx={{ fontSize: 12, color: 'gray500' }}>{mut.frequency}</Text>
                      </View>
                      <Text sx={{ mt: '$1', fontSize: 14, color: 'gray600' }}>{mut.significance}</Text>
                      {mut.drugs.length > 0 && (
                        <Text sx={{ mt: '$1', fontSize: 12, color: '#4338CA' }}>
                          Targeted therapies: {mut.drugs.join(', ')}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <View sx={{ borderRadius: 8, bg: '#F0FDFA', p: '$5' }}>
                <Text sx={{ fontWeight: '600', color: '#134E4A' }}>Clinical trials</Text>
                <Text sx={{ mt: '$2', fontSize: 14, color: '#115E59', lineHeight: 22 }}>
                  {waitingContent.clinicalTrialContext}
                </Text>
              </View>

              <View sx={{ borderRadius: 8, bg: '#F9FAFB', p: '$5' }}>
                <Text sx={{ fontWeight: '600', color: 'gray900' }}>Timeline expectations</Text>
                <Text sx={{ mt: '$2', fontSize: 14, color: 'gray700', lineHeight: 22 }}>
                  {waitingContent.timelineExpectations}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Upload CTA */}
        {order.status === 'results_ready' && (
          <View sx={{ mt: '$8', borderRadius: 12, bg: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', p: '$6' }}>
            <Text sx={{ fontWeight: '600', color: '#14532D' }}>Your results are ready!</Text>
            <Text sx={{ mt: '$1', fontSize: 14, color: '#166534' }}>
              Upload your genomic report to identify actionable mutations and improve your trial matches.
            </Text>
            <Link href="/sequencing/upload">
              <View sx={{ mt: '$3', bg: '#16A34A', borderRadius: 8, px: '$5', py: 10, alignSelf: 'flex-start' }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Upload your results</Text>
              </View>
            </Link>
          </View>
        )}

        {/* Action buttons */}
        <View sx={{ mt: '$8', flexDirection: 'row', gap: '$3' }}>
          {canAdvance && (
            <Pressable onPress={advanceStatus} disabled={updating}>
              <View sx={{ bg: '#2563EB', borderRadius: 8, px: '$4', py: '$2', opacity: updating ? 0.5 : 1 }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  {updating ? 'Updating...' : `Mark as: ${STATUS_LABELS[STATUS_FLOW[currentIndex + 1]] ?? 'Next'}`}
                </Text>
              </View>
            </Pressable>
          )}
          {canCancel && (
            <Pressable onPress={cancelOrder} disabled={updating}>
              <View sx={{ borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, px: '$4', py: '$2', opacity: updating ? 0.5 : 1 }}>
                <Text sx={{ fontSize: 14, color: '#B91C1C' }}>Cancel order</Text>
              </View>
            </Pressable>
          )}
        </View>

        <Text sx={{ mt: '$6', fontSize: 12, color: '#9CA3AF' }}>
          Created {new Date(order.createdAt).toLocaleDateString()}
          {order.updatedAt && ` · Last updated ${new Date(order.updatedAt).toLocaleDateString()}`}
        </Text>
      </View>
    </ScrollView>
  );
}
