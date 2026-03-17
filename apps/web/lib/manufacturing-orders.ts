import type { ManufacturingOrderStatus } from '@oncovax/shared';

// Re-export from shared package
export { ORDER_STATUS_LABELS, getOrderTimeline } from '@oncovax/shared';
export type { TimelineEntry } from '@oncovax/shared';

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
