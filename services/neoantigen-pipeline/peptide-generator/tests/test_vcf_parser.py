"""Tests for VCF parser module."""

import tempfile
from pathlib import Path

from src.vcf_parser import parse_vcf, _parse_csq_header, _extract_vaf, _parse_amino_acids

# Minimal VEP-annotated VCF for testing
SAMPLE_VCF = """\
##fileformat=VCFv4.2
##INFO=<ID=CSQ,Number=.,Type=String,Description="Consequence annotations from Ensembl VEP. Format: Allele|Consequence|IMPACT|SYMBOL|Gene|Feature_type|Feature|BIOTYPE|CANONICAL|Amino_acids|Protein_position|HGVSp">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tTUMOR\tNORMAL
chr12\t25245350\t.\tC\tA\t100\tPASS\tCSQ=A|missense_variant|MODERATE|KRAS|3845|Transcript|ENST00000256078|protein_coding|YES|G/D|12|p.Gly12Asp\tGT:AD:AF\t0/1:50,30:0.375\t0/0:80,0:0.0
chr17\t7675088\t.\tG\tA\t200\tPASS\tCSQ=A|missense_variant|MODERATE|TP53|7157|Transcript|ENST00000269305|protein_coding|YES|R/H|175|p.Arg175His\tGT:AD:AF\t0/1:40,20:0.333\t0/0:60,0:0.0
"""

LOW_VAF_VCF = """\
##fileformat=VCFv4.2
##INFO=<ID=CSQ,Number=.,Type=String,Description="Consequence annotations from Ensembl VEP. Format: Allele|Consequence|IMPACT|SYMBOL|Gene|Feature_type|Feature|BIOTYPE|CANONICAL|Amino_acids|Protein_position|HGVSp">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tTUMOR
chr12\t25245350\t.\tC\tA\t100\tPASS\tCSQ=A|missense_variant|MODERATE|KRAS|3845|Transcript|ENST00000256078|protein_coding|YES|G/D|12|p.Gly12Asp\tGT:AF\t0/1:0.02
"""

PSEUDOGENE_VCF = """\
##fileformat=VCFv4.2
##INFO=<ID=CSQ,Number=.,Type=String,Description="Consequence annotations from Ensembl VEP. Format: Allele|Consequence|IMPACT|SYMBOL|Gene|Feature_type|Feature|BIOTYPE|CANONICAL|Amino_acids|Protein_position|HGVSp">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tTUMOR
chr1\t100\t.\tC\tA\t100\tPASS\tCSQ=A|missense_variant|MODERATE|FAKEGENE|999|Transcript|ENST999|processed_pseudogene|YES|G/D|12|p.Gly12Asp\tGT:AF\t0/1:0.30
"""

FRAMESHIFT_VCF = """\
##fileformat=VCFv4.2
##INFO=<ID=CSQ,Number=.,Type=String,Description="Consequence annotations from Ensembl VEP. Format: Allele|Consequence|IMPACT|SYMBOL|Gene|Feature_type|Feature|BIOTYPE|CANONICAL|Amino_acids|Protein_position|HGVSp">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tTUMOR
chr5\t112175770\t.\tTG\tT\t150\tPASS\tCSQ=-|frameshift_variant|HIGH|APC|324|Transcript|ENST00000257430|protein_coding|YES|G/-|1309|p.Gly1309fs\tGT:AF\t0/1:0.45
"""


def _write_vcf(content: str) -> Path:
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".vcf", delete=False)
    f.write(content)
    f.close()
    return Path(f.name)


class TestVcfParser:
    def test_parse_standard_missense(self):
        vcf_path = _write_vcf(SAMPLE_VCF)
        variants = parse_vcf(vcf_path)

        assert len(variants) == 2

        kras = variants[0]
        assert kras.gene == "KRAS"
        assert kras.protein_position == 12
        assert kras.wildtype_aa == "G"
        assert kras.mutant_aa == "D"
        assert kras.consequence == "missense_variant"
        assert kras.vaf == 0.375

        tp53 = variants[1]
        assert tp53.gene == "TP53"
        assert tp53.protein_position == 175
        assert tp53.wildtype_aa == "R"
        assert tp53.mutant_aa == "H"

    def test_low_vaf_filtered(self):
        vcf_path = _write_vcf(LOW_VAF_VCF)
        variants = parse_vcf(vcf_path)
        assert len(variants) == 0  # VAF 0.02 < 0.05 threshold

    def test_pseudogene_filtered(self):
        vcf_path = _write_vcf(PSEUDOGENE_VCF)
        variants = parse_vcf(vcf_path)
        assert len(variants) == 0

    def test_frameshift_parsed(self):
        vcf_path = _write_vcf(FRAMESHIFT_VCF)
        variants = parse_vcf(vcf_path)
        assert len(variants) == 1
        assert variants[0].consequence == "frameshift_variant"
        assert variants[0].gene == "APC"
        assert variants[0].protein_position == 1309


class TestCsqHeader:
    def test_parse_csq_header(self):
        header = '##INFO=<ID=CSQ,Number=.,Type=String,Description="Consequence annotations from Ensembl VEP. Format: Allele|Consequence|IMPACT|SYMBOL">'
        fields = _parse_csq_header(header)
        assert fields == ["Allele", "Consequence", "IMPACT", "SYMBOL"]


class TestExtractVaf:
    def test_from_af_field(self):
        fields = ["chr1", "100", ".", "A", "T", "100", "PASS", ".", "GT:AF", "0/1:0.42"]
        assert abs(_extract_vaf(fields) - 0.42) < 1e-6

    def test_from_ad_field(self):
        fields = ["chr1", "100", ".", "A", "T", "100", "PASS", ".", "GT:AD", "0/1:60,40"]
        assert abs(_extract_vaf(fields) - 0.4) < 1e-6

    def test_no_sample_returns_zero(self):
        fields = ["chr1", "100", ".", "A", "T", "100", "PASS", "."]
        assert _extract_vaf(fields) == 0.0


class TestParseAminoAcids:
    def test_missense(self):
        wt, mut = _parse_amino_acids("G/D", "missense_variant")
        assert wt == "G"
        assert mut == "D"

    def test_frameshift(self):
        wt, mut = _parse_amino_acids("G/-", "frameshift_variant")
        assert wt == "G"
        assert mut == "*"

    def test_empty(self):
        wt, mut = _parse_amino_acids("", "missense_variant")
        assert wt == "X"
        assert mut == "X"
