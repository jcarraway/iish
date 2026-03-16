/**
 * Shared Apollo Client cache configuration.
 *
 * Platform-specific clients (web/mobile) create their own ApolloClient
 * instances with different HTTP links, but share these type policies.
 */
import { InMemoryCache, TypePolicy } from '@apollo/client';

export const typePolicies: Record<string, TypePolicy> = {
  Patient: { keyFields: ['id'] },
  Trial: { keyFields: ['id'] },
  Match: { keyFields: ['id'] },
  Document: { keyFields: ['id'] },
  FinancialProgram: { keyFields: ['id'] },
  SequencingProvider: { keyFields: ['id'] },
  SequencingOrder: { keyFields: ['id'] },
  GenomicResult: { keyFields: ['id'] },
  PipelineJob: { keyFields: ['id'] },
  ManufacturingPartner: { keyFields: ['id'] },
  ManufacturingOrder: { keyFields: ['id'] },
  AdministrationSite: { keyFields: ['id'] },
  MonitoringReport: { keyFields: ['id'] },
  RegulatoryDocument: { keyFields: ['id'] },
  RegulatoryPathwayAssessment: { keyFields: ['id'] },
};

export function createCache() {
  return new InMemoryCache({ typePolicies });
}
