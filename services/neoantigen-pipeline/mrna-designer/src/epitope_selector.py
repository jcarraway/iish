"""Epitope selection for the polyepitope vaccine construct.

Selects top epitopes from ranked neoantigens based on composite score,
HLA diversity, and clonality preference.
"""

import logging
from typing import Any, Dict, List, Set

logger = logging.getLogger(__name__)

MIN_COMPOSITE_SCORE = 0.3
MAX_EPITOPES = 20


def select_epitopes(
    neoantigens: List[Dict[str, Any]],
    max_epitopes: int = MAX_EPITOPES,
    min_score: float = MIN_COMPOSITE_SCORE,
) -> List[Dict[str, Any]]:
    """Select top epitopes for vaccine construct.

    Selection criteria:
    1. Minimum composite score threshold (0.3)
    2. HLA diversity: prefer coverage of multiple HLA alleles
    3. Clonality preference: prefer clonal (higher VAF) neoantigens
    4. Deduplicate by peptide sequence (keep best scoring)

    Returns up to max_epitopes selected neoantigens.
    """
    # Filter by minimum score
    eligible = [n for n in neoantigens if n.get("compositeScore", 0) >= min_score]
    logger.info(
        "Eligible epitopes (score >= %.2f): %d / %d",
        min_score, len(eligible), len(neoantigens),
    )

    if not eligible:
        logger.warning("No epitopes meet minimum score threshold; using top candidates")
        eligible = sorted(neoantigens, key=lambda n: n.get("compositeScore", 0), reverse=True)

    # Deduplicate by peptide sequence (keep highest scoring)
    seen_peptides: Dict[str, Dict[str, Any]] = {}
    for n in eligible:
        peptide = n.get("mutantPeptide", "")
        existing = seen_peptides.get(peptide)
        if existing is None or n.get("compositeScore", 0) > existing.get("compositeScore", 0):
            seen_peptides[peptide] = n

    unique_candidates = sorted(
        seen_peptides.values(),
        key=lambda n: n.get("compositeScore", 0),
        reverse=True,
    )

    # Select with HLA diversity
    selected = _select_with_hla_diversity(unique_candidates, max_epitopes)

    logger.info(
        "Selected %d epitopes from %d unique candidates",
        len(selected), len(unique_candidates),
    )

    return selected


def _select_with_hla_diversity(
    candidates: List[Dict[str, Any]],
    max_epitopes: int,
) -> List[Dict[str, Any]]:
    """Select epitopes while maximizing HLA allele coverage.

    Uses a greedy approach: iterates through candidates by score,
    prioritizing those that cover new HLA alleles.
    """
    selected: List[Dict[str, Any]] = []
    covered_alleles: Set[str] = set()
    remaining = list(candidates)

    while len(selected) < max_epitopes and remaining:
        # First pass: find candidates covering new alleles
        best_new_allele = None
        best_new_allele_idx = -1

        for i, c in enumerate(remaining):
            allele = c.get("hlaAllele", "")
            if allele and allele not in covered_alleles:
                if best_new_allele is None:
                    best_new_allele = c
                    best_new_allele_idx = i
                    break  # Take the highest-scoring one with new allele

        if best_new_allele is not None:
            selected.append(best_new_allele)
            covered_alleles.add(best_new_allele.get("hlaAllele", ""))
            remaining.pop(best_new_allele_idx)
        else:
            # All alleles covered; just take the next highest-scoring
            # Prefer clonal variants (higher clonality score)
            remaining.sort(
                key=lambda c: (c.get("clonality", 0), c.get("compositeScore", 0)),
                reverse=True,
            )
            selected.append(remaining.pop(0))

    return selected
