import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '../packages/db/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface PartnerSeed {
  name: string;
  slug: string;
  type: string;
  capabilities: string[];
  certifications: string[];
  capacityTier: string;
  costRangeMin: number | null;
  costRangeMax: number | null;
  turnaroundWeeksMin: number | null;
  turnaroundWeeksMax: number | null;
  country: string;
  regulatorySupport: string[];
  description: string;
  contactEmail: string | null;
  contactUrl: string | null;
}

const partners: PartnerSeed[] = [
  // === Tier 1: Large CDMOs ===
  {
    name: 'Thermo Fisher Scientific',
    slug: 'thermo-fisher',
    type: 'large_cdmo',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'plasmid_dna', 'quality_control', 'cold_chain'],
    certifications: ['GMP', 'FDA_registered', 'EMA_approved', 'ISO_13485'],
    capacityTier: 'tier_1',
    costRangeMin: 150000,
    costRangeMax: 500000,
    turnaroundWeeksMin: 12,
    turnaroundWeeksMax: 24,
    country: 'United States',
    regulatorySupport: ['ind_filing', 'fda_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'Global leader in pharmaceutical services with extensive mRNA manufacturing capabilities. Offers end-to-end development from sequence to finished product.',
    contactEmail: null,
    contactUrl: 'https://www.thermofisher.com/pharmaservices',
  },
  {
    name: 'Lonza',
    slug: 'lonza',
    type: 'large_cdmo',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'plasmid_dna', 'quality_control', 'analytics', 'cold_chain'],
    certifications: ['GMP', 'FDA_registered', 'EMA_approved', 'ISO_13485', 'MHRA_approved'],
    capacityTier: 'tier_1',
    costRangeMin: 200000,
    costRangeMax: 600000,
    turnaroundWeeksMin: 14,
    turnaroundWeeksMax: 28,
    country: 'Switzerland',
    regulatorySupport: ['ind_filing', 'fda_consultation', 'ema_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'Swiss-headquartered CDMO with proven mRNA manufacturing track record from COVID-19 vaccine production. Strong regulatory expertise across FDA and EMA.',
    contactEmail: null,
    contactUrl: 'https://www.lonza.com/capabilities/biologics',
  },
  {
    name: 'Catalent',
    slug: 'catalent',
    type: 'large_cdmo',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'quality_control', 'analytics', 'cold_chain', 'lyophilization'],
    certifications: ['GMP', 'FDA_registered', 'EMA_approved', 'ISO_13485'],
    capacityTier: 'tier_1',
    costRangeMin: 125000,
    costRangeMax: 450000,
    turnaroundWeeksMin: 10,
    turnaroundWeeksMax: 22,
    country: 'United States',
    regulatorySupport: ['ind_filing', 'fda_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'Leading global CDMO with dedicated mRNA and gene therapy manufacturing suites. Experienced in personalized medicine production.',
    contactEmail: null,
    contactUrl: 'https://www.catalent.com/cell-gene-therapy',
  },
  {
    name: 'Samsung Biologics',
    slug: 'samsung-biologics',
    type: 'large_cdmo',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'quality_control', 'analytics', 'cold_chain'],
    certifications: ['GMP', 'FDA_registered', 'EMA_approved', 'MFDS_approved'],
    capacityTier: 'tier_1',
    costRangeMin: 100000,
    costRangeMax: 400000,
    turnaroundWeeksMin: 12,
    turnaroundWeeksMax: 26,
    country: 'South Korea',
    regulatorySupport: ['ind_filing', 'fda_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'World\'s largest biopharmaceutical CDMO by capacity with state-of-the-art mRNA manufacturing facilities.',
    contactEmail: null,
    contactUrl: 'https://www.samsungbiologics.com',
  },
  {
    name: 'WuXi Biologics',
    slug: 'wuxi-biologics',
    type: 'large_cdmo',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'plasmid_dna', 'quality_control', 'analytics'],
    certifications: ['GMP', 'FDA_registered', 'EMA_approved', 'NMPA_approved'],
    capacityTier: 'tier_1',
    costRangeMin: 80000,
    costRangeMax: 350000,
    turnaroundWeeksMin: 10,
    turnaroundWeeksMax: 20,
    country: 'China',
    regulatorySupport: ['ind_filing', 'fda_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'Global CDMO with comprehensive mRNA platform capabilities and competitive pricing. Facilities in China, US, and Europe.',
    contactEmail: null,
    contactUrl: 'https://www.wuxibiologics.com',
  },

  // === Tier 2: Specialized mRNA ===
  {
    name: 'Aldevron',
    slug: 'aldevron',
    type: 'specialized_mrna',
    capabilities: ['mRNA_synthesis', 'plasmid_dna', 'quality_control', 'analytics'],
    certifications: ['GMP', 'FDA_registered', 'ISO_13485'],
    capacityTier: 'tier_2',
    costRangeMin: 75000,
    costRangeMax: 250000,
    turnaroundWeeksMin: 8,
    turnaroundWeeksMax: 16,
    country: 'United States',
    regulatorySupport: ['ind_filing', 'regulatory_strategy', 'batch_documentation'],
    description: 'Specialized mRNA and plasmid DNA manufacturer with deep expertise in nucleic acid therapies. Key supplier for mRNA vaccine programs.',
    contactEmail: null,
    contactUrl: 'https://www.aldevron.com',
  },
  {
    name: 'TriLink BioTechnologies',
    slug: 'trilink',
    type: 'specialized_mrna',
    capabilities: ['mRNA_synthesis', 'modified_nucleotides', 'capping', 'quality_control', 'analytics'],
    certifications: ['GMP', 'FDA_registered', 'ISO_13485'],
    capacityTier: 'tier_2',
    costRangeMin: 60000,
    costRangeMax: 200000,
    turnaroundWeeksMin: 6,
    turnaroundWeeksMax: 14,
    country: 'United States',
    regulatorySupport: ['regulatory_strategy', 'batch_documentation'],
    description: 'Premier mRNA synthesis specialist known for CleanCap technology and modified nucleotides. Ideal for personalized mRNA constructs.',
    contactEmail: null,
    contactUrl: 'https://www.trilinkbiotech.com',
  },
  {
    name: 'Arcturus Therapeutics',
    slug: 'arcturus',
    type: 'specialized_mrna',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'self_amplifying_rna', 'quality_control'],
    certifications: ['GMP', 'FDA_registered'],
    capacityTier: 'tier_2',
    costRangeMin: 100000,
    costRangeMax: 300000,
    turnaroundWeeksMin: 10,
    turnaroundWeeksMax: 20,
    country: 'United States',
    regulatorySupport: ['ind_filing', 'regulatory_strategy', 'batch_documentation'],
    description: 'mRNA therapeutics company with proprietary LUNAR lipid delivery platform and self-amplifying RNA technology.',
    contactEmail: null,
    contactUrl: 'https://www.arcturusrx.com',
  },
  {
    name: 'CureVac',
    slug: 'curevac',
    type: 'specialized_mrna',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'quality_control', 'analytics', 'fill_finish'],
    certifications: ['GMP', 'EMA_approved', 'FDA_registered'],
    capacityTier: 'tier_2',
    costRangeMin: 120000,
    costRangeMax: 350000,
    turnaroundWeeksMin: 12,
    turnaroundWeeksMax: 22,
    country: 'Germany',
    regulatorySupport: ['ind_filing', 'ema_consultation', 'fda_consultation', 'regulatory_strategy'],
    description: 'Pioneer in mRNA technology with over 20 years of experience. Proprietary mRNA optimization platform for enhanced stability and efficacy.',
    contactEmail: null,
    contactUrl: 'https://www.curevac.com',
  },
  {
    name: 'Acuitas Therapeutics',
    slug: 'acuitas',
    type: 'specialized_mrna',
    capabilities: ['lnp_formulation', 'lipid_synthesis', 'quality_control', 'analytics'],
    certifications: ['GMP', 'FDA_registered'],
    capacityTier: 'tier_2',
    costRangeMin: 50000,
    costRangeMax: 150000,
    turnaroundWeeksMin: 6,
    turnaroundWeeksMax: 12,
    country: 'Canada',
    regulatorySupport: ['regulatory_strategy', 'batch_documentation'],
    description: 'World-leading LNP formulation specialist whose technology was used in the Pfizer-BioNTech COVID-19 vaccine. Expert in lipid nanoparticle delivery systems.',
    contactEmail: null,
    contactUrl: 'https://www.acuitastx.com',
  },

  // === Tier 3: Academic/Modular ===
  {
    name: 'UNSW RNA Institute',
    slug: 'unsw-rna-institute',
    type: 'academic_modular',
    capabilities: ['mRNA_synthesis', 'quality_control', 'research_grade', 'analytics'],
    certifications: ['research_grade', 'TGA_registered'],
    capacityTier: 'tier_3',
    costRangeMin: 30000,
    costRangeMax: 100000,
    turnaroundWeeksMin: 8,
    turnaroundWeeksMax: 16,
    country: 'Australia',
    regulatorySupport: ['regulatory_strategy', 'academic_consultation'],
    description: 'Academic RNA research and manufacturing center with expertise in personalized mRNA therapeutics. Lower cost for compassionate use and clinical trial material.',
    contactEmail: null,
    contactUrl: 'https://www.unsw.edu.au/rna-institute',
  },
  {
    name: 'Afrigen Biologics',
    slug: 'afrigen',
    type: 'academic_modular',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'quality_control', 'technology_transfer'],
    certifications: ['GMP', 'SAHPRA_registered'],
    capacityTier: 'tier_3',
    costRangeMin: 40000,
    costRangeMax: 120000,
    turnaroundWeeksMin: 10,
    turnaroundWeeksMax: 20,
    country: 'South Africa',
    regulatorySupport: ['regulatory_strategy', 'who_consultation'],
    description: 'WHO-backed mRNA technology hub for Africa. Established to build regional vaccine manufacturing capability with accessible pricing.',
    contactEmail: null,
    contactUrl: 'https://www.afrigen.co.za',
  },
  {
    name: 'BioNTech BioNTainer',
    slug: 'biontech-biontainer',
    type: 'academic_modular',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'quality_control', 'modular_manufacturing'],
    certifications: ['GMP', 'EMA_approved', 'FDA_registered'],
    capacityTier: 'tier_3',
    costRangeMin: 75000,
    costRangeMax: 200000,
    turnaroundWeeksMin: 8,
    turnaroundWeeksMax: 18,
    country: 'Germany',
    regulatorySupport: ['ind_filing', 'ema_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'Modular containerized mRNA manufacturing solution by BioNTech. Self-contained production units that can be deployed globally.',
    contactEmail: null,
    contactUrl: 'https://www.biontech.com/biontainer',
  },
  {
    name: 'Quantoom Biosciences',
    slug: 'quantoom',
    type: 'academic_modular',
    capabilities: ['mRNA_synthesis', 'continuous_manufacturing', 'quality_control', 'miniaturized_production'],
    certifications: ['GMP', 'EMA_approved'],
    capacityTier: 'tier_3',
    costRangeMin: 35000,
    costRangeMax: 100000,
    turnaroundWeeksMin: 4,
    turnaroundWeeksMax: 10,
    country: 'Belgium',
    regulatorySupport: ['regulatory_strategy', 'batch_documentation'],
    description: 'Innovative continuous-flow mRNA manufacturing platform enabling rapid, small-batch personalized vaccine production at significantly reduced cost.',
    contactEmail: null,
    contactUrl: 'https://www.quantoom.com',
  },
  {
    name: 'National Resilience',
    slug: 'national-resilience',
    type: 'academic_modular',
    capabilities: ['mRNA_synthesis', 'lnp_formulation', 'fill_finish', 'quality_control', 'analytics', 'gene_therapy'],
    certifications: ['GMP', 'FDA_registered', 'ISO_13485'],
    capacityTier: 'tier_3',
    costRangeMin: 80000,
    costRangeMax: 250000,
    turnaroundWeeksMin: 8,
    turnaroundWeeksMax: 16,
    country: 'United States',
    regulatorySupport: ['ind_filing', 'fda_consultation', 'regulatory_strategy', 'batch_documentation'],
    description: 'US biomanufacturing company focused on broadening access to complex medicines. Dedicated mRNA and gene therapy manufacturing with rapid turnaround.',
    contactEmail: null,
    contactUrl: 'https://www.resilience.com',
  },
];

async function seed() {
  console.log(`Seeding ${partners.length} manufacturing partners...`);

  for (const partner of partners) {
    const existing = await prisma.manufacturingPartner.findFirst({
      where: { slug: partner.slug },
    });
    if (!existing) {
      await prisma.manufacturingPartner.create({ data: partner });
      console.log(`  Created: ${partner.name}`);
    } else {
      console.log(`  Exists:  ${partner.name}`);
    }
  }

  const count = await prisma.manufacturingPartner.count();
  console.log(`\nDone. Total manufacturing partners in database: ${count}`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
