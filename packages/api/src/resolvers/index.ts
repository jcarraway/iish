import { authResolvers } from './auth';
import { patientResolvers } from './patients';
import { matchResolvers } from './matches';
import { matchesExtendedResolvers } from './matches-extended';
import { trialResolvers } from './trials';
import { documentResolvers } from './documents';
import { financialResolvers } from './financial';
import { financialExtendedResolvers } from './financial-extended';
import { sequencingResolvers } from './sequencing';
import { sequencingGuideResolvers } from './sequencing-guide';
import { genomicResolvers } from './genomics';
import { genomicsExtendedResolvers } from './genomics-extended';
import { pipelineResolvers } from './pipeline';
import { pipelineExtendedResolvers } from './pipeline-extended';
import { manufacturingResolvers } from './manufacturing';
import { manufacturingExtendedResolvers } from './manufacturing-extended';
import { monitoringResolvers } from './monitoring';
import { fhirResolvers } from './fhir';
import { survivorshipResolvers } from './survivorship';
import { recurrenceResolvers } from './recurrence';
import { fertilityResolvers } from './fertility';
import { advocateResolvers } from './advocate';
import { logisticsResolvers } from './logistics';
import { secondOpinionResolvers } from './second-opinion';
import { learnResolvers } from './learn';
import { intelResolvers } from './intel';
import { preventiveResolvers } from './preventive';
import { palliativeResolvers } from './palliative';
import { preventResolvers } from './prevent';

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
  matchesExtendedResolvers,
  trialResolvers,
  documentResolvers,
  financialResolvers,
  financialExtendedResolvers,
  sequencingResolvers,
  sequencingGuideResolvers,
  genomicResolvers,
  genomicsExtendedResolvers,
  pipelineResolvers,
  pipelineExtendedResolvers,
  manufacturingResolvers,
  manufacturingExtendedResolvers,
  monitoringResolvers,
  fhirResolvers,
  survivorshipResolvers,
  recurrenceResolvers,
  fertilityResolvers,
  advocateResolvers,
  logisticsResolvers,
  secondOpinionResolvers,
  learnResolvers,
  intelResolvers,
  preventiveResolvers,
  palliativeResolvers,
  preventResolvers,
);
