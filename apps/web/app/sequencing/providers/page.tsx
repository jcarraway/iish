'use client';

import { useEffect, useState, useCallback } from 'react';
import SequencingProviderCard from '@/components/SequencingProviderCard';
import type { SequencingProviderDetails } from '@oncovax/shared';

interface Provider {
  id: string;
  name: string;
  type: string;
  testTypes: string[];
  details: SequencingProviderDetails;
}

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'academic', label: 'Academic' },
  { value: 'emerging', label: 'Emerging' },
];

const TEST_FILTERS = [
  { value: '', label: 'All tests' },
  { value: 'comprehensive_genomic_profiling', label: 'Comprehensive (CGP)' },
  { value: 'liquid_biopsy', label: 'Liquid biopsy' },
  { value: 'targeted_panel', label: 'Targeted panel' },
  { value: 'rna_sequencing', label: 'RNA sequencing' },
  { value: 'whole_exome_sequencing', label: 'Whole exome' },
];

const SAMPLE_FILTERS = [
  { value: '', label: 'All sample types' },
  { value: 'tissue', label: 'Tissue (FFPE)' },
  { value: 'blood', label: 'Blood / Liquid biopsy' },
];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [sampleFilter, setSampleFilter] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadProviders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (testFilter) params.set('testType', testFilter);

      const res = await fetch(`/api/sequencing/providers?${params}`);
      if (!res.ok) throw new Error('Failed to load providers');
      const data = await res.json();
      setProviders(data.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, testFilter]);

  useEffect(() => {
    setLoading(true);
    loadProviders();
  }, [loadProviders]);

  const toggleCompare = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  // Client-side sample type filter
  const filtered = sampleFilter
    ? providers.filter(p => {
        const details = p.details;
        if (sampleFilter === 'tissue') return details.sampleTypes.some(s => s.toLowerCase().includes('tissue') || s.toLowerCase().includes('ffpe'));
        if (sampleFilter === 'blood') return details.sampleTypes.some(s => s.toLowerCase().includes('blood') || s.toLowerCase().includes('liquid'));
        return true;
      })
    : providers;

  const selectedProviders = filtered.filter(p => selectedIds.has(p.id));

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold">Sequencing Providers</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold">Sequencing Providers</h1>
        <p className="mt-4 text-sm text-red-600">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); loadProviders(); }}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sequencing Providers</h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} provider{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <button
          onClick={() => { setCompareMode(!compareMode); setSelectedIds(new Set()); }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${compareMode ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          {compareMode ? 'Exit compare' : 'Compare'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          {TYPE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={testFilter}
          onChange={e => setTestFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          {TEST_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={sampleFilter}
          onChange={e => setSampleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          {SAMPLE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Comparison table */}
      {compareMode && selectedProviders.length >= 2 && (
        <div className="mb-8 overflow-x-auto rounded-lg border border-blue-200 bg-blue-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="p-3 text-left text-gray-500 font-medium">Feature</th>
                {selectedProviders.map(p => (
                  <th key={p.id} className="p-3 text-left font-semibold text-gray-900">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              <tr>
                <td className="p-3 text-gray-500">Gene count</td>
                {selectedProviders.map(p => <td key={p.id} className="p-3 font-medium">{p.details.geneCount}</td>)}
              </tr>
              <tr>
                <td className="p-3 text-gray-500">Test names</td>
                {selectedProviders.map(p => <td key={p.id} className="p-3">{p.details.testNames.join(', ')}</td>)}
              </tr>
              <tr>
                <td className="p-3 text-gray-500">Sample types</td>
                {selectedProviders.map(p => <td key={p.id} className="p-3">{p.details.sampleTypes.join(', ')}</td>)}
              </tr>
              <tr>
                <td className="p-3 text-gray-500">Turnaround</td>
                {selectedProviders.map(p => <td key={p.id} className="p-3">{p.details.turnaroundDays.min}-{p.details.turnaroundDays.max} days</td>)}
              </tr>
              <tr>
                <td className="p-3 text-gray-500">Cost range</td>
                {selectedProviders.map(p => (
                  <td key={p.id} className="p-3">
                    {p.details.costRange.min === 0 && p.details.costRange.max === 0
                      ? 'Included'
                      : `$${p.details.costRange.min.toLocaleString()}-$${p.details.costRange.max.toLocaleString()}`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-gray-500">FDA approved</td>
                {selectedProviders.map(p => <td key={p.id} className="p-3">{p.details.fdaApproved ? 'Yes' : 'No'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Provider cards */}
      <div className="space-y-3">
        {filtered.map(provider => (
          <SequencingProviderCard
            key={provider.id}
            providerId={provider.id}
            name={provider.name}
            type={provider.type}
            details={provider.details}
            compareMode={compareMode}
            isSelected={selectedIds.has(provider.id)}
            onToggleCompare={toggleCompare}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">No providers match your filters.</p>
          <button
            onClick={() => { setTypeFilter(''); setTestFilter(''); setSampleFilter(''); }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
