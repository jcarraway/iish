import { authResolvers } from './auth';
import { patientResolvers } from './patients';
import { matchResolvers } from './matches';
import { trialResolvers } from './trials';
import { documentResolvers } from './documents';
import { financialResolvers } from './financial';
import { sequencingResolvers } from './sequencing';
import { genomicResolvers } from './genomics';
import { pipelineResolvers } from './pipeline';
import { manufacturingResolvers } from './manufacturing';
import { monitoringResolvers } from './monitoring';

/**
 * Merge all resolver maps into a single object.
 * Combines Query, Mutation, and type-level resolvers from each domain.
 */
function mergeResolvers(...resolverMaps: Record<string, any>[]) {
  const merged: Record<string, any> = {};
  for (const map of resolverMaps) {
    for (const [key, value] of Object.entries(map)) {
      if (merged[key]) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = { ...value };
      }
    }
  }
  return merged;
}

export const resolvers = mergeResolvers(
  authResolvers,
  patientResolvers,
  matchResolvers,
  trialResolvers,
  documentResolvers,
  financialResolvers,
  sequencingResolvers,
  genomicResolvers,
  pipelineResolvers,
  manufacturingResolvers,
  monitoringResolvers,
);
