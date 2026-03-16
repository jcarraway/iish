import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface SiteSeed {
  name: string;
  type: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  address: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  canAdministerMrna: boolean;
  hasInfusionCenter: boolean;
  hasEmergencyResponse: boolean;
  hasMonitoringCapacity: boolean;
  investigationalExp: boolean;
  irbAffiliation: string | null;
  verified: boolean;
  willingToAdminister: boolean;
}

const sites: SiteSeed[] = [
  {
    name: 'MD Anderson Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Clinical Trials Office',
    contactEmail: null,
    contactPhone: '877-632-6789',
    website: 'https://www.mdanderson.org',
    address: '1515 Holcombe Blvd',
    city: 'Houston',
    state: 'TX',
    zip: '77030',
    country: 'United States',
    lat: 29.7069,
    lng: -95.3972,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'UT MD Anderson IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Memorial Sloan Kettering Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Investigational Drug Service',
    contactEmail: null,
    contactPhone: '212-639-2000',
    website: 'https://www.mskcc.org',
    address: '1275 York Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10065',
    country: 'United States',
    lat: 40.7644,
    lng: -73.9566,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'MSK IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Dana-Farber Cancer Institute',
    type: 'academic_medical_center',
    contactName: 'Clinical Research Office',
    contactEmail: null,
    contactPhone: '617-632-3000',
    website: 'https://www.dana-farber.org',
    address: '450 Brookline Avenue',
    city: 'Boston',
    state: 'MA',
    zip: '02215',
    country: 'United States',
    lat: 42.3377,
    lng: -71.1068,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'Dana-Farber/Harvard Cancer Center IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Mayo Clinic Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Cancer Clinical Trials',
    contactEmail: null,
    contactPhone: '507-284-2511',
    website: 'https://www.mayoclinic.org',
    address: '200 First Street SW',
    city: 'Rochester',
    state: 'MN',
    zip: '55905',
    country: 'United States',
    lat: 44.0225,
    lng: -92.4668,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'Mayo Clinic IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'UCSF Helen Diller Family Comprehensive Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Clinical Trials Office',
    contactEmail: null,
    contactPhone: '415-353-7070',
    website: 'https://cancer.ucsf.edu',
    address: '1825 4th Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94158',
    country: 'United States',
    lat: 37.7680,
    lng: -122.3905,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'UCSF IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Moffitt Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Clinical Trials Office',
    contactEmail: null,
    contactPhone: '888-663-3488',
    website: 'https://www.moffitt.org',
    address: '12902 USF Magnolia Drive',
    city: 'Tampa',
    state: 'FL',
    zip: '33612',
    country: 'United States',
    lat: 28.0656,
    lng: -82.4325,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'Advarra IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Seattle Cancer Care Alliance',
    type: 'academic_medical_center',
    contactName: 'Infusion Services',
    contactEmail: null,
    contactPhone: '206-606-7222',
    website: 'https://www.seattlecca.org',
    address: '825 Eastlake Ave E',
    city: 'Seattle',
    state: 'WA',
    zip: '98109',
    country: 'United States',
    lat: 47.6269,
    lng: -122.3320,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'Fred Hutch IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Northwestern Memorial Hospital Infusion Center',
    type: 'infusion_center',
    contactName: 'Infusion Center Manager',
    contactEmail: null,
    contactPhone: '312-695-0990',
    website: 'https://www.nm.org',
    address: '251 E Huron St',
    city: 'Chicago',
    state: 'IL',
    zip: '60611',
    country: 'United States',
    lat: 41.8949,
    lng: -87.6217,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: false,
    irbAffiliation: 'Northwestern University IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Arizona Oncology — Tucson',
    type: 'community_oncology',
    contactName: 'Clinic Administrator',
    contactEmail: null,
    contactPhone: '520-886-0206',
    website: 'https://www.arizonaoncology.com',
    address: '6565 E Carondelet Dr',
    city: 'Tucson',
    state: 'AZ',
    zip: '85710',
    country: 'United States',
    lat: 32.2100,
    lng: -110.8753,
    canAdministerMrna: false,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: false,
    irbAffiliation: null,
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Emory Winship Cancer Institute',
    type: 'academic_medical_center',
    contactName: 'Clinical Trials',
    contactEmail: null,
    contactPhone: '404-778-1900',
    website: 'https://winshipcancer.emory.edu',
    address: '1365 Clifton Rd NE',
    city: 'Atlanta',
    state: 'GA',
    zip: '30322',
    country: 'United States',
    lat: 33.7945,
    lng: -84.3236,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'Emory University IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'UCLA Jonsson Comprehensive Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Clinical Research',
    contactEmail: null,
    contactPhone: '310-825-5268',
    website: 'https://cancer.ucla.edu',
    address: '10833 Le Conte Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90095',
    country: 'United States',
    lat: 34.0660,
    lng: -118.4464,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'UCLA IRB',
    verified: true,
    willingToAdminister: true,
  },
  {
    name: 'Penn Medicine Abramson Cancer Center',
    type: 'academic_medical_center',
    contactName: 'Clinical Trials Office',
    contactEmail: null,
    contactPhone: '215-662-4000',
    website: 'https://www.pennmedicine.org/cancer',
    address: '3400 Civic Center Blvd',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19104',
    country: 'United States',
    lat: 39.9478,
    lng: -75.1952,
    canAdministerMrna: true,
    hasInfusionCenter: true,
    hasEmergencyResponse: true,
    hasMonitoringCapacity: true,
    investigationalExp: true,
    irbAffiliation: 'University of Pennsylvania IRB',
    verified: true,
    willingToAdminister: true,
  },
];

async function seed() {
  console.log(`Seeding ${sites.length} administration sites...`);

  for (const site of sites) {
    const existing = await prisma.administrationSite.findFirst({
      where: { name: site.name, city: site.city },
    });
    if (!existing) {
      await prisma.administrationSite.create({ data: site });
      console.log(`  Created: ${site.name} (${site.city}, ${site.state})`);
    } else {
      console.log(`  Exists:  ${site.name} (${site.city}, ${site.state})`);
    }
  }

  const count = await prisma.administrationSite.count();
  console.log(`\nDone. Total administration sites in database: ${count}`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
