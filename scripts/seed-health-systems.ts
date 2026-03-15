import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const EPIC_SANDBOX_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

const HEALTH_SYSTEMS = [
  // Major cancer centers
  { name: 'Memorial Sloan Kettering Cancer Center', city: 'New York', state: 'NY', isCancerCenter: true, brand: 'MyChart' },
  { name: 'MD Anderson Cancer Center', city: 'Houston', state: 'TX', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Dana-Farber Cancer Institute', city: 'Boston', state: 'MA', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Mayo Clinic', city: 'Rochester', state: 'MN', isCancerCenter: true, brand: 'Patient Online Services' },
  { name: 'City of Hope', city: 'Duarte', state: 'CA', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Johns Hopkins Medicine', city: 'Baltimore', state: 'MD', isCancerCenter: true, brand: 'MyChart' },
  { name: 'UCSF Health', city: 'San Francisco', state: 'CA', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Stanford Health Care', city: 'Stanford', state: 'CA', isCancerCenter: true, brand: 'MyHealth' },
  { name: 'Fred Hutchinson Cancer Center', city: 'Seattle', state: 'WA', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Moffitt Cancer Center', city: 'Tampa', state: 'FL', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Huntsman Cancer Institute', city: 'Salt Lake City', state: 'UT', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Roswell Park Comprehensive Cancer Center', city: 'Buffalo', state: 'NY', isCancerCenter: true, brand: 'MyRoswell' },
  { name: 'Duke Cancer Institute', city: 'Durham', state: 'NC', isCancerCenter: true, brand: 'MyChart' },
  { name: 'Emory Winship Cancer Institute', city: 'Atlanta', state: 'GA', isCancerCenter: true, brand: 'MyChart' },

  // Large health systems
  { name: 'Kaiser Permanente', city: 'Oakland', state: 'CA', isCancerCenter: false, brand: 'My Health Manager' },
  { name: 'HCA Healthcare', city: 'Nashville', state: 'TN', isCancerCenter: false, brand: 'MyHealthONE' },
  { name: 'CommonSpirit Health', city: 'Chicago', state: 'IL', isCancerCenter: false, brand: 'MyChart' },
  { name: 'Ascension Health', city: 'St. Louis', state: 'MO', isCancerCenter: false, brand: 'My Ascension' },
  { name: 'Providence Health', city: 'Renton', state: 'WA', isCancerCenter: false, brand: 'MyChart' },
  { name: 'Intermountain Health', city: 'Salt Lake City', state: 'UT', isCancerCenter: false, brand: 'My Health+' },
  { name: 'Advocate Aurora Health', city: 'Milwaukee', state: 'WI', isCancerCenter: false, brand: 'LiveWell' },
  { name: 'Northwell Health', city: 'New Hyde Park', state: 'NY', isCancerCenter: false, brand: 'FollowMyHealth' },
  { name: 'NYU Langone Health', city: 'New York', state: 'NY', isCancerCenter: false, brand: 'MyChart' },
  { name: 'Mass General Brigham', city: 'Boston', state: 'MA', isCancerCenter: false, brand: 'Patient Gateway' },
  { name: 'Cedars-Sinai', city: 'Los Angeles', state: 'CA', isCancerCenter: false, brand: 'My CS-Link' },
  { name: 'Mount Sinai Health System', city: 'New York', state: 'NY', isCancerCenter: false, brand: 'MyChart' },
  { name: 'Penn Medicine', city: 'Philadelphia', state: 'PA', isCancerCenter: false, brand: 'myPennMedicine' },
  { name: 'UCLA Health', city: 'Los Angeles', state: 'CA', isCancerCenter: false, brand: 'MyChart' },
  { name: 'UPMC', city: 'Pittsburgh', state: 'PA', isCancerCenter: false, brand: 'MyUPMC' },
];

async function main() {
  console.log(`Seeding ${HEALTH_SYSTEMS.length} health systems...\n`);

  let created = 0;
  let skipped = 0;

  for (const system of HEALTH_SYSTEMS) {
    const existing = await prisma.healthSystem.findFirst({
      where: { name: system.name },
    });

    if (existing) {
      console.log(`  SKIP: ${system.name} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.healthSystem.create({
      data: {
        name: system.name,
        fhirBaseUrl: EPIC_SANDBOX_URL,
        brand: system.brand,
        city: system.city,
        state: system.state,
        isCancerCenter: system.isCancerCenter,
        ehrVendor: 'epic',
      },
    });

    console.log(`  CREATE: ${system.name} (${system.city}, ${system.state})`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
