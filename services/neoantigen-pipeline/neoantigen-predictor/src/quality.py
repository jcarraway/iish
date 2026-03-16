"""Quality gates for neoantigen prediction.

Checks:
  - FAIL: zero predictions produced (pipeline error)
  - WARN: zero binders found (all non_binder — unusual but valid)
  - PASS: at least one binder found
"""

import logging
from typing import List

from .scoring import NeoantigenScore

logger = logging.getLogger(__name__)


class QualityGateError(Exception):
    """Raised when a quality gate fails (non-retryable)."""
    pass


def check_quality_gates(candidates: List[NeoantigenScore]) -> str:
    """Run quality gates on scored candidates.

    Returns:
        "pass" or "warn"

    Raises:
        QualityGateError: If zero predictions were produced.
    """
    if len(candidates) == 0:
        raise QualityGateError(
            "Zero neoantigen predictions produced. "
            "Check that HLA genotype and peptide inputs are valid."
        )

    binders = [c for c in candidates if c.binding_class != "non_binder"]

    if len(binders) == 0:
        logger.warning(
            "QUALITY WARN: Zero binders found among %d predictions. "
            "All peptides classified as non-binders.",
            len(candidates),
        )
        return "warn"

    logger.info(
        "QUALITY PASS: %d binders out of %d total predictions",
        len(binders),
        len(candidates),
    )
    return "pass"
