'use client';

import Link from 'next/link';

interface ManufacturingPartnerCardProps {
  id: string;
  name: string;
  slug: string;
  type: string;
  capabilities: string[];
  certifications: string[];
  costRangeMin: number | null;
  costRangeMax: number | null;
  turnaroundWeeksMin: number | null;
  turnaroundWeeksMax: number | null;
  country: string;
  regulatorySupport: string[];
  description: string | null;
  score?: number;
  reasons?: string[];
}

const TYPE_LABELS: Record<string, string> = {
  large_cdmo: 'Large CDMO',
  specialized_mrna: 'Specialized mRNA',
  academic_modular: 'Academic / Modular',
};

const TYPE_COLORS: Record<string, string> = {
  large_cdmo: 'bg-blue-100 text-blue-700',
  specialized_mrna: 'bg-purple-100 text-purple-700',
  academic_modular: 'bg-amber-100 text-amber-700',
};

const CAPABILITY_LABELS: Record<string, string> = {
  mRNA_synthesis: 'mRNA Synthesis',
  lnp_formulation: 'LNP Formulation',
  fill_finish: 'Fill & Finish',
  plasmid_dna: 'Plasmid DNA',
  quality_control: 'QC',
  analytics: 'Analytics',
  cold_chain: 'Cold Chain',
  lyophilization: 'Lyophilization',
  modified_nucleotides: 'Modified Nucleotides',
  capping: 'Capping',
  self_amplifying_rna: 'saRNA',
  lipid_synthesis: 'Lipid Synthesis',
  research_grade: 'Research Grade',
  technology_transfer: 'Tech Transfer',
  continuous_manufacturing: 'Continuous Mfg',
  miniaturized_production: 'Miniaturized',
  modular_manufacturing: 'Modular Mfg',
  gene_therapy: 'Gene Therapy',
};

function formatCost(min: number | null, max: number | null): string {
  if (!min && !max) return 'Contact for pricing';
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} — ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function formatTurnaround(min: number | null, max: number | null): string {
  if (!min && !max) return 'Contact for timeline';
  if (min && max) return `${min}–${max} weeks`;
  if (min) return `${min}+ weeks`;
  return `Up to ${max} weeks`;
}

export default function ManufacturingPartnerCard({
  id,
  name,
  type,
  capabilities,
  certifications,
  costRangeMin,
  costRangeMax,
  turnaroundWeeksMin,
  turnaroundWeeksMax,
  country,
  regulatorySupport,
  description,
  score,
}: ManufacturingPartnerCardProps) {
  const typeLabel = TYPE_LABELS[type] ?? type;
  const typeColor = TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700';

  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/manufacture/partners/${id}`} className="font-semibold text-gray-900 hover:text-blue-600">
              {name}
            </Link>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${typeColor}`}>
              {typeLabel}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{country}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-semibold text-gray-900">{formatCost(costRangeMin, costRangeMax)}</p>
          <p className="text-xs text-gray-500">{formatTurnaround(turnaroundWeeksMin, turnaroundWeeksMax)}</p>
        </div>
      </div>

      {description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
      )}

      {/* Capabilities */}
      <div className="mt-3 flex flex-wrap gap-1">
        {capabilities.slice(0, 5).map(cap => (
          <span key={cap} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
            {CAPABILITY_LABELS[cap] ?? cap}
          </span>
        ))}
        {capabilities.length > 5 && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
            +{capabilities.length - 5} more
          </span>
        )}
      </div>

      {/* Certifications & Regulatory */}
      <div className="mt-2 flex flex-wrap gap-1">
        {certifications.map(cert => (
          <span key={cert} className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
            {cert.replace(/_/g, ' ')}
          </span>
        ))}
        {regulatorySupport.includes('ind_filing') && (
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
            IND Support
          </span>
        )}
      </div>

      {score !== undefined && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-blue-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">{score}% match</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Link
          href={`/manufacture/partners/${id}`}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
