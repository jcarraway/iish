import { Prisma, type PrismaClient } from '@iish/db/generated/prisma';
import { fetchAllStudies, type CTGStudy } from './clinicaltrials';
import { geocodeAddress } from './mapbox';

const VACCINE_KEYWORDS = ['mrna', 'vaccine', 'neoantigen', 'autogene cevumeran', 'mrna-4157'];

const PREVENTIVE_VACCINE_KEYWORDS = [
  'prevention vaccine', 'preventive vaccine', 'prophylactic vaccine',
  'alpha-lactalbumin', 'cancer prevention', 'risk reduction vaccine',
  'immunoprevention',
];
const CHEMOPREVENTION_KEYWORDS = [
  'chemoprevention', 'tamoxifen prevention', 'raloxifene prevention',
  'aromatase inhibitor prevention', 'exemestane prevention',
];
const RECURRENCE_PREVENTION_KEYWORDS = [
  'recurrence prevention', 'prevent recurrence', 'adjuvant vaccine',
  'maintenance vaccine', 'post-treatment vaccine', 'relapse prevention',
];
const RISK_REDUCTION_KEYWORDS = [
  'risk reduction', 'brca carrier', 'high risk', 'hereditary breast',
  'prophylactic', 'cancer interception',
];
const BIOMARKER_KEYWORDS = [
  'biomarker screening', 'early detection', 'liquid biopsy screening',
  'ctdna screening', 'multi-cancer detection',
];

export function classifyTrial(study: CTGStudy): { trialCategory: string; isPreventive: boolean } {
  const title = (study.protocolSection.identificationModule.briefTitle ?? '').toLowerCase();
  const officialTitle = (study.protocolSection.identificationModule.officialTitle ?? '').toLowerCase();
  const summary = (study.protocolSection.descriptionModule?.briefSummary ?? '').toLowerCase();
  const interventions = study.protocolSection.armsInterventionsModule?.interventions ?? [];
  const interventionText = interventions.map(i => `${i.name} ${i.description ?? ''}`).join(' ').toLowerCase();
  const searchText = `${title} ${officialTitle} ${summary} ${interventionText}`;

  if (PREVENTIVE_VACCINE_KEYWORDS.some(kw => searchText.includes(kw))) {
    return { trialCategory: 'preventive_vaccine', isPreventive: true };
  }
  if (RECURRENCE_PREVENTION_KEYWORDS.some(kw => searchText.includes(kw))) {
    return { trialCategory: 'recurrence_prevention', isPreventive: true };
  }
  if (CHEMOPREVENTION_KEYWORDS.some(kw => searchText.includes(kw))) {
    return { trialCategory: 'chemoprevention', isPreventive: true };
  }
  if (RISK_REDUCTION_KEYWORDS.some(kw => searchText.includes(kw))) {
    return { trialCategory: 'risk_reduction', isPreventive: true };
  }
  if (BIOMARKER_KEYWORDS.some(kw => searchText.includes(kw))) {
    return { trialCategory: 'biomarker', isPreventive: true };
  }
  return { trialCategory: 'therapeutic', isPreventive: false };
}

export interface SyncResult {
  trialsCreated: number;
  trialsUpdated: number;
  sitesCreated: number;
  sitesGeocoded: number;
  errors: { nctId: string; error: string }[];
  totalStudies: number;
}

function extractVaccineIntervention(study: CTGStudy) {
  const interventions = study.protocolSection.armsInterventionsModule?.interventions ?? [];

  for (const intervention of interventions) {
    const searchText = `${intervention.name} ${intervention.description ?? ''}`.toLowerCase();
    if (VACCINE_KEYWORDS.some((kw) => searchText.includes(kw))) {
      return {
        interventionName: intervention.name,
        interventionType: intervention.type,
        interventionDesc: intervention.description ?? null,
      };
    }
  }

  // Fall back to first intervention if no vaccine-specific one found
  if (interventions.length > 0) {
    return {
      interventionName: interventions[0].name,
      interventionType: interventions[0].type,
      interventionDesc: interventions[0].description ?? null,
    };
  }

  return { interventionName: null, interventionType: null, interventionDesc: null };
}

function mapStudyToTrial(study: CTGStudy) {
  const id = study.protocolSection.identificationModule;
  const status = study.protocolSection.statusModule;
  const sponsor = study.protocolSection.sponsorCollaboratorsModule;
  const design = study.protocolSection.designModule;
  const eligibility = study.protocolSection.eligibilityModule;
  const description = study.protocolSection.descriptionModule;
  const intervention = extractVaccineIntervention(study);

  const classification = classifyTrial(study);

  return {
    nctId: id.nctId,
    title: id.briefTitle,
    sponsor: sponsor?.leadSponsor?.name ?? null,
    phase: design?.phases?.join('/') ?? null,
    status: status.overallStatus,
    rawEligibilityText: eligibility?.eligibilityCriteria ?? null,
    briefSummary: description?.briefSummary ?? null,
    ...intervention,
    rawJson: JSON.parse(JSON.stringify(study)),
    lastSyncedAt: new Date(),
    trialCategory: classification.trialCategory,
    isPreventive: classification.isPreventive,
  };
}

export async function runTrialSync(
  db: PrismaClient,
  options?: { onProgress?: (msg: string) => void },
): Promise<SyncResult> {
  const log = options?.onProgress ?? console.log;
  const result: SyncResult = {
    trialsCreated: 0,
    trialsUpdated: 0,
    sitesCreated: 0,
    sitesGeocoded: 0,
    errors: [],
    totalStudies: 0,
  };

  log('Starting trial sync from ClinicalTrials.gov...');

  for await (const studies of fetchAllStudies()) {
    log(`Processing batch of ${studies.length} studies...`);

    for (const study of studies) {
      const nctId = study.protocolSection.identificationModule.nctId;
      result.totalStudies++;

      try {
        const trialData = mapStudyToTrial(study);

        // Check if trial exists
        const existing = await db.trial.findUnique({
          where: { nctId },
          select: { id: true, rawEligibilityText: true },
        });

        let trialId: string;

        if (existing) {
          // Preserve parsedEligibility if rawEligibilityText hasn't changed
          const eligibilityChanged = existing.rawEligibilityText !== trialData.rawEligibilityText;

          await db.trial.update({
            where: { nctId },
            data: {
              ...trialData,
              ...(eligibilityChanged ? { parsedEligibility: Prisma.DbNull } : {}),
            },
          });

          trialId = existing.id;
          result.trialsUpdated++;
        } else {
          const created = await db.trial.create({ data: trialData });
          trialId = created.id;
          result.trialsCreated++;
        }

        // Sync sites: delete all existing, recreate from fresh data
        await db.trialSite.deleteMany({ where: { trialId } });

        const locations = study.protocolSection.contactsLocationsModule?.locations ?? [];

        for (const loc of locations) {
          let lat = loc.geoPoint?.lat ?? null;
          let lng = loc.geoPoint?.lon ?? null;

          // Geocode if missing coordinates
          if (lat === null || lng === null) {
            const geocoded = await geocodeAddress({
              city: loc.city,
              state: loc.state,
              country: loc.country,
            });
            if (geocoded) {
              lat = geocoded.lat;
              lng = geocoded.lng;
              result.sitesGeocoded++;
            }
          }

          const contact = loc.contacts?.[0];

          await db.trialSite.create({
            data: {
              trialId,
              facility: loc.facility ?? null,
              city: loc.city ?? null,
              state: loc.state ?? null,
              country: loc.country ?? null,
              lat,
              lng,
              contactName: contact?.name ?? null,
              contactEmail: contact?.email ?? null,
              contactPhone: contact?.phone ?? null,
            },
          });

          result.sitesCreated++;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push({ nctId, error: message });
        log(`Error syncing ${nctId}: ${message}`);
      }
    }
  }

  log(
    `Sync complete: ${result.trialsCreated} created, ${result.trialsUpdated} updated, ` +
    `${result.sitesCreated} sites, ${result.sitesGeocoded} geocoded, ${result.errors.length} errors`,
  );

  return result;
}
