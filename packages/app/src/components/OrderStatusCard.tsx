import { View, Text } from 'dripsy';
import { Link } from 'solito/link';
import type { ManufacturingOrderStatus } from '@iish/shared';

interface OrderStatusCardProps {
  order: {
    id: string;
    status: string;
    partnerName: string;
    partnerType?: string;
    quotePrice: number | null;
    quoteCurrency: string | null;
    quoteTurnaroundWeeks: number | null;
    totalCost: number | null;
    batchNumber: string | null;
    trackingNumber: string | null;
    message?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

const ORDER_STATUS_LABELS: Record<ManufacturingOrderStatus, string> = {
  inquiry_sent: 'Inquiry Sent',
  quote_received: 'Quote Received',
  quote_accepted: 'Quote Accepted',
  blueprint_transferred: 'Blueprint Transferred',
  in_production: 'In Production',
  qc_in_progress: 'QC In Progress',
  shipped: 'Shipped',
  delivered: 'Delivered',
  ready_for_administration: 'Ready for Administration',
};

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  inquiry_sent: { bg: 'yellow100', text: 'yellow800' },
  quote_received: { bg: 'blue100', text: 'blue800' },
  quote_accepted: { bg: 'indigo100', text: 'indigo600' },
  blueprint_transferred: { bg: 'purple100', text: 'purple800' },
  in_production: { bg: 'orange100', text: 'orange600' },
  qc_in_progress: { bg: 'cyan100', text: 'cyan600' },
  shipped: { bg: 'teal100', text: 'teal600' },
  delivered: { bg: 'green100', text: 'green700' },
  ready_for_administration: { bg: 'green100', text: 'green800' },
};

function formatCurrency(amount: number, currency?: string | null): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OrderStatusCard({ order }: OrderStatusCardProps) {
  const statusLabel =
    ORDER_STATUS_LABELS[order.status as ManufacturingOrderStatus] ?? order.status;
  const badgeColors = STATUS_BADGE_COLORS[order.status] ?? { bg: 'gray100', text: 'gray800' };

  return (
    <Link href={`/manufacture/orders/${order.id}`}>
      <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>{order.partnerName}</Text>
            <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>
              Created {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View sx={{ borderRadius: '$full', bg: badgeColors.bg, px: 10, py: 2 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: badgeColors.text }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {order.quotePrice != null && (
          <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$4' }}>
            <View>
              <Text sx={{ fontSize: '$sm', color: 'gray500' }}>
                Quote:{' '}
                <Text sx={{ fontWeight: '500', color: 'gray900' }}>
                  {formatCurrency(order.quotePrice, order.quoteCurrency)}
                </Text>
              </Text>
            </View>
            {order.quoteTurnaroundWeeks != null && (
              <View>
                <Text sx={{ fontSize: '$sm', color: 'gray500' }}>
                  Turnaround:{' '}
                  <Text sx={{ fontWeight: '500', color: 'gray900' }}>
                    {order.quoteTurnaroundWeeks} weeks
                  </Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {order.batchNumber && (
          <Text sx={{ mt: '$2', fontSize: '$xs', color: 'gray500' }}>
            Batch: {order.batchNumber}
          </Text>
        )}

        {order.trackingNumber && (
          <Text sx={{ mt: '$1', fontSize: '$xs', color: 'gray500' }}>
            Tracking: {order.trackingNumber}
          </Text>
        )}

        <Text sx={{ mt: '$3', fontSize: 11, color: 'gray400' }}>
          Last updated {new Date(order.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </Link>
  );
}
