"""Tests for quality gates: pass/fail/warn."""

import pytest
from src.quality import check_quality_gates, QualityGateError
from src.scoring import NeoantigenScore


def _make_candidate(binding_class: str = "strong_binder") -> NeoantigenScore:
    return NeoantigenScore(
        gene="TP53",
        mutation="R175H",
        chromosome="17",
        position=7578406,
        variant_type="SNV",
        vaf=0.4,
        wildtype_peptide="HMTEVVRHC",
        mutant_peptide="HMTEVVHHC",
        peptide_length=9,
        hla_allele="HLA-A*02:01",
        binding_affinity_nm=30.0,
        binding_rank_percentile=0.3,
        wildtype_binding_nm=500.0,
        binding_class=binding_class,
        agretopicity=0.5,
        immunogenicity_score=0.6,
        expression_level=0.7,
        clonality=0.8,
        structural_exposure=None,
        composite_score=0.65,
        rank=1,
        confidence="high",
    )


class TestQualityGates:
    def test_fail_zero_predictions(self):
        """Zero predictions should raise QualityGateError."""
        with pytest.raises(QualityGateError, match="Zero neoantigen predictions"):
            check_quality_gates([])

    def test_warn_zero_binders(self):
        """All non-binders should return 'warn'."""
        candidates = [_make_candidate("non_binder"), _make_candidate("non_binder")]
        assert check_quality_gates(candidates) == "warn"

    def test_pass_with_binders(self):
        """At least one binder should return 'pass'."""
        candidates = [_make_candidate("strong_binder"), _make_candidate("non_binder")]
        assert check_quality_gates(candidates) == "pass"
