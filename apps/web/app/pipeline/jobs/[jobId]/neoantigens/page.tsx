'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NeoantigenTable from '@/components/NeoantigenTable';

interface Neoantigen {
  id: string;
  gene: string;
  mutation: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  variantType: string;
  vaf: number;
  wildtypePeptide: string;
  mutantPeptide: string;
  peptideLength: number;
  hlaAllele: string;
  bindingAffinityNm: number;
  bindingRankPercentile: number;
  wildtypeBindingNm: number | null;
  bindingClass: string;
  immunogenicityScore: number;
  agretopicity: number;
  expressionLevel: number | null;
  clonality: number;
  structurePdbPath: string | null;
  structuralExposure: number | null;
  compositeScore: number;
  rank: number;
  confidence: string;
  details: Record<string, unknown>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NeoantigenExplorerPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [neoantigens, setNeoantigens] = useState<Neoantigen[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [confidence, setConfidence] = useState('');
  const [gene, setGene] = useState('');
  const [geneInput, setGeneInput] = useState('');

  const fetchNeoantigens = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: sortField,
        order: sortOrder,
        page: String(page),
        limit: '50',
      });
      if (confidence) params.set('confidence', confidence);
      if (gene) params.set('gene', gene);

      const res = await fetch(`/api/pipeline/jobs/${jobId}/neoantigens?${params}`);
      if (!res.ok) {
        if (res.status === 401) router.push('/');
        return;
      }
      const data = await res.json();
      setNeoantigens(data.neoantigens);
      setPagination(data.pagination);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [jobId, sortField, sortOrder, confidence, gene, router]);

  useEffect(() => {
    fetchNeoantigens(1);
  }, [fetchNeoantigens]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleGeneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setGene(geneInput);
  };

  const handleExportCsv = () => {
    window.open(`/api/pipeline/jobs/${jobId}/neoantigens?sort=${sortField}&order=${sortOrder}&limit=10000${confidence ? `&confidence=${confidence}` : ''}${gene ? `&gene=${gene}` : ''}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/pipeline/jobs/${jobId}`} className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
          &larr; Back to Job
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Neoantigen Explorer</h1>
            <p className="text-sm text-gray-500">{pagination.total} total candidates</p>
          </div>
          <button
            onClick={handleExportCsv}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={confidence}
          onChange={(e) => setConfidence(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        >
          <option value="">All Confidence</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <form onSubmit={handleGeneSearch} className="flex gap-2">
          <input
            type="text"
            value={geneInput}
            onChange={(e) => setGeneInput(e.target.value)}
            placeholder="Search gene..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none w-40"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            Search
          </button>
          {gene && (
            <button
              type="button"
              onClick={() => { setGene(''); setGeneInput(''); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </form>

        <select
          value={`${sortField}:${sortOrder}`}
          onChange={(e) => {
            const [f, o] = e.target.value.split(':');
            setSortField(f);
            setSortOrder(o as 'asc' | 'desc');
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
        >
          <option value="rank:asc">Rank (ascending)</option>
          <option value="compositeScore:desc">Score (highest)</option>
          <option value="bindingAffinityNm:asc">Binding Affinity (strongest)</option>
          <option value="immunogenicityScore:desc">Immunogenicity (highest)</option>
          <option value="vaf:desc">VAF (highest)</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 p-4">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-8 rounded bg-gray-100" />
            ))}
          </div>
        ) : neoantigens.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No neoantigens found matching filters.</p>
        ) : (
          <NeoantigenTable
            neoantigens={neoantigens}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchNeoantigens(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchNeoantigens(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
