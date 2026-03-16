"""Quality gates for peptide generation output."""

import logging

from .peptide_generator import PeptideGenerationResult

logger = logging.getLogger(__name__)

MAX_PEPTIDES_WARNING = 50_000


class QualityGateError(Exception):
    """Raised when a quality gate fails (permanent, non-retryable)."""

    pass


def check_quality_gates(result: PeptideGenerationResult) -> None:
    """Validate peptide generation results.

    Raises:
        QualityGateError: If zero peptides were generated (hard fail).
    """
    total = len(result.peptide_windows)

    if total == 0:
        raise QualityGateError(
            f"Zero peptide windows generated from {result.total_variants} variants. "
            "This may indicate a VCF parsing error or all variants were filtered."
        )

    if result.mhc_i_peptides == 0:
        raise QualityGateError(
            "Zero MHC-I peptides generated. Cannot proceed to binding prediction."
        )

    if total > MAX_PEPTIDES_WARNING:
        logger.warning(
            "High peptide count: %d windows from %d variants. "
            "Binding prediction may be slow.",
            total,
            result.total_variants,
        )

    # Verify peptide content validity
    invalid_count = 0
    valid_aas = set("ACDEFGHIKLMNPQRSTVWY")
    for window in result.peptide_windows:
        if not all(aa in valid_aas for aa in window.mutant_peptide):
            invalid_count += 1

    if invalid_count > 0:
        logger.warning(
            "%d peptides contain non-standard amino acids", invalid_count
        )

    logger.info(
        "Quality gates passed: %d total peptides (%d MHC-I, %d MHC-II) "
        "from %d/%d variants",
        total,
        result.mhc_i_peptides,
        result.mhc_ii_peptides,
        result.variants_with_peptides,
        result.total_variants,
    )
