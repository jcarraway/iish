import React from 'react';
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import type { PatientReportData, ClinicianReportData, ManufacturerBlueprintData } from '@oncovax/shared';

const colors = {
  primary: '#7C3AED',
  primaryLight: '#EDE9FE',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  green: '#059669',
  greenLight: '#D1FAE5',
  red: '#DC2626',
  blue: '#2563EB',
};

// ---- Patient PDF ----

const patientStyles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 11, color: colors.text },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: colors.primary },
  headerSub: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 6 },
  body: { fontSize: 11, lineHeight: 1.6 },
  candidateRow: { flexDirection: 'row', marginBottom: 8, paddingLeft: 8 },
  candidateGene: { fontFamily: 'Helvetica-Bold', width: 80 },
  candidateText: { flex: 1 },
  listItem: { flexDirection: 'row', marginBottom: 4, paddingLeft: 8 },
  bullet: { width: 12 },
  questionBox: { backgroundColor: colors.primaryLight, padding: 8, borderRadius: 4, marginBottom: 6 },
  questionText: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  questionWhy: { fontSize: 10, color: colors.textLight, marginTop: 2 },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  footerText: { fontSize: 8, color: colors.textLight, textAlign: 'center' },
  pageNumber: { fontSize: 8, color: colors.textLight, textAlign: 'right', marginTop: 4 },
});

export async function renderPatientPdf(data: PatientReportData): Promise<Buffer> {
  const doc = React.createElement(Document, {},
    React.createElement(Page, { size: 'LETTER', style: patientStyles.page },
      // Header
      React.createElement(View, { style: patientStyles.header },
        React.createElement(Text, { style: patientStyles.headerTitle }, 'Your Neoantigen Analysis'),
        React.createElement(Text, { style: patientStyles.headerSub }, `OncoVax Patient Summary | Generated ${new Date(data.generatedAt).toLocaleDateString()}`),
      ),
      // Summary
      React.createElement(View, { style: patientStyles.section },
        React.createElement(Text, { style: patientStyles.sectionTitle }, 'Summary'),
        React.createElement(Text, { style: patientStyles.body }, data.summary),
      ),
      // What are neoantigens
      React.createElement(View, { style: patientStyles.section },
        React.createElement(Text, { style: patientStyles.sectionTitle }, 'What Are Neoantigens?'),
        React.createElement(Text, { style: patientStyles.body }, data.whatAreNeoantigens),
      ),
      // Top candidates
      React.createElement(View, { style: patientStyles.section },
        React.createElement(Text, { style: patientStyles.sectionTitle }, 'Your Top Vaccine Targets'),
        ...data.topCandidates.map((c, i) =>
          React.createElement(View, { key: i, style: patientStyles.candidateRow },
            React.createElement(Text, { style: patientStyles.candidateGene }, c.gene),
            React.createElement(Text, { style: patientStyles.candidateText }, c.explanation),
          )
        ),
      ),
      // Vaccine explanation
      React.createElement(View, { style: patientStyles.section },
        React.createElement(Text, { style: patientStyles.sectionTitle }, 'How Your Vaccine Would Work'),
        React.createElement(Text, { style: patientStyles.body }, data.vaccineExplanation),
      ),
      // Next steps
      React.createElement(View, { style: patientStyles.section },
        React.createElement(Text, { style: patientStyles.sectionTitle }, 'Next Steps'),
        ...data.nextSteps.map((s, i) =>
          React.createElement(View, { key: i, style: patientStyles.listItem },
            React.createElement(Text, { style: patientStyles.bullet }, `${i + 1}.`),
            React.createElement(Text, { style: patientStyles.body }, s),
          )
        ),
      ),
      // Questions
      React.createElement(View, { style: patientStyles.section },
        React.createElement(Text, { style: patientStyles.sectionTitle }, 'Questions for Your Oncologist'),
        ...data.questionsForOncologist.map((q, i) =>
          React.createElement(View, { key: i, style: patientStyles.questionBox },
            React.createElement(Text, { style: patientStyles.questionText }, q.question),
            React.createElement(Text, { style: patientStyles.questionWhy }, `Why it matters: ${q.whyItMatters}`),
          )
        ),
      ),
      // Footer
      React.createElement(View, { style: patientStyles.footer, fixed: true },
        React.createElement(Text, { style: patientStyles.footerText }, data.disclaimer),
        React.createElement(Text, { style: patientStyles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
      ),
    )
  );

  return Buffer.from(await renderToBuffer(doc));
}

// ---- Clinician PDF ----

const clinicianStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: colors.text },
  header: { marginBottom: 16, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.primary },
  headerSub: { fontSize: 9, color: colors.textLight, marginTop: 2 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.primary, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 2 },
  body: { fontSize: 9, lineHeight: 1.5 },
  bold: { fontFamily: 'Helvetica-Bold' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  infoItem: { width: '50%', marginBottom: 4 },
  infoLabel: { fontSize: 8, color: colors.textLight },
  infoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.primaryLight, padding: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.primary },
  tableRow: { flexDirection: 'row', padding: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableCell: { fontSize: 7 },
  mono: { fontFamily: 'Courier', fontSize: 7 },
  badge: { fontSize: 7, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
  footerText: { fontSize: 7, color: colors.textLight, textAlign: 'center' },
  pageNumber: { fontSize: 7, color: colors.textLight, textAlign: 'right', marginTop: 2 },
});

export async function renderClinicianPdf(data: ClinicianReportData): Promise<Buffer> {
  const candidates = data.neoantigenAnalysis.topCandidates.slice(0, 20);

  const doc = React.createElement(Document, {},
    React.createElement(Page, { size: 'LETTER', style: clinicianStyles.page },
      // Header
      React.createElement(View, { style: clinicianStyles.header },
        React.createElement(Text, { style: clinicianStyles.headerTitle }, 'Neoantigen Pipeline Clinical Report'),
        React.createElement(Text, { style: clinicianStyles.headerSub }, `OncoVax | Generated ${new Date(data.generatedAt).toLocaleDateString()}`),
      ),
      // Sample Info
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '1. Sample Information'),
        React.createElement(View, { style: clinicianStyles.infoGrid },
          ...[
            ['Cancer Type', data.sampleInfo.cancerType],
            ['Reference Genome', data.sampleInfo.referenceGenome],
            ['Input Format', data.sampleInfo.inputFormat.toUpperCase()],
            ['Completed', data.sampleInfo.completedAt ? new Date(data.sampleInfo.completedAt).toLocaleDateString() : 'N/A'],
          ].map(([label, value], i) =>
            React.createElement(View, { key: i, style: clinicianStyles.infoItem },
              React.createElement(Text, { style: clinicianStyles.infoLabel }, label),
              React.createElement(Text, { style: clinicianStyles.infoValue }, value),
            )
          ),
        ),
      ),
      // Genomic Landscape
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '2. Genomic Landscape'),
        React.createElement(View, { style: clinicianStyles.infoGrid },
          React.createElement(View, { style: clinicianStyles.infoItem },
            React.createElement(Text, { style: clinicianStyles.infoLabel }, 'Total Variants'),
            React.createElement(Text, { style: clinicianStyles.infoValue }, String(data.genomicLandscape.totalVariants)),
          ),
          React.createElement(View, { style: clinicianStyles.infoItem },
            React.createElement(Text, { style: clinicianStyles.infoLabel }, 'TMB (mut/Mb)'),
            React.createElement(Text, { style: clinicianStyles.infoValue }, data.genomicLandscape.tmb !== null ? String(data.genomicLandscape.tmb) : 'N/A'),
          ),
        ),
        React.createElement(Text, { style: clinicianStyles.body },
          `Significant genes: ${data.genomicLandscape.significantGenes.join(', ')}`
        ),
      ),
      // HLA Genotype
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '3. HLA Genotype'),
        ...Object.entries(data.hlaGenotype).map(([locus, alleles], i) =>
          React.createElement(Text, { key: i, style: clinicianStyles.body },
            `${locus}: ${(alleles as string[]).join(', ')}`
          )
        ),
      ),
      // Methodology
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '4. Neoantigen Analysis'),
        React.createElement(Text, { style: clinicianStyles.body }, data.neoantigenAnalysis.methodology),
        React.createElement(Text, { style: { ...clinicianStyles.body, marginTop: 4 } },
          `Total candidates identified: ${data.neoantigenAnalysis.totalCandidates}`
        ),
      ),
      // Footer
      React.createElement(View, { style: clinicianStyles.footer, fixed: true },
        React.createElement(Text, { style: clinicianStyles.footerText }, 'For research use only. Not a diagnostic report. OncoVax Neoantigen Pipeline.'),
        React.createElement(Text, { style: clinicianStyles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
      ),
    ),
    // Page 2: Candidates table
    React.createElement(Page, { size: 'LETTER', style: clinicianStyles.page },
      React.createElement(Text, { style: clinicianStyles.sectionTitle }, '4. Neoantigen Candidates (continued)'),
      // Table header
      React.createElement(View, { style: clinicianStyles.tableHeader },
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 20 } }, '#'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 45 } }, 'Gene'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 80 } }, 'Peptide'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 55 } }, 'HLA'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 50 } }, 'Aff (nM)'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 40 } }, 'Class'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 45 } }, 'Immuno'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 45 } }, 'Score'),
        React.createElement(Text, { style: { ...clinicianStyles.tableHeaderCell, width: 45 } }, 'Conf'),
      ),
      // Table rows
      ...candidates.map((c, i) =>
        React.createElement(View, { key: i, style: clinicianStyles.tableRow },
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 20 } }, String(c.rank)),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 45, fontFamily: 'Helvetica-Bold' } }, c.gene),
          React.createElement(Text, { style: { ...clinicianStyles.mono, width: 80 } }, c.mutantPeptide),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 55, fontSize: 6 } }, c.hlaAllele),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 50 } }, c.bindingAffinityNm.toFixed(1)),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 40 } }, c.bindingClass),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 45 } }, c.immunogenicityScore.toFixed(2)),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 45 } }, c.compositeScore.toFixed(2)),
          React.createElement(Text, { style: { ...clinicianStyles.tableCell, width: 45 } }, c.confidence),
        )
      ),
      // Vaccine design, implications, limitations, references
      React.createElement(View, { style: { ...clinicianStyles.section, marginTop: 12 } },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '5. Vaccine Design Summary'),
        React.createElement(Text, { style: clinicianStyles.body },
          `Epitopes: ${data.vaccineDesignSummary.epitopeCount} | Genes: ${data.vaccineDesignSummary.targetedGenes.join(', ')} | Delivery: ${data.vaccineDesignSummary.deliveryMethod ?? 'LNP-mRNA'}`
        ),
      ),
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '6. Clinical Implications'),
        React.createElement(Text, { style: clinicianStyles.body }, data.clinicalImplications),
      ),
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '7. Limitations'),
        React.createElement(Text, { style: clinicianStyles.body }, data.limitations),
      ),
      React.createElement(View, { style: clinicianStyles.section },
        React.createElement(Text, { style: clinicianStyles.sectionTitle }, '8. References'),
        ...data.references.map((r, i) =>
          React.createElement(Text, { key: i, style: { ...clinicianStyles.body, fontSize: 7 } }, `${i + 1}. ${r}`)
        ),
      ),
      // Footer
      React.createElement(View, { style: clinicianStyles.footer, fixed: true },
        React.createElement(Text, { style: clinicianStyles.footerText }, 'For research use only. Not a diagnostic report. OncoVax Neoantigen Pipeline.'),
        React.createElement(Text, { style: clinicianStyles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
      ),
    ),
  );

  return Buffer.from(await renderToBuffer(doc));
}

// ---- Manufacturer PDF ----

const mfgStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: colors.text },
  header: { marginBottom: 16, borderBottomWidth: 2, borderBottomColor: colors.blue, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.blue },
  headerSub: { fontSize: 9, color: colors.textLight, marginTop: 2 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: colors.blue, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 2 },
  body: { fontSize: 9, lineHeight: 1.5 },
  specRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 3 },
  specLabel: { width: 140, fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.textLight },
  specValue: { flex: 1, fontSize: 9 },
  mono: { fontFamily: 'Courier', fontSize: 7, lineHeight: 1.3 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#DBEAFE', padding: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: colors.blue },
  tableRow: { flexDirection: 'row', padding: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableCell: { fontSize: 7 },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
  footerText: { fontSize: 7, color: colors.textLight, textAlign: 'center' },
  pageNumber: { fontSize: 7, color: colors.textLight, textAlign: 'right', marginTop: 2 },
});

export async function renderManufacturerPdf(data: ManufacturerBlueprintData): Promise<Buffer> {
  const doc = React.createElement(Document, {},
    React.createElement(Page, { size: 'LETTER', style: mfgStyles.page },
      // Header
      React.createElement(View, { style: mfgStyles.header },
        React.createElement(Text, { style: mfgStyles.headerTitle }, 'Vaccine Manufacturing Blueprint'),
        React.createElement(Text, { style: mfgStyles.headerSub }, `OncoVax Technical Specification | Generated ${new Date(data.generatedAt).toLocaleDateString()}`),
      ),
      // mRNA Sequence Spec
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: mfgStyles.sectionTitle }, '1. mRNA Sequence Specification'),
        ...[
          ['Length (nt)', String(data.mRnaSequenceSpec.lengthNt)],
          ['GC Content', data.mRnaSequenceSpec.gcContent ? `${(data.mRnaSequenceSpec.gcContent * 100).toFixed(1)}%` : 'N/A'],
          ['Codon Optimization', data.mRnaSequenceSpec.codonOptimization ?? 'N/A'],
          ["5' UTR", data.mRnaSequenceSpec.fivePrimeUtr ?? 'N/A'],
          ["3' UTR", data.mRnaSequenceSpec.threePrimeUtr ?? 'N/A'],
          ['Poly-A Tail', data.mRnaSequenceSpec.polyATailLength ? `${data.mRnaSequenceSpec.polyATailLength} nt` : 'N/A'],
        ].map(([label, value], i) =>
          React.createElement(View, { key: i, style: mfgStyles.specRow },
            React.createElement(Text, { style: mfgStyles.specLabel }, label),
            React.createElement(Text, { style: mfgStyles.specValue }, value),
          )
        ),
      ),
      // Construct Design
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: mfgStyles.sectionTitle }, '2. Construct Design'),
        React.createElement(View, { style: mfgStyles.specRow },
          React.createElement(Text, { style: mfgStyles.specLabel }, 'Signal Peptide'),
          React.createElement(Text, { style: mfgStyles.specValue }, data.constructDesign.signalPeptide ?? 'N/A'),
        ),
        React.createElement(View, { style: mfgStyles.specRow },
          React.createElement(Text, { style: mfgStyles.specLabel }, 'Universal Helper'),
          React.createElement(Text, { style: mfgStyles.specValue }, data.constructDesign.universalHelper ?? 'N/A'),
        ),
        React.createElement(View, { style: mfgStyles.specRow },
          React.createElement(Text, { style: mfgStyles.specLabel }, 'Total Length (aa)'),
          React.createElement(Text, { style: mfgStyles.specValue }, data.constructDesign.totalLength ? String(data.constructDesign.totalLength) : 'N/A'),
        ),
      ),
      // Epitope table
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: { ...mfgStyles.body, fontFamily: 'Helvetica-Bold', marginBottom: 4 } }, 'Epitope Sequence'),
        React.createElement(View, { style: mfgStyles.tableHeader },
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 30 } }, '#'),
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 60 } }, 'Gene'),
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 120 } }, 'Peptide'),
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 80 } }, 'HLA'),
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 80 } }, 'Linker'),
        ),
        ...data.constructDesign.epitopes.slice(0, 25).map((e, i) =>
          React.createElement(View, { key: i, style: mfgStyles.tableRow },
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 30 } }, String(i + 1)),
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 60 } }, e.gene),
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 120, fontFamily: 'Courier', fontSize: 7 } }, e.peptide),
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 80, fontSize: 6 } }, e.hlaAllele),
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 80 } }, e.linker ?? '-'),
          )
        ),
      ),
      // Footer
      React.createElement(View, { style: mfgStyles.footer, fixed: true },
        React.createElement(Text, { style: mfgStyles.footerText }, 'Confidential - For authorized manufacturing use only. OncoVax Neoantigen Pipeline.'),
        React.createElement(Text, { style: mfgStyles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
      ),
    ),
    // Page 2: LNP, QC, Storage, Regulatory
    React.createElement(Page, { size: 'LETTER', style: mfgStyles.page },
      // LNP Formulation
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: mfgStyles.sectionTitle }, '3. LNP Formulation'),
        ...[
          ['Ionizable Lipid', data.lnpFormulation.ionizableLipid],
          ['Helper Lipid', data.lnpFormulation.helperLipid],
          ['Cholesterol', data.lnpFormulation.cholesterol],
          ['PEG-Lipid', data.lnpFormulation.pegLipid],
          ['N/P Ratio', data.lnpFormulation.nPRatio ? String(data.lnpFormulation.nPRatio) : null],
          ['Particle Size', data.lnpFormulation.particleSizeNm],
        ].map(([label, value], i) =>
          React.createElement(View, { key: i, style: mfgStyles.specRow },
            React.createElement(Text, { style: mfgStyles.specLabel }, label),
            React.createElement(Text, { style: mfgStyles.specValue }, value ?? 'N/A'),
          )
        ),
      ),
      // QC Criteria
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: mfgStyles.sectionTitle }, '4. Quality Control Criteria'),
        React.createElement(View, { style: mfgStyles.tableHeader },
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 120 } }, 'Test'),
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 150 } }, 'Specification'),
          React.createElement(Text, { style: { ...mfgStyles.tableHeaderCell, width: 150 } }, 'Method'),
        ),
        ...data.qcCriteria.map((qc, i) =>
          React.createElement(View, { key: i, style: mfgStyles.tableRow },
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 120, fontFamily: 'Helvetica-Bold' } }, qc.test),
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 150 } }, qc.specification),
            React.createElement(Text, { style: { ...mfgStyles.tableCell, width: 150 } }, qc.method),
          )
        ),
      ),
      // Storage
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: mfgStyles.sectionTitle }, '5. Storage & Stability'),
        ...data.storageAndStability.map((s, i) =>
          React.createElement(View, { key: i, style: mfgStyles.specRow },
            React.createElement(Text, { style: mfgStyles.specLabel }, s.condition),
            React.createElement(Text, { style: mfgStyles.specValue }, s.shelfLife),
          )
        ),
      ),
      // Regulatory
      React.createElement(View, { style: mfgStyles.section },
        React.createElement(Text, { style: mfgStyles.sectionTitle }, '6. Regulatory Notes'),
        React.createElement(Text, { style: mfgStyles.body }, data.regulatoryNotes),
      ),
      // Footer
      React.createElement(View, { style: mfgStyles.footer, fixed: true },
        React.createElement(Text, { style: mfgStyles.footerText }, 'Confidential - For authorized manufacturing use only. OncoVax Neoantigen Pipeline.'),
        React.createElement(Text, { style: mfgStyles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
      ),
    ),
  );

  return Buffer.from(await renderToBuffer(doc));
}
