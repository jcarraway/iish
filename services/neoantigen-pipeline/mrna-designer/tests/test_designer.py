"""Tests for the mRNA vaccine designer service."""

import json
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from src.epitope_selector import select_epitopes, MIN_COMPOSITE_SCORE
from src.construct_designer import design_construct, SIGNAL_PEPTIDE, LINKER, PADRE_EPITOPE
from src.codon_optimizer import optimize_codons, CODON_TABLE, _gc_content, _find_homopolymer
from src.utr_designer import design_5utr, design_3utr, design_poly_a, POLY_A_LENGTH
from src.mrna_assembler import assemble_mrna
from src.sequence_checks import run_quality_checks, translate, STOP_CODONS
from src.formulation import generate_formulation_notes
from src.output import VaccineBlueprint, build_vaccine_blueprint


def _make_neoantigen(gene="TP53", mutation="R175H", peptide="HMTEVVRRC",
                      hla="HLA-A*02:01", score=0.7, clonality=0.9):
    return {
        "gene": gene,
        "mutation": mutation,
        "mutantPeptide": peptide,
        "hlaAllele": hla,
        "compositeScore": score,
        "clonality": clonality,
        "bindingClass": "strong_binder",
        "rank": 1,
    }


class TestEpitopeSelection:
    def test_selects_up_to_20(self):
        candidates = [_make_neoantigen(gene=f"G{i}", peptide=f"PEPTIDE{i:02d}A", score=0.5 + i * 0.01) for i in range(30)]
        selected = select_epitopes(candidates)
        assert len(selected) <= 20

    def test_filters_by_min_score(self):
        candidates = [
            _make_neoantigen(gene="A", score=0.8),
            _make_neoantigen(gene="B", score=0.1, peptide="LOWSCORE"),
        ]
        selected = select_epitopes(candidates, min_score=0.3)
        peptides = [s.get("mutantPeptide") for s in selected]
        assert "LOWSCORE" not in peptides

    def test_hla_diversity(self):
        candidates = [
            _make_neoantigen(gene="A", hla="HLA-A*02:01", peptide="PEPTIDEA1"),
            _make_neoantigen(gene="B", hla="HLA-A*02:01", peptide="PEPTIDEB1", score=0.69),
            _make_neoantigen(gene="C", hla="HLA-B*07:02", peptide="PEPTIDEC1", score=0.68),
        ]
        selected = select_epitopes(candidates, max_epitopes=2)
        hla_alleles = set(s.get("hlaAllele") for s in selected)
        assert len(hla_alleles) == 2

    def test_deduplicates_peptides(self):
        candidates = [
            _make_neoantigen(gene="A", peptide="SAME", score=0.8),
            _make_neoantigen(gene="B", peptide="SAME", score=0.6),
        ]
        selected = select_epitopes(candidates)
        assert len(selected) == 1


class TestConstructDesign:
    def test_basic_assembly(self):
        epitopes = [_make_neoantigen(peptide="AAAAAAAAA"), _make_neoantigen(peptide="CCCCCCCCC")]
        construct = design_construct(epitopes)

        assert construct["proteinSequence"].startswith(SIGNAL_PEPTIDE)
        assert construct["proteinSequence"].endswith(PADRE_EPITOPE)
        assert LINKER in construct["proteinSequence"]
        assert construct["totalEpitopes"] == 2

    def test_signal_peptide_present(self):
        epitopes = [_make_neoantigen()]
        construct = design_construct(epitopes)
        assert construct["signalPeptide"] == SIGNAL_PEPTIDE

    def test_padre_present(self):
        epitopes = [_make_neoantigen()]
        construct = design_construct(epitopes)
        assert construct["padreEpitope"] == PADRE_EPITOPE

    def test_empty_epitopes_raises(self):
        with pytest.raises(ValueError):
            design_construct([])


class TestCodonOptimization:
    def test_all_amino_acids_covered(self):
        standard_aas = set("ACDEFGHIKLMNPQRSTVWY*")
        assert set(CODON_TABLE.keys()) == standard_aas

    def test_gc_content_in_range(self):
        protein = "MFVFLVLLPLVSSQHMTEVVRRC"
        orf = optimize_codons(protein, seed=42)
        gc = _gc_content(orf)
        # Allow slightly wider range due to optimization tradeoffs
        assert 0.40 <= gc <= 0.70, f"GC content {gc:.2f} out of range"

    def test_correct_length(self):
        protein = "MFVFLVLLPLVSSQ"
        orf = optimize_codons(protein, seed=42)
        assert len(orf) == len(protein) * 3

    def test_no_long_homopolymers(self):
        protein = "AAAAAAAAAA"  # All alanines - could create GCC runs
        orf = optimize_codons(protein, seed=42)
        result = _find_homopolymer(orf, max_run=6)
        assert result is None, f"Found homopolymer at position {result}"

    def test_deterministic_with_seed(self):
        protein = "MFVFLVLLPLVSSQ"
        orf1 = optimize_codons(protein, seed=123)
        orf2 = optimize_codons(protein, seed=123)
        assert orf1 == orf2


class TestUTRDesign:
    def test_5utr_contains_kozak(self):
        utr = design_5utr()
        assert "GCCACC" in utr

    def test_3utr_doubled(self):
        utr = design_3utr()
        half = len(utr) // 2
        assert utr[:half] == utr[half:]

    def test_poly_a_length(self):
        poly_a = design_poly_a()
        assert len(poly_a) == POLY_A_LENGTH
        assert all(c == "A" for c in poly_a)


class TestMRNAAssembly:
    def test_full_assembly(self):
        orf = "ATGGCC" * 10  # Simple test ORF
        assembly = assemble_mrna(orf)

        assert "fullSequence" in assembly
        assert assembly["totalLength"] > 0
        assert "ATG" in assembly["fullSequence"]
        assert assembly["fullSequence"].endswith("A" * POLY_A_LENGTH)

    def test_components_present(self):
        orf = "GCC" * 5
        assembly = assemble_mrna(orf)

        assert "fivePrimeUtr" in assembly["components"]
        assert "orf" in assembly["components"]
        assert "threePrimeUtr" in assembly["components"]
        assert "polyA" in assembly["components"]


class TestSequenceChecks:
    def test_valid_sequence_passes(self):
        protein = "MFVFLVLLPLVSSQ"
        orf = optimize_codons(protein, seed=42)
        full_orf = orf + "TGA"  # ORF already starts with ATG for initial M
        assembly = assemble_mrna(orf)

        result = run_quality_checks(assembly["fullSequence"], full_orf, protein)
        # back_translation should pass
        bt_check = next(c for c in result["checks"] if c["name"] == "back_translation")
        assert bt_check["passed"], f"Back-translation failed: {bt_check}"

    def test_internal_stops_detected(self):
        # Create ORF with an internal stop (ATG for M, then TAA stop, then more codons)
        orf_with_stop = "ATGTAAGCC" + "GCC" * 10 + "TGA"
        result = run_quality_checks("dummy", orf_with_stop, "")
        stop_check = next(c for c in result["checks"] if c["name"] == "internal_stops")
        assert not stop_check["passed"]

    def test_translate_basic(self):
        assert translate("ATGGCC") == "MA"
        assert translate("ATGTGA") == "M*"


class TestFormulation:
    def test_includes_disclaimer(self):
        notes = generate_formulation_notes(1500)
        assert "disclaimer" in notes
        assert "RESEARCH REFERENCE ONLY" in notes["disclaimer"]

    def test_lnp_composition(self):
        notes = generate_formulation_notes(1500)
        assert "lnpComposition" in notes
        comp = notes["lnpComposition"]
        assert "ionizableLipid" in comp
        assert "cholesterol" in comp


class TestBlueprintOutput:
    def test_blueprint_schema(self):
        blueprint = build_vaccine_blueprint(
            job_id="test-job-1",
            epitopes=[_make_neoantigen()],
            construct={"proteinSequence": "MFVFL", "proteinLength": 5, "totalEpitopes": 1},
            mrna_assembly={"fullSequence": "ATGGCC", "totalLength": 6, "components": {}},
            quality_checks={"passed": True, "checks": []},
            formulation_notes={"disclaimer": "test"},
            rationale="Test rationale",
        )

        d = blueprint.to_dict()

        # Required fields
        assert "jobId" in d
        assert "createdAt" in d
        assert "version" in d
        assert "selectedEpitopes" in d
        assert "totalEpitopes" in d
        assert "construct" in d
        assert "mrnaSequence" in d
        assert "mrnaLength" in d
        assert "qualityChecks" in d
        assert "formulationNotes" in d
        assert "designRationale" in d

        # JSON serializable
        json.dumps(d)

    def test_blueprint_version(self):
        blueprint = build_vaccine_blueprint(
            job_id="test",
            epitopes=[],
            construct={},
            mrna_assembly={"fullSequence": "", "totalLength": 0, "components": {}},
            quality_checks={"passed": True, "checks": []},
            formulation_notes={},
            rationale=None,
        )
        assert blueprint.version == "1.0.0"
