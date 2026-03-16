"""MHC binding affinity predictions using MHCflurry 2.0.

Class I: Full MHCflurry batch predictions.
Class II: Placeholder returning default weak-binder values (future: NetMHCIIpan).
"""

import logging
from dataclasses import dataclass
from typing import List, Optional

logger = logging.getLogger(__name__)

# Binding classification thresholds (ONCOVAX_PLATFORM_SPEC Section 4.2.3)
STRONG_BINDER_NM = 50.0
STRONG_BINDER_RANK = 0.5
WEAK_BINDER_NM = 500.0
WEAK_BINDER_RANK = 2.0


@dataclass
class BindingResult:
    peptide: str
    allele: str
    affinity_nm: float
    rank_percentile: float
    binding_class: str
    presentation_score: Optional[float] = None


def classify_binding(affinity_nm: float, rank_percentile: float) -> str:
    """Classify binding strength based on affinity and rank."""
    if affinity_nm < STRONG_BINDER_NM or rank_percentile < STRONG_BINDER_RANK:
        return "strong_binder"
    if affinity_nm < WEAK_BINDER_NM or rank_percentile < WEAK_BINDER_RANK:
        return "weak_binder"
    return "non_binder"


def predict_class_i(
    peptides: List[str],
    alleles: List[str],
) -> List[BindingResult]:
    """Run MHCflurry Class I binding predictions in batch mode.

    Args:
        peptides: List of peptide sequences.
        alleles: List of HLA-A/B/C alleles (e.g. ["HLA-A*02:01"]).

    Returns:
        List of BindingResult for each peptide-allele pair.
    """
    from mhcflurry import Class1PresentationPredictor

    predictor = Class1PresentationPredictor.load()

    results: List[BindingResult] = []

    # Build batch input: all peptide-allele combinations
    batch_peptides = []
    batch_alleles = []
    for peptide in peptides:
        for allele in alleles:
            batch_peptides.append(peptide)
            batch_alleles.append(allele)

    if not batch_peptides:
        return results

    logger.info(
        "Predicting binding for %d peptide-allele pairs",
        len(batch_peptides),
    )

    df = predictor.predict(
        peptides=batch_peptides,
        alleles=batch_alleles,
        verbose=0,
    )

    for _, row in df.iterrows():
        affinity = float(row["affinity"])
        rank = float(row["affinity_percentile"])
        presentation = float(row.get("presentation_score", 0.0))

        results.append(BindingResult(
            peptide=row["peptide"],
            allele=row["allele"],
            affinity_nm=affinity,
            rank_percentile=rank,
            binding_class=classify_binding(affinity, rank),
            presentation_score=presentation,
        ))

    logger.info(
        "Class I predictions complete: %d strong, %d weak, %d non-binders",
        sum(1 for r in results if r.binding_class == "strong_binder"),
        sum(1 for r in results if r.binding_class == "weak_binder"),
        sum(1 for r in results if r.binding_class == "non_binder"),
    )

    return results


def predict_class_ii(
    peptides: List[str],
    alleles: List[str],
) -> List[BindingResult]:
    """Placeholder for Class II binding predictions.

    Returns default weak-binder values. Future: integrate NetMHCIIpan.
    """
    results: List[BindingResult] = []

    for peptide in peptides:
        for allele in alleles:
            results.append(BindingResult(
                peptide=peptide,
                allele=allele,
                affinity_nm=250.0,
                rank_percentile=1.5,
                binding_class="weak_binder",
                presentation_score=None,
            ))

    logger.info("Class II placeholder: %d peptide-allele pairs", len(results))
    return results
