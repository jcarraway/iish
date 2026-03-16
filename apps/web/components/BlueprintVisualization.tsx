'use client';

interface VaccineBlueprint {
  epitopeCount?: number;
  targetedGenes?: string[];
  constructLength?: number;
  deliveryMethod?: string;
  mRnaSequence?: string;
  signalPeptide?: string;
  universalHelper?: string;
  fivePrimeUtr?: string;
  threePrimeUtr?: string;
  polyATailLength?: number;
  epitopes?: {
    gene: string;
    peptide: string;
    hlaAllele: string;
    linker?: string;
  }[];
  hlaGenotype?: Record<string, string[]>;
  lnpFormulation?: {
    ionizableLipid?: string;
    particleSizeNm?: string;
  };
  [key: string]: unknown;
}

interface BlueprintVisualizationProps {
  blueprint: VaccineBlueprint;
  hlaGenotype: Record<string, string[]> | null;
}

const SEGMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  utr5: { bg: 'bg-blue-200', text: 'text-blue-800', label: "5' UTR" },
  signal: { bg: 'bg-orange-200', text: 'text-orange-800', label: 'Signal Peptide' },
  epitope: { bg: 'bg-purple-200', text: 'text-purple-800', label: 'Epitope' },
  linker: { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Linker' },
  helper: { bg: 'bg-green-200', text: 'text-green-800', label: 'PADRE' },
  utr3: { bg: 'bg-blue-200', text: 'text-blue-800', label: "3' UTR" },
  polyA: { bg: 'bg-yellow-200', text: 'text-yellow-800', label: 'Poly-A' },
};

export default function BlueprintVisualization({ blueprint, hlaGenotype }: BlueprintVisualizationProps) {
  const epitopes = blueprint.epitopes ?? [];
  const hla = hlaGenotype ?? blueprint.hlaGenotype ?? {};

  // Build construct segments for diagram
  const segments: { type: string; label: string; detail?: string }[] = [];
  if (blueprint.fivePrimeUtr) segments.push({ type: 'utr5', label: "5' UTR" });
  if (blueprint.signalPeptide) segments.push({ type: 'signal', label: 'Signal', detail: blueprint.signalPeptide });
  epitopes.forEach((ep, i) => {
    segments.push({ type: 'epitope', label: ep.gene, detail: ep.peptide });
    if (ep.linker && i < epitopes.length - 1) {
      segments.push({ type: 'linker', label: ep.linker });
    }
  });
  if (blueprint.universalHelper) segments.push({ type: 'helper', label: 'PADRE', detail: blueprint.universalHelper });
  if (blueprint.threePrimeUtr) segments.push({ type: 'utr3', label: "3' UTR" });
  if (blueprint.polyATailLength) segments.push({ type: 'polyA', label: `Poly-A (${blueprint.polyATailLength}nt)` });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{blueprint.epitopeCount ?? epitopes.length}</p>
          <p className="text-xs text-gray-500">Epitopes</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{(blueprint.targetedGenes ?? [...new Set(epitopes.map(e => e.gene))]).length}</p>
          <p className="text-xs text-gray-500">Targeted Genes</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{blueprint.constructLength ?? 'N/A'}</p>
          <p className="text-xs text-gray-500">Construct Length (aa)</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{blueprint.deliveryMethod ?? 'LNP-mRNA'}</p>
          <p className="text-xs text-gray-500">Delivery</p>
        </div>
      </div>

      {/* Polyepitope Construct Diagram */}
      {segments.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Polyepitope Construct</h3>
          <div className="flex flex-wrap items-center gap-1">
            {segments.map((seg, i) => {
              const colors = SEGMENT_COLORS[seg.type] ?? SEGMENT_COLORS.epitope;
              return (
                <div key={i} className="flex items-center">
                  <div
                    className={`${colors.bg} ${colors.text} rounded px-2 py-1 text-xs font-medium cursor-default`}
                    title={seg.detail ?? seg.label}
                  >
                    {seg.label}
                  </div>
                  {i < segments.length - 1 && seg.type !== 'linker' && segments[i + 1]?.type !== 'linker' && (
                    <span className="text-gray-300 mx-0.5">{'\u2192'}</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(SEGMENT_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded ${val.bg}`} />
                <span className="text-xs text-gray-500">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* mRNA Sequence Display */}
      {blueprint.mRnaSequence && (
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">mRNA Sequence</h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <p className="font-mono text-xs leading-relaxed break-all text-gray-700">
              {blueprint.fivePrimeUtr && (
                <span className="text-blue-600" title="5' UTR">{blueprint.mRnaSequence.slice(0, 50)}</span>
              )}
              <span className="text-purple-700">{blueprint.mRnaSequence.slice(50, -100)}</span>
              {blueprint.threePrimeUtr && (
                <span className="text-blue-600" title="3' UTR">{blueprint.mRnaSequence.slice(-100, -30)}</span>
              )}
              {blueprint.polyATailLength && (
                <span className="text-yellow-600" title="Poly-A tail">{blueprint.mRnaSequence.slice(-30)}</span>
              )}
              {!blueprint.fivePrimeUtr && !blueprint.threePrimeUtr && blueprint.mRnaSequence}
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-400">Length: {blueprint.mRnaSequence.length} nt</p>
        </div>
      )}

      {/* HLA Coverage Grid */}
      {Object.keys(hla).length > 0 && (
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">HLA Genotype</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(hla).map(([locus, alleles]) => (
              <div key={locus} className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-400 mb-1">{locus}</p>
                <div className="flex flex-wrap gap-1">
                  {(alleles as string[]).map((allele, i) => (
                    <span key={i} className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-mono text-purple-800">
                      {allele}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Specs */}
      {blueprint.lnpFormulation && (
        <div className="rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Delivery Specifications</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {blueprint.lnpFormulation.ionizableLipid && (
              <>
                <dt className="text-gray-400">Ionizable Lipid</dt>
                <dd className="text-gray-700">{blueprint.lnpFormulation.ionizableLipid}</dd>
              </>
            )}
            {blueprint.lnpFormulation.particleSizeNm && (
              <>
                <dt className="text-gray-400">Particle Size</dt>
                <dd className="text-gray-700">{blueprint.lnpFormulation.particleSizeNm}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
