"""Tests for binding classification thresholds."""

import pytest
from src.binding import classify_binding


class TestClassifyBinding:
    """8 tests for binding classification."""

    def test_strong_binder_low_affinity(self):
        """Affinity below 50nM = strong binder."""
        assert classify_binding(30.0, 1.0) == "strong_binder"

    def test_strong_binder_at_threshold(self):
        """Affinity exactly at 50nM boundary is NOT strong (< not <=)."""
        assert classify_binding(50.0, 1.0) == "weak_binder"

    def test_strong_binder_low_rank(self):
        """Rank below 0.5% = strong binder regardless of affinity."""
        assert classify_binding(200.0, 0.3) == "strong_binder"

    def test_strong_binder_rank_at_threshold(self):
        """Rank exactly at 0.5% boundary is NOT strong (< not <=)."""
        assert classify_binding(200.0, 0.5) == "weak_binder"

    def test_weak_binder_moderate_affinity(self):
        """Affinity 50-500nM = weak binder."""
        assert classify_binding(200.0, 1.5) == "weak_binder"

    def test_weak_binder_moderate_rank(self):
        """Rank 0.5-2.0% = weak binder regardless of affinity."""
        assert classify_binding(600.0, 1.5) == "weak_binder"

    def test_non_binder_high_affinity(self):
        """Affinity >= 500nM and rank >= 2% = non-binder."""
        assert classify_binding(500.0, 2.0) == "non_binder"

    def test_non_binder_very_high(self):
        """Very high affinity and rank = non-binder."""
        assert classify_binding(10000.0, 50.0) == "non_binder"
