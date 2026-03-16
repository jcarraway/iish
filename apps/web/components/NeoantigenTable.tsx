'use client';

import { useState } from 'react';

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

interface NeoantigenTableProps {
  neoantigens: Neoantigen[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

const BINDING_CLASS_COLORS: Record<string, string> = {
  strong_binder: 'bg-green-100 text-green-800',
  weak_binder: 'bg-yellow-100 text-yellow-800',
  non_binder: 'bg-red-100 text-red-800',
};

const SORTABLE_COLUMNS = [
  { key: 'rank', label: '#', width: 'w-10' },
  { key: 'gene', label: 'Gene', width: 'w-16' },
  { key: 'mutation', label: 'Mutation', width: 'w-24' },
  { key: 'mutantPeptide', label: 'Peptide', width: 'w-28' },
  { key: 'hlaAllele', label: 'HLA', width: 'w-24' },
  { key: 'bindingAffinityNm', label: 'Affinity (nM)', width: 'w-20' },
  { key: 'bindingClass', label: 'Class', width: 'w-20' },
  { key: 'immunogenicityScore', label: 'Immuno', width: 'w-16' },
  { key: 'compositeScore', label: 'Score', width: 'w-16' },
  { key: 'confidence', label: 'Conf', width: 'w-16' },
];

export default function NeoantigenTable({ neoantigens, sortField, sortOrder, onSort }: NeoantigenTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b">
            {SORTABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`pb-2 pr-2 cursor-pointer hover:text-purple-600 select-none ${col.width}`}
                onClick={() => onSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {sortField === col.key && (
                    <span className="text-purple-600">{sortOrder === 'asc' ? '\u2191' : '\u2193'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {neoantigens.map((neo) => (
            <>
              <tr
                key={neo.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === neo.id ? null : neo.id)}
              >
                <td className="py-2 pr-2 text-gray-400">{neo.rank}</td>
                <td className="py-2 pr-2 font-medium">{neo.gene}</td>
                <td className="py-2 pr-2 text-gray-600 text-xs">{neo.mutation}</td>
                <td className="py-2 pr-2 font-mono text-xs">{neo.mutantPeptide}</td>
                <td className="py-2 pr-2 text-gray-600 text-xs">{neo.hlaAllele}</td>
                <td className="py-2 pr-2">{neo.bindingAffinityNm.toFixed(1)}</td>
                <td className="py-2 pr-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BINDING_CLASS_COLORS[neo.bindingClass] ?? 'bg-gray-100 text-gray-800'}`}>
                    {neo.bindingClass.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-2 pr-2">{neo.immunogenicityScore.toFixed(2)}</td>
                <td className="py-2 pr-2 font-medium">{neo.compositeScore.toFixed(2)}</td>
                <td className="py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_COLORS[neo.confidence] ?? 'bg-gray-100 text-gray-800'}`}>
                    {neo.confidence}
                  </span>
                </td>
              </tr>
              {expandedId === neo.id && (
                <tr key={`${neo.id}-detail`} className="bg-gray-50">
                  <td colSpan={10} className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400 mb-1">Variant</p>
                        <p className="font-mono">{neo.chromosome}:{neo.position} {neo.refAllele}{'>'}{neo.altAllele}</p>
                        <p className="text-gray-500">{neo.variantType} | VAF: {(neo.vaf * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Wildtype Peptide</p>
                        <p className="font-mono">{neo.wildtypePeptide}</p>
                        <p className="text-gray-500">WT Binding: {neo.wildtypeBindingNm?.toFixed(1) ?? 'N/A'} nM</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Binding Details</p>
                        <p>Rank %ile: {neo.bindingRankPercentile.toFixed(2)}%</p>
                        <p>Agretopicity: {neo.agretopicity.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Expression & Clonality</p>
                        <p>Expression: {neo.expressionLevel?.toFixed(1) ?? 'N/A'}</p>
                        <p>Clonality: {(neo.clonality * 100).toFixed(1)}%</p>
                      </div>
                      {neo.structuralExposure !== null && (
                        <div>
                          <p className="text-gray-400 mb-1">Structure</p>
                          <p>Surface exposure: {neo.structuralExposure.toFixed(2)}</p>
                          {neo.structurePdbPath && <p className="text-purple-600">PDB available</p>}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
