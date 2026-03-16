'use client';

import { useEffect, useState } from 'react';
import ManufacturingPartnerCard from '@/components/ManufacturingPartnerCard';

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
  contactUrl: string | null;
  status: string;
}

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'large_cdmo', label: 'Large CDMO' },
  { value: 'specialized_mrna', label: 'Specialized mRNA' },
  { value: 'academic_modular', label: 'Academic / Modular' },
];

const CAPABILITY_OPTIONS = [
  { value: '', label: 'All capabilities' },
  { value: 'mRNA_synthesis', label: 'mRNA Synthesis' },
  { value: 'lnp_formulation', label: 'LNP Formulation' },
  { value: 'fill_finish', label: 'Fill & Finish' },
  { value: 'plasmid_dna', label: 'Plasmid DNA' },
  { value: 'quality_control', label: 'Quality Control' },
];

const COUNTRY_OPTIONS = [
  { value: '', label: 'All countries' },
  { value: 'United States', label: 'United States' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Canada', label: 'Canada' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'China', label: 'China' },
  { value: 'Belgium', label: 'Belgium' },
  { value: 'Australia', label: 'Australia' },
  { value: 'South Africa', label: 'South Africa' },
];

export default function ManufacturingPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (capabilityFilter) params.set('capability', capabilityFilter);
      if (countryFilter) params.set('country', countryFilter);

      try {
        const res = await fetch(`/api/manufacturing?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPartners(data.partners);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [typeFilter, capabilityFilter, countryFilter]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Manufacturing Partners</h1>
      <p className="mt-2 text-sm text-gray-600">
        Browse contract manufacturing organizations (CDMOs) capable of producing personalized mRNA cancer vaccines.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={capabilityFilter}
          onChange={e => setCapabilityFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {CAPABILITY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {COUNTRY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading partners...</p>
        </div>
      ) : partners.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No partners match your filters.</p>
          <button
            onClick={() => { setTypeFilter(''); setCapabilityFilter(''); setCountryFilter(''); }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-xs text-gray-500">{partners.length} partner{partners.length !== 1 ? 's' : ''}</p>
          <div className="mt-2 space-y-3">
            {partners.map(p => (
              <ManufacturingPartnerCard key={p.id} {...p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
