"""Tests for scoring module: component scores, composite, and confidence classification."""

import pytest
from src.scoring import (
    normalize_binding,
    compute_agretopicity,
    compute_composite,
    classify_confidence,
    score_and_rank,
    NeoantigenScore,
)


class TestNormalizeBinding:
    def test_very_strong_binder(self):
        """1nM should score close to 1.0."""
        score = normalize_binding(1.0)
        assert score > 0.95

    def test_moderate_binder(self):
        """100nM should score around 0.57."""
        score = normalize_binding(100.0)
        assert 0.5 < score < 0.7

    def test_non_binder(self):
        """10000nM should score close to 0."""
        score = normalize_binding(10000.0)
        assert score < 0.2

    def test_zero_affinity(self):
        """Zero affinity edge case returns 1.0."""
        assert normalize_binding(0.0) == 1.0


class TestComputeAgretopicity:
    def test_high_agretopicity(self):
        """Mutant binds 10x better than wildtype -> high score."""
        score = compute_agretopicity(50.0, 500.0)
        assert score >= 0.9

    def test_no_difference(self):
        """Equal binding -> zero agretopicity."""
        score = compute_agretopicity(100.0, 100.0)
        assert score == 0.0

    def test_no_wildtype(self):
        """No wildtype data -> default 0.5."""
        score = compute_agretopicity(50.0, None)
        assert score == 0.5


class TestComputeComposite:
    def test_all_perfect(self):
        """All perfect scores -> composite near 1.0."""
        score = compute_composite(1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
        assert score == pytest.approx(1.0)

    def test_all_zero(self):
        """All zero scores -> composite is 0.0."""
        score = compute_composite(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        assert score == pytest.approx(0.0)

    def test_weights_sum_to_one(self):
        """With all factors at 0.5, composite should be 0.5."""
        score = compute_composite(0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
        assert score == pytest.approx(0.5)


class TestClassifyConfidence:
    def test_high_confidence(self):
        """Score >= 0.6 with strong binder = high."""
        assert classify_confidence(0.7, "strong_binder") == "high"

    def test_medium_confidence(self):
        """Score >= 0.3 but not high = medium."""
        assert classify_confidence(0.5, "weak_binder") == "medium"

    def test_low_confidence(self):
        """Score < 0.3 = low."""
        assert classify_confidence(0.2, "non_binder") == "low"

    def test_strong_binder_low_score(self):
        """Strong binder but score < 0.6 = medium not high."""
        assert classify_confidence(0.5, "strong_binder") == "medium"

    def test_high_score_weak_binder(self):
        """Score >= 0.6 but weak binder = medium not high."""
        assert classify_confidence(0.7, "weak_binder") == "medium"


class TestScoreAndRank:
    def _make_candidate(self, affinity_nm=50.0, binding_class="strong_binder",
                         wildtype_binding_nm=500.0, immunogenicity=0.5,
                         clonality=0.8, expression=0.7, rank=0) -> NeoantigenScore:
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
            binding_affinity_nm=affinity_nm,
            binding_rank_percentile=0.3,
            wildtype_binding_nm=wildtype_binding_nm,
            binding_class=binding_class,
            agretopicity=0.0,
            immunogenicity_score=immunogenicity,
            expression_level=expression,
            clonality=clonality,
            structural_exposure=None,
        )

    def test_ranking_order(self):
        """Better candidates should rank first."""
        strong = self._make_candidate(affinity_nm=10.0, binding_class="strong_binder")
        weak = self._make_candidate(affinity_nm=300.0, binding_class="weak_binder")

        ranked = score_and_rank([weak, strong])
        assert ranked[0].rank == 1
        assert ranked[0].binding_affinity_nm == 10.0
        assert ranked[1].rank == 2
