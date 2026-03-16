'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Partner {
  id: string;
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
  description: string | null;
  contactEmail: string | null;
  contactUrl: string | null;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  large_cdmo: 'Large CDMO',
  specialized_mrna: 'Specialized mRNA',
  academic_modular: 'Academic / Modular',
};

const CAPABILITY_LABELS: Record<string, string> = {
  mRNA_synthesis: 'mRNA Synthesis',
  lnp_formulation: 'LNP Formulation',
  fill_finish: 'Fill & Finish',
  plasmid_dna: 'Plasmid DNA',
  quality_control: 'Quality Control',
  analytics: 'Analytical Testing',
  cold_chain: 'Cold Chain Logistics',
  lyophilization: 'Lyophilization',
  modified_nucleotides: 'Modified Nucleotides',
  capping: '5\' Capping',
  self_amplifying_rna: 'Self-Amplifying RNA',
  lipid_synthesis: 'Lipid Synthesis',
  research_grade: 'Research Grade Production',
  technology_transfer: 'Technology Transfer',
  continuous_manufacturing: 'Continuous Manufacturing',
  miniaturized_production: 'Miniaturized Production',
  modular_manufacturing: 'Modular Manufacturing',
  gene_therapy: 'Gene Therapy',
};

const REG_LABELS: Record<string, string> = {
  ind_filing: 'IND Filing Assistance',
  fda_consultation: 'FDA Consultation',
  ema_consultation: 'EMA Consultation',
  regulatory_strategy: 'Regulatory Strategy',
  batch_documentation: 'Batch Documentation',
  who_consultation: 'WHO Consultation',
  academic_consultation: 'Academic Consultation',
};

function formatCost(min: number | null, max: number | null): string {
  if (!min && !max) return 'Contact for pricing';
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiring, setInquiring] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/manufacturing/${params.partnerId}`);
        if (res.ok) {
          const data = await res.json();
          setPartner(data.partner);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.partnerId]);

  async function handleInquire() {
    if (!partner) return;
    setInquiring(true);
    try {
      const res = await fetch('/api/manufacturing/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: partner.id }),
      });
      if (res.ok && partner.contactUrl) {
        window.open(partner.contactUrl, '_blank', 'noopener,noreferrer');
      } else if (res.status === 401) {
        router.push('/auth');
      }
    } catch {
      // Ignore
    } finally {
      setInquiring(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-gray-500">Partner not found.</p>
        <Link href="/manufacture/partners" className="mt-2 inline-block text-sm text-blue-600">
          &larr; Back to partners
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/manufacture/partners" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; All partners
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
          <p className="mt-1 text-gray-500">
            {TYPE_LABELS[partner.type] ?? partner.type} &middot; {partner.country}
          </p>
        </div>
        <button
          onClick={handleInquire}
          disabled={inquiring}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {inquiring ? 'Logging inquiry...' : 'Contact Partner'}
        </button>
      </div>

      {partner.description && (
        <p className="mt-4 text-gray-600">{partner.description}</p>
      )}

      {/* Key Metrics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Cost Range</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatCost(partner.costRangeMin, partner.costRangeMax)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Turnaround</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {partner.turnaroundWeeksMin && partner.turnaroundWeeksMax
              ? `${partner.turnaroundWeeksMin}–${partner.turnaroundWeeksMax} weeks`
              : 'Contact for timeline'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Capacity Tier</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
            {partner.capacityTier.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Capabilities</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {partner.capabilities.map(cap => (
            <div key={cap} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-sm text-gray-700">{CAPABILITY_LABELS[cap] ?? cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {partner.certifications.map(cert => (
            <span key={cert} className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
              {cert.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Regulatory Support */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Regulatory Support</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {partner.regulatorySupport.map(reg => (
            <div key={reg} className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">{REG_LABELS[reg] ?? reg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-8 rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
        <div className="mt-3 space-y-2">
          {partner.contactUrl && (
            <p className="text-sm">
              <span className="text-gray-500">Website:</span>{' '}
              <a href={partner.contactUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                {partner.contactUrl}
              </a>
            </p>
          )}
          {partner.contactEmail && (
            <p className="text-sm">
              <span className="text-gray-500">Email:</span>{' '}
              <a href={`mailto:${partner.contactEmail}`} className="text-blue-600 hover:text-blue-800">
                {partner.contactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
