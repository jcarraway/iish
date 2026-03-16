"""Cancer cell fraction estimation from variant allele frequency (VAF).

Clonal neoantigens (present in all cancer cells) are preferred vaccine targets
over subclonal ones. This module estimates clonality from VAF, assuming a
diploid tumor with the given purity.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Default tumor purity when not provided
DEFAULT_TUMOR_PURITY = 0.7

# Copy number assumption (diploid)
DEFAULT_COPY_NUMBER = 2


def estimate_ccf(
    vaf: float,
    tumor_purity: float = DEFAULT_TUMOR_PURITY,
    copy_number: int = DEFAULT_COPY_NUMBER,
) -> float:
    """Estimate cancer cell fraction (CCF) from VAF.

    CCF = VAF * (purity * CN + (1 - purity) * 2) / purity

    Returns a clonality score in [0, 1] where 1.0 = fully clonal.
    """
    if tumor_purity <= 0:
        return 0.5

    # Expected VAF for a clonal heterozygous variant
    expected_clonal_vaf = tumor_purity / (tumor_purity * copy_number + (1 - tumor_purity) * 2)

    if expected_clonal_vaf <= 0:
        return 0.5

    ccf = vaf / expected_clonal_vaf
    return max(0.0, min(1.0, ccf))


def score_clonality(vaf: float, tumor_purity: Optional[float] = None) -> float:
    """Score clonality from VAF. Returns [0, 1] where 1.0 = clonal."""
    purity = tumor_purity if tumor_purity is not None else DEFAULT_TUMOR_PURITY
    return estimate_ccf(vaf, purity)
