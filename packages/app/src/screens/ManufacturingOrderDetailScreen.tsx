import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import { OrderTimeline } from '../components';
import { openExternalUrl } from '../utils';
import { ORDER_STATUS_LABELS, getOrderTimeline } from '@iish/shared';
import type { ManufacturingOrderStatus } from '@iish/shared';
import {
  useGetManufacturingOrderQuery,
  useAcceptQuoteMutation,
  useAddOrderNoteMutation,
} from '../generated/graphql';

function formatCurrency(amount: number, currency?: string | null): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ManufacturingOrderDetailScreen({ orderId }: { orderId: string }) {
  const { data, loading, error, refetch } = useGetManufacturingOrderQuery({
    variables: { id: orderId },
  });
  const [acceptQuote, { loading: accepting }] = useAcceptQuoteMutation();
  const [addOrderNote, { loading: addingNote }] = useAddOrderNoteMutation();
  const [noteText, setNoteText] = useState('');

  const order = data?.manufacturingOrder;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: 'gray600' }}>Loading order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'gray600' }}>{error?.message ?? 'Order not found.'}</Text>
      </View>
    );
  }

  const statusLabel = ORDER_STATUS_LABELS[order.status as ManufacturingOrderStatus] ?? order.status;
  const timeline = getOrderTimeline({
    status: order.status,
    createdAt: order.createdAt,
    productionStartedAt: order.productionStartedAt,
    qcStartedAt: order.qcStartedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    administeredAt: order.administeredAt,
  });
  const notes = (order.notes as { type: string; text: string; at: string }[] | null) ?? [];

  const handleAcceptQuote = async () => {
    try {
      await acceptQuote({ variables: { orderId: order.id } });
      refetch();
    } catch {}
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addOrderNote({ variables: { orderId: order.id, note: noteText } });
      setNoteText('');
      refetch();
    } catch {}
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/manufacture/orders">
          <Text sx={{ fontSize: '$sm', color: 'blue600' }}>&larr; All orders</Text>
        </Link>

        <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
              {order.partner?.name ?? order.partnerName}
            </Text>
            <Text sx={{ mt: '$1', color: 'gray600' }}>
              Order #{order.id.slice(0, 8)} &middot; {statusLabel}
            </Text>
          </View>
          {order.partner?.contactUrl && (
            <Pressable onPress={() => openExternalUrl(order.partner!.contactUrl!)}>
              <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$lg', px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>Contact partner</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Timeline */}
        <View sx={{ mt: '$8' }}>
          <OrderTimeline timeline={timeline} />
        </View>

        {/* Action buttons */}
        <View sx={{ mt: '$6', flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          {order.status === 'quote_received' && (
            <Pressable onPress={handleAcceptQuote} disabled={accepting}>
              <View sx={{ bg: 'green600', borderRadius: '$lg', px: '$6', py: 10, opacity: accepting ? 0.5 : 1 }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>
                  {accepting ? 'Accepting...' : 'Accept Quote'}
                </Text>
              </View>
            </Pressable>
          )}
          {['delivered', 'ready_for_administration'].includes(order.status) && !order.administrationSite && (
            <Link href={`/manufacture/providers?orderId=${order.id}`}>
              <View sx={{ bg: 'purple600', borderRadius: '$lg', px: '$6', py: 10 }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Find administration site</Text>
              </View>
            </Link>
          )}
          {order.administeredAt && (
            <Link href={`/manufacture/monitoring/${order.id}/report`}>
              <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$6', py: 10 }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Submit check-in report</Text>
              </View>
            </Link>
          )}
          {order.status === 'shipped' && (
            <Link href={`/manufacture/orders/${order.id}/tracking`}>
              <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$lg', px: '$6', py: 10 }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>View tracking</Text>
              </View>
            </Link>
          )}
        </View>

        {/* Quote details */}
        {order.quotePrice != null && (
          <View sx={{ mt: '$8', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Quote Details</Text>
            <View sx={{ mt: '$3', gap: 16 }}>
              <View>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>Price</Text>
                <Text sx={{ fontSize: '$lg', fontWeight: '700', color: 'gray900' }}>
                  {formatCurrency(order.quotePrice, order.quoteCurrency)}
                </Text>
              </View>
              {order.quoteTurnaroundWeeks && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Turnaround</Text>
                  <Text sx={{ fontSize: '$lg', fontWeight: '700', color: 'gray900' }}>
                    {order.quoteTurnaroundWeeks} weeks
                  </Text>
                </View>
              )}
              {order.quoteExpiresAt && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Quote expires</Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                    {new Date(order.quoteExpiresAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Production */}
        {order.productionStartedAt && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Production</Text>
            <View sx={{ mt: '$3', gap: 16 }}>
              <View>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>Started</Text>
                <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                  {new Date(order.productionStartedAt).toLocaleDateString()}
                </Text>
              </View>
              {order.productionEstimatedCompletion && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Estimated completion</Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                    {new Date(order.productionEstimatedCompletion).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {order.batchNumber && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Batch number</Text>
                  <Text sx={{ fontSize: '$sm', fontFamily: 'monospace', color: 'gray900' }}>
                    {order.batchNumber}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* QC */}
        {order.qcStartedAt && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Quality Control</Text>
            <View sx={{ mt: '$3', gap: 16 }}>
              <View>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>Started</Text>
                <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                  {new Date(order.qcStartedAt).toLocaleDateString()}
                </Text>
              </View>
              {order.qcCompletedAt && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Completed</Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                    {new Date(order.qcCompletedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {order.qcPassed != null && (
                <View sx={{ bg: order.qcPassed ? 'green100' : 'red100', borderRadius: 9999, px: '$2', py: 2, alignSelf: 'flex-start' }}>
                  <Text sx={{ fontSize: 11, fontWeight: '500', color: order.qcPassed ? 'green800' : 'red800' }}>
                    {order.qcPassed ? 'Passed' : 'Failed'}
                  </Text>
                </View>
              )}
            </View>
            {order.qcNotes && (
              <Text sx={{ mt: '$3', fontSize: '$sm', color: 'gray600' }}>{order.qcNotes}</Text>
            )}
          </View>
        )}

        {/* Shipping */}
        {order.shippedAt && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Shipping</Text>
            <View sx={{ mt: '$3', gap: 16 }}>
              <View>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>Shipped</Text>
                <Text sx={{ fontSize: '$sm', color: 'gray900' }}>
                  {new Date(order.shippedAt).toLocaleDateString()}
                </Text>
              </View>
              {order.trackingNumber && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Tracking</Text>
                  <Text sx={{ fontSize: '$sm', fontFamily: 'monospace', color: 'gray900' }}>
                    {order.trackingNumber}
                  </Text>
                </View>
              )}
              {order.shippingCarrier && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Carrier</Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray900' }}>{order.shippingCarrier}</Text>
                </View>
              )}
              {order.shippingConditions && (
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Storage conditions</Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray900' }}>{order.shippingConditions}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Administration site */}
        {order.administrationSite && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Administration Site</Text>
            <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray900' }}>{order.administrationSite.name}</Text>
            {order.administrationSite.city && order.administrationSite.state && (
              <Text sx={{ fontSize: 11, color: 'gray500' }}>
                {order.administrationSite.city}, {order.administrationSite.state}
              </Text>
            )}
            {order.administeredAt && (
              <Text sx={{ mt: '$2', fontSize: 11, color: 'gray500' }}>
                Administered on {new Date(order.administeredAt).toLocaleDateString()}
                {order.administeredBy ? ` by ${order.administeredBy}` : ''}
              </Text>
            )}
          </View>
        )}

        {/* Monitoring reports */}
        {order.reports.length > 0 && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text sx={{ fontWeight: '600', color: 'gray900' }}>Monitoring Reports</Text>
              <Link href={`/manufacture/monitoring/${order.id}/history`}>
                <Text sx={{ fontSize: '$sm', color: 'blue600' }}>View all</Text>
              </Link>
            </View>
            <Text sx={{ mt: '$1', fontSize: 11, color: 'gray500' }}>
              {order.reports.length} report{order.reports.length !== 1 ? 's' : ''} submitted
            </Text>
          </View>
        )}

        {/* Notes */}
        <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900' }}>Notes</Text>
          <View sx={{ mt: '$3', gap: 8 }}>
            {notes.map((note, idx) => (
              <View key={idx} sx={{ bg: 'gray50', borderRadius: '$lg', p: '$3' }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    sx={{
                      borderRadius: 9999,
                      px: '$2',
                      py: 2,
                      bg: note.type === 'system' ? 'gray200' : note.type === 'physician' ? 'blue100' : 'green100',
                    }}
                  >
                    <Text
                      sx={{
                        fontSize: 10,
                        fontWeight: '500',
                        color: note.type === 'system' ? 'gray600' : note.type === 'physician' ? 'blue700' : 'green700',
                      }}
                    >
                      {note.type}
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 10, color: 'gray400' }}>{new Date(note.at).toLocaleString()}</Text>
                </View>
                <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray700' }}>{note.text}</Text>
              </View>
            ))}
          </View>
          <View sx={{ mt: '$3', flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note..."
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 14,
              }}
            />
            <Pressable
              onPress={handleAddNote}
              disabled={addingNote || !noteText.trim()}
              sx={{ opacity: addingNote || !noteText.trim() ? 0.5 : 1 }}
            >
              <View sx={{ bg: 'gray900', borderRadius: '$lg', px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Add</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
