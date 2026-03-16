"""Tests for the structure predictor service."""

import json
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

from src.mhc_templates import get_template_pdb_id, HLA_TEMPLATE_MAP
from src.accessibility import MAX_SASA_PER_AA
from src.output import StructureResult, build_structure_report


class TestTemplateLookup:
    def test_exact_match(self):
        result = get_template_pdb_id("HLA-A*02:01")
        assert result is not None
        pdb_id, chain = result
        assert pdb_id == "3MRE"
        assert chain == "A"

    def test_supertype_fallback(self):
        """Should fall back to same 2-digit group when exact match not found."""
        result = get_template_pdb_id("HLA-A*02:07")
        assert result is not None
        pdb_id, _ = result
        # Should match HLA-A*02:01 or HLA-A*02:06
        assert pdb_id in ("3MRE", "3MRG")

    def test_unknown_allele_returns_none(self):
        result = get_template_pdb_id("HLA-Z*99:99")
        assert result is None

    def test_all_templates_have_valid_format(self):
        for allele, (pdb_id, chain) in HLA_TEMPLATE_MAP.items():
            assert len(pdb_id) == 4, f"Invalid PDB ID for {allele}: {pdb_id}"
            assert len(chain) == 1, f"Invalid chain for {allele}: {chain}"
            assert allele.startswith("HLA-"), f"Invalid allele format: {allele}"


class TestSASAConstants:
    def test_all_standard_amino_acids_covered(self):
        standard_aas = set("ACDEFGHIKLMNPQRSTVWY")
        assert set(MAX_SASA_PER_AA.keys()) == standard_aas

    def test_sasa_values_positive(self):
        for aa, sasa in MAX_SASA_PER_AA.items():
            assert sasa > 0, f"SASA for {aa} should be positive"

    def test_glycine_smallest(self):
        assert MAX_SASA_PER_AA["G"] == min(MAX_SASA_PER_AA.values())

    def test_tryptophan_largest(self):
        assert MAX_SASA_PER_AA["W"] == max(MAX_SASA_PER_AA.values())


class TestStructureReport:
    def _make_neoantigen(self, gene="TP53", mutation="R175H", peptide="HMTEVVRRC",
                          hla="HLA-A*02:01", score=0.7):
        return {
            "gene": gene,
            "mutation": mutation,
            "mutantPeptide": peptide,
            "hlaAllele": hla,
            "compositeScore": score,
            "structuralExposure": None,
        }

    def test_build_report_with_results(self):
        neoantigens = [self._make_neoantigen()]
        results = [
            StructureResult(
                gene="TP53",
                mutation="R175H",
                mutant_peptide="HMTEVVRRC",
                hla_allele="HLA-A*02:01",
                structural_exposure=0.65,
                pdb_path="results/job1/structures/TP53_R175H.pdb",
                method="template",
            )
        ]

        report = build_structure_report("job1", results, neoantigens)

        assert report["jobId"] == "job1"
        assert report["totalStructures"] == 1
        assert report["successfulPredictions"] == 1
        assert report["failedPredictions"] == 0
        assert report["patchedNeoantigens"] == 1
        assert report["neoantigens"][0]["structuralExposure"] == 0.65

    def test_graceful_degradation(self):
        """When structure prediction fails, exposure stays None."""
        neoantigens = [self._make_neoantigen()]
        results = [
            StructureResult(
                gene="TP53",
                mutation="R175H",
                mutant_peptide="HMTEVVRRC",
                hla_allele="HLA-A*02:01",
                structural_exposure=None,
                pdb_path=None,
                method=None,
            )
        ]

        report = build_structure_report("job1", results, neoantigens)

        assert report["successfulPredictions"] == 0
        assert report["failedPredictions"] == 1
        assert report["patchedNeoantigens"] == 0
        assert report["neoantigens"][0]["structuralExposure"] is None

    def test_output_schema(self):
        """Verify the output report has all required fields."""
        neoantigens = [self._make_neoantigen()]
        results = [
            StructureResult(
                gene="TP53", mutation="R175H", mutant_peptide="HMTEVVRRC",
                hla_allele="HLA-A*02:01", structural_exposure=0.5,
                pdb_path="results/job1/structures/TP53_R175H.pdb", method="template",
            )
        ]

        report = build_structure_report("job1", results, neoantigens)

        # Top-level required fields
        assert "jobId" in report
        assert "totalStructures" in report
        assert "successfulPredictions" in report
        assert "failedPredictions" in report
        assert "structures" in report
        assert "neoantigens" in report

        # Structure entry fields
        s = report["structures"][0]
        assert "gene" in s
        assert "mutation" in s
        assert "mutantPeptide" in s
        assert "hlaAllele" in s
        assert "structuralExposure" in s
        assert "pdbPath" in s
        assert "method" in s

        # JSON serializable
        json.dumps(report)
