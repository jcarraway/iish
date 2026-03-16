"""Tests for quality gates module."""

import pytest

from src.peptide_generator import PeptideGenerationResult, PeptideWindow
from src.quality import check_quality_gates, QualityGateError


def _make_window(mhc_class: str = "I") -> PeptideWindow:
    return PeptideWindow(
        gene="KRAS",
        mutation="KRAS G12D",
        chromosome="chr12",
        position=25245350,
        variant_type="missense_variant",
        vaf=0.375,
        mutant_peptide="VVVDAVGVG",
        wildtype_peptide="VVVGAVGVG",
        peptide_length=9,
        mutation_position_in_peptide=3,
        mhc_class=mhc_class,
        transcript_id="ENST00000256078",
    )


class TestQualityGates:
    def test_valid_result_passes(self):
        result = PeptideGenerationResult(
            peptide_windows=[_make_window("I"), _make_window("II")],
            total_variants=1,
            variants_with_peptides=1,
            mhc_i_peptides=1,
            mhc_ii_peptides=1,
        )
        # Should not raise
        check_quality_gates(result)

    def test_zero_peptides_fails(self):
        result = PeptideGenerationResult(
            peptide_windows=[],
            total_variants=5,
            variants_with_peptides=0,
            mhc_i_peptides=0,
            mhc_ii_peptides=0,
        )
        with pytest.raises(QualityGateError, match="Zero peptide windows"):
            check_quality_gates(result)

    def test_zero_mhc_i_fails(self):
        result = PeptideGenerationResult(
            peptide_windows=[_make_window("II")],
            total_variants=1,
            variants_with_peptides=1,
            mhc_i_peptides=0,
            mhc_ii_peptides=1,
        )
        with pytest.raises(QualityGateError, match="Zero MHC-I"):
            check_quality_gates(result)

    def test_high_count_warns(self, caplog):
        windows = [_make_window("I") for _ in range(60_000)]
        result = PeptideGenerationResult(
            peptide_windows=windows,
            total_variants=100,
            variants_with_peptides=100,
            mhc_i_peptides=60_000,
            mhc_ii_peptides=0,
        )
        # Should pass but log a warning
        import logging
        with caplog.at_level(logging.WARNING):
            check_quality_gates(result)
        assert "High peptide count" in caplog.text
