"""Tests for the ranking service."""

import pytest
from src.scoring import (
    NeoantigenScore,
    score_and_rank,
    normalize_binding,
    compute_composite,
    classify_confidence,
    DEFAULT_STRUCTURAL_EXPOSURE,
)


def _make_candidate(
    gene="TP53",
    mutation="R175H",
    binding_nm=25.0,
    immunogenicity=0.7,
    clonality=0.9,
    structural_exposure=None,
    expression=0.6,
    binding_class="strong_binder",
    wildtype_binding_nm=500.0,
) -> NeoantigenScore:
    return NeoantigenScore(
        gene=gene,
        mutation=mutation,
        chromosome="17",
        position=7577120,
        variant_type="SNV",
        vaf=0.35,
        wildtype_peptide="RMPEAAPPV",
        mutant_peptide="HMTEVVRRC",
        peptide_length=9,
        hla_allele="HLA-A*02:01",
        binding_affinity_nm=binding_nm,
        binding_rank_percentile=0.3,
        wildtype_binding_nm=wildtype_binding_nm,
        binding_class=binding_class,
        agretopicity=0.0,
        immunogenicity_score=immunogenicity,
        expression_level=expression,
        clonality=clonality,
        structural_exposure=structural_exposure,
    )


class TestReRanking:
    def test_structural_exposure_changes_score(self):
        """Patching structural_exposure should change composite score."""
        c1 = _make_candidate(structural_exposure=None)
        c2 = _make_candidate(structural_exposure=0.9)

        ranked1 = score_and_rank([c1])
        ranked2 = score_and_rank([c2])

        # With real exposure of 0.9 vs default 0.5, score should differ
        assert ranked1[0].composite_score != ranked2[0].composite_score

    def test_higher_exposure_increases_score(self):
        """Higher structural exposure should increase composite score."""
        c_low = _make_candidate(structural_exposure=0.1)
        c_high = _make_candidate(structural_exposure=0.9)

        score_and_rank([c_low])
        score_and_rank([c_high])

        assert c_high.composite_score > c_low.composite_score

    def test_default_exposure_used_when_none(self):
        """When structural_exposure is None, DEFAULT_STRUCTURAL_EXPOSURE (0.5) is used."""
        c_none = _make_candidate(structural_exposure=None)
        c_default = _make_candidate(structural_exposure=DEFAULT_STRUCTURAL_EXPOSURE)

        score_and_rank([c_none])
        score_and_rank([c_default])

        assert abs(c_none.composite_score - c_default.composite_score) < 1e-10


class TestRankingOrder:
    def test_ranking_order_with_mixed_exposure(self):
        """Candidates with real exposure data should rank appropriately."""
        candidates = [
            _make_candidate(gene="A", binding_nm=10, structural_exposure=0.9),
            _make_candidate(gene="B", binding_nm=10, structural_exposure=0.1),
            _make_candidate(gene="C", binding_nm=10, structural_exposure=None),
        ]

        ranked = score_and_rank(candidates)

        assert ranked[0].gene == "A"  # Highest exposure
        assert ranked[1].gene == "C"  # Default 0.5
        assert ranked[2].gene == "B"  # Lowest exposure

    def test_ranks_are_sequential(self):
        candidates = [
            _make_candidate(gene="X", binding_nm=10),
            _make_candidate(gene="Y", binding_nm=100),
            _make_candidate(gene="Z", binding_nm=1000),
        ]

        ranked = score_and_rank(candidates)

        assert [c.rank for c in ranked] == [1, 2, 3]


class TestOutputFormat:
    def test_all_candidates_get_scored(self):
        candidates = [_make_candidate(gene=f"G{i}") for i in range(5)]
        ranked = score_and_rank(candidates)

        for c in ranked:
            assert c.composite_score > 0
            assert c.rank > 0
            assert c.confidence in ("high", "medium", "low")
