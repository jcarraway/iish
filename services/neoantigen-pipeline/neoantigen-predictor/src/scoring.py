"""Composite neoantigen scoring with 6 weighted factors.

Weights from ONCOVAX_PLATFORM_SPEC Section 4.2.3:
  binding_affinity: 0.25
  agretopicity:     0.20
  immunogenicity:   0.20
  expression:       0.15
  clonality:        0.10
  structural_exposure: 0.10

Confidence classification:
  high:   score >= 0.6 AND strong_binder
  medium: score >= 0.3
  low:    score < 0.3
"""

import logging
import math
from dataclasses import dataclass
from typing import List, Optional

logger = logging.getLogger(__name__)

# Scoring weights
WEIGHT_BINDING = 0.25
WEIGHT_AGRETOPICITY = 0.20
WEIGHT_IMMUNOGENICITY = 0.20
WEIGHT_EXPRESSION = 0.15
WEIGHT_CLONALITY = 0.10
WEIGHT_STRUCTURAL = 0.10

# Default for structural exposure when not computed
DEFAULT_STRUCTURAL_EXPOSURE = 0.5


@dataclass
class NeoantigenScore:
    # Input identifiers
    gene: str
    mutation: str
    chromosome: str
    position: int
    variant_type: str
    vaf: float
    wildtype_peptide: str
    mutant_peptide: str
    peptide_length: int
    hla_allele: str

    # Component scores
    binding_affinity_nm: float
    binding_rank_percentile: float
    wildtype_binding_nm: Optional[float]
    binding_class: str
    agretopicity: float
    immunogenicity_score: float
    expression_level: Optional[float]
    clonality: float
    structural_exposure: Optional[float]

    # Composite
    composite_score: float = 0.0
    rank: int = 0
    confidence: str = "low"


def normalize_binding(affinity_nm: float) -> float:
    """Convert binding affinity (nM) to a 0-1 score. Lower nM = higher score."""
    if affinity_nm <= 0:
        return 1.0
    # Log-scale normalization: 1nM -> 1.0, 50000nM -> ~0.0
    score = 1.0 - (math.log10(affinity_nm) / math.log10(50000))
    return max(0.0, min(1.0, score))


def compute_agretopicity(mutant_affinity_nm: float, wildtype_affinity_nm: Optional[float]) -> float:
    """Agretopicity: ratio of mutant-to-wildtype binding.

    Higher agretopicity = mutant binds much better than wildtype.
    Returns normalized score in [0, 1].
    """
    if wildtype_affinity_nm is None or wildtype_affinity_nm <= 0:
        # No wildtype comparison available; assume moderate agretopicity
        return 0.5

    if mutant_affinity_nm <= 0:
        return 1.0

    ratio = wildtype_affinity_nm / mutant_affinity_nm
    # Normalize: ratio of 1 -> 0.0 (no difference), ratio >= 10 -> 1.0
    score = min(1.0, max(0.0, (ratio - 1.0) / 9.0))
    return score


def compute_composite(
    binding_norm: float,
    agretopicity: float,
    immunogenicity: float,
    expression: Optional[float],
    clonality: float,
    structural_exposure: Optional[float],
) -> float:
    """Weighted composite score from 6 factors."""
    expr = expression if expression is not None else 0.5
    struct = structural_exposure if structural_exposure is not None else DEFAULT_STRUCTURAL_EXPOSURE

    score = (
        WEIGHT_BINDING * binding_norm
        + WEIGHT_AGRETOPICITY * agretopicity
        + WEIGHT_IMMUNOGENICITY * immunogenicity
        + WEIGHT_EXPRESSION * expr
        + WEIGHT_CLONALITY * clonality
        + WEIGHT_STRUCTURAL * struct
    )
    return max(0.0, min(1.0, score))


def classify_confidence(composite_score: float, binding_class: str) -> str:
    """Classify confidence level based on composite score and binding class."""
    if composite_score >= 0.6 and binding_class == "strong_binder":
        return "high"
    if composite_score >= 0.3:
        return "medium"
    return "low"


def score_and_rank(candidates: List[NeoantigenScore]) -> List[NeoantigenScore]:
    """Compute composite scores and rank all candidates."""
    for c in candidates:
        binding_norm = normalize_binding(c.binding_affinity_nm)
        c.agretopicity = compute_agretopicity(c.binding_affinity_nm, c.wildtype_binding_nm)
        c.composite_score = compute_composite(
            binding_norm=binding_norm,
            agretopicity=c.agretopicity,
            immunogenicity=c.immunogenicity_score,
            expression=c.expression_level,
            clonality=c.clonality,
            structural_exposure=c.structural_exposure,
        )
        c.confidence = classify_confidence(c.composite_score, c.binding_class)

    # Sort descending by composite score
    candidates.sort(key=lambda c: c.composite_score, reverse=True)

    # Assign ranks (1-based)
    for i, c in enumerate(candidates):
        c.rank = i + 1

    logger.info(
        "Scored %d candidates: %d high, %d medium, %d low confidence",
        len(candidates),
        sum(1 for c in candidates if c.confidence == "high"),
        sum(1 for c in candidates if c.confidence == "medium"),
        sum(1 for c in candidates if c.confidence == "low"),
    )

    return candidates
