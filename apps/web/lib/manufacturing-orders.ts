import type { ManufacturingOrderStatus } from '@oncovax/shared';

export const ORDER_STATUS_LABELS: Record<ManufacturingOrderStatus, string> = {
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

const STATUS_ORDER: ManufacturingOrderStatus[] = [
  'inquiry_sent',
  'quote_received',
  'quote_accepted',
  'blueprint_transferred',
  'in_production',
  'qc_in_progress',
  'shipped',
  'delivered',
  'ready_for_administration',
];

const VALID_TRANSITIONS: Record<ManufacturingOrderStatus, ManufacturingOrderStatus[]> = {
  inquiry_sent: ['quote_received'],
  quote_received: ['quote_accepted'],
  quote_accepted: ['blueprint_transferred'],
  blueprint_transferred: ['in_production'],
  in_production: ['qc_in_progress'],
  qc_in_progress: ['shipped'],
  shipped: ['delivered'],
  delivered: ['ready_for_administration'],
  ready_for_administration: [],
};

export function getNextOrderStatus(current: ManufacturingOrderStatus): ManufacturingOrderStatus | null {
  const next = VALID_TRANSITIONS[current];
  return next.length > 0 ? next[0] : null;
}

export function isValidTransition(from: ManufacturingOrderStatus, to: ManufacturingOrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface TimelineEntry {
  status: ManufacturingOrderStatus;
  label: string;
  date: string | null;
  completed: boolean;
  current: boolean;
}

export function getOrderTimeline(order: {
  status: string;
  createdAt: string | Date;
  blueprintSentAt?: string | Date | null;
  productionStartedAt?: string | Date | null;
  qcStartedAt?: string | Date | null;
  qcCompletedAt?: string | Date | null;
  shippedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
  administeredAt?: string | Date | null;
}): TimelineEntry[] {
  const currentIdx = STATUS_ORDER.indexOf(order.status as ManufacturingOrderStatus);

  const dateMap: Partial<Record<ManufacturingOrderStatus, string | Date | null | undefined>> = {
    inquiry_sent: order.createdAt,
    blueprint_transferred: order.blueprintSentAt,
    in_production: order.productionStartedAt,
    qc_in_progress: order.qcStartedAt,
    shipped: order.shippedAt,
    delivered: order.deliveredAt,
    ready_for_administration: order.administeredAt,
  };

  return STATUS_ORDER.map((status, idx) => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    date: dateMap[status] ? new Date(dateMap[status] as string | Date).toISOString() : null,
    completed: idx < currentIdx,
    current: idx === currentIdx,
  }));
}

export function packageBlueprint(pipelineJob: {
  vaccineBlueprint: unknown;
  topNeoantigens: unknown;
  hlaGenotype: unknown;
  neoantigenCount: number | null;
}): Record<string, unknown> {
  return {
    vaccineBlueprint: pipelineJob.vaccineBlueprint,
    topNeoantigens: pipelineJob.topNeoantigens,
    hlaGenotype: pipelineJob.hlaGenotype,
    neoantigenCount: pipelineJob.neoantigenCount,
    exportedAt: new Date().toISOString(),
    format: 'oncovax_blueprint_v1',
  };
}
