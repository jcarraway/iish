'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReportCard from '@/components/ReportCard';
import type { PatientReportData, ClinicianReportData, ManufacturerBlueprintData } from '@oncovax/shared';

type PreviewData =
  | { type: 'patient'; data: PatientReportData }
  | { type: 'clinician'; data: ClinicianReportData }
  | { type: 'manufacturer'; data: ManufacturerBlueprintData }
  | null;

export default function ReportsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [preview, setPreview] = useState<PreviewData>(null);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href={`/pipeline/jobs/${jobId}`} className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
          &larr; Back to Job
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Generate and download audience-specific reports</p>
      </div>

      {/* Report cards grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <ReportCard
          type="patient"
          title="Patient Summary"
          description="Plain-language explanation of your neoantigen analysis, vaccine targets, and questions for your oncologist."
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          jobId={jobId}
          onPreview={(data) => setPreview({ type: 'patient', data: data as unknown as PatientReportData })}
        />
        <ReportCard
          type="clinician"
          title="Clinical Report"
          description="Formal clinical report with mutation landscape, binding data, vaccine design summary, and references."
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
            </svg>
          }
          jobId={jobId}
          onPreview={(data) => setPreview({ type: 'clinician', data: data as unknown as ClinicianReportData })}
        />
        <ReportCard
          type="manufacturer"
          title="Manufacturer Blueprint"
          description="Technical specification with mRNA sequence, construct design, LNP formulation, and QC criteria."
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          }
          jobId={jobId}
          onPreview={(data) => setPreview({ type: 'manufacturer', data: data as unknown as ManufacturerBlueprintData })}
        />
      </div>

      {/* Preview section */}
      {preview && (
        <div className="rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {preview.type === 'patient' && 'Patient Summary Preview'}
              {preview.type === 'clinician' && 'Clinical Report Preview'}
              {preview.type === 'manufacturer' && 'Manufacturer Blueprint Preview'}
            </h2>
            <button
              onClick={() => setPreview(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close Preview
            </button>
          </div>

          {preview.type === 'patient' && <PatientPreview data={preview.data} />}
          {preview.type === 'clinician' && <ClinicianPreview data={preview.data} />}
          {preview.type === 'manufacturer' && <ManufacturerPreview data={preview.data} />}
        </div>
      )}
    </div>
  );
}

function PatientPreview({ data }: { data: PatientReportData }) {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">Summary</h3>
        <p className="text-gray-700">{data.summary}</p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">What Are Neoantigens?</h3>
        <p className="text-gray-700">{data.whatAreNeoantigens}</p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">Your Top Vaccine Targets</h3>
        {data.topCandidates.map((c, i) => (
          <div key={i} className="mb-3 pl-4 border-l-2 border-purple-200">
            <p className="font-medium text-gray-900">{c.gene} — {c.mutation}</p>
            <p className="text-gray-600">{c.explanation}</p>
          </div>
        ))}
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">How Your Vaccine Would Work</h3>
        <p className="text-gray-700">{data.vaccineExplanation}</p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">Next Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          {data.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">Questions for Your Oncologist</h3>
        {data.questionsForOncologist.map((q, i) => (
          <div key={i} className="mb-2 rounded-lg bg-purple-50 p-3">
            <p className="font-medium text-gray-900">{q.question}</p>
            <p className="text-xs text-gray-500 mt-1">Why it matters: {q.whyItMatters}</p>
          </div>
        ))}
      </section>
      <p className="text-xs text-gray-400 italic">{data.disclaimer}</p>
    </div>
  );
}

function ClinicianPreview({ data }: { data: ClinicianReportData }) {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">1. Sample Information</h3>
        <dl className="grid grid-cols-2 gap-2">
          <dt className="text-gray-400">Cancer Type</dt><dd>{data.sampleInfo.cancerType}</dd>
          <dt className="text-gray-400">Reference</dt><dd>{data.sampleInfo.referenceGenome}</dd>
          <dt className="text-gray-400">Format</dt><dd className="uppercase">{data.sampleInfo.inputFormat}</dd>
          <dt className="text-gray-400">Completed</dt><dd>{data.sampleInfo.completedAt ? new Date(data.sampleInfo.completedAt).toLocaleDateString() : 'N/A'}</dd>
        </dl>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">2. Genomic Landscape</h3>
        <p className="text-gray-700">
          {data.genomicLandscape.totalVariants} variants | TMB: {data.genomicLandscape.tmb ?? 'N/A'} | Genes: {data.genomicLandscape.significantGenes.join(', ')}
        </p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">3. Neoantigen Analysis</h3>
        <p className="text-gray-600 mb-2">{data.neoantigenAnalysis.methodology}</p>
        <p className="text-gray-700">{data.neoantigenAnalysis.totalCandidates} total candidates. Top {data.neoantigenAnalysis.topCandidates.length} shown in PDF.</p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">4. Vaccine Design</h3>
        <p className="text-gray-700">
          {data.vaccineDesignSummary.epitopeCount} epitopes targeting {data.vaccineDesignSummary.targetedGenes.join(', ')}
        </p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">5. Clinical Implications</h3>
        <p className="text-gray-700">{data.clinicalImplications}</p>
      </section>
      <section>
        <h3 className="font-semibold text-purple-700 mb-2">6. Limitations</h3>
        <p className="text-gray-700">{data.limitations}</p>
      </section>
    </div>
  );
}

function ManufacturerPreview({ data }: { data: ManufacturerBlueprintData }) {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold text-blue-700 mb-2">1. mRNA Sequence Spec</h3>
        <dl className="grid grid-cols-2 gap-2">
          <dt className="text-gray-400">Length</dt><dd>{data.mRnaSequenceSpec.lengthNt} nt</dd>
          <dt className="text-gray-400">GC Content</dt><dd>{data.mRnaSequenceSpec.gcContent ? `${(data.mRnaSequenceSpec.gcContent * 100).toFixed(1)}%` : 'N/A'}</dd>
          <dt className="text-gray-400">Codon Optimization</dt><dd>{data.mRnaSequenceSpec.codonOptimization ?? 'N/A'}</dd>
        </dl>
      </section>
      <section>
        <h3 className="font-semibold text-blue-700 mb-2">2. Construct Design</h3>
        <p className="text-gray-700 mb-2">{data.constructDesign.epitopes.length} epitopes | Total: {data.constructDesign.totalLength ?? 'N/A'} aa</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-1 pr-2">#</th>
                <th className="pb-1 pr-2">Gene</th>
                <th className="pb-1 pr-2">Peptide</th>
                <th className="pb-1 pr-2">HLA</th>
                <th className="pb-1">Linker</th>
              </tr>
            </thead>
            <tbody>
              {data.constructDesign.epitopes.slice(0, 10).map((e, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1 pr-2 text-gray-400">{i + 1}</td>
                  <td className="py-1 pr-2 font-medium">{e.gene}</td>
                  <td className="py-1 pr-2 font-mono">{e.peptide}</td>
                  <td className="py-1 pr-2 text-gray-600">{e.hlaAllele}</td>
                  <td className="py-1">{e.linker ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="font-semibold text-blue-700 mb-2">3. QC Criteria</h3>
        {data.qcCriteria.slice(0, 5).map((qc, i) => (
          <div key={i} className="mb-1">
            <span className="font-medium">{qc.test}:</span> {qc.specification} <span className="text-gray-400">({qc.method})</span>
          </div>
        ))}
      </section>
      <section>
        <h3 className="font-semibold text-blue-700 mb-2">4. Regulatory Notes</h3>
        <p className="text-gray-700">{data.regulatoryNotes}</p>
      </section>
    </div>
  );
}
