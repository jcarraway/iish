"""Gene expression filtering from RNA-seq data (optional).

When RNA-seq data is available, filters out neoantigens from genes that are
not expressed in the tumor. Returns normalized expression levels.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger(__name__)


def load_expression_data(expression_path: Path) -> Dict[str, float]:
    """Load gene expression data from a JSON file.

    Expected format: {"GENE1": 12.5, "GENE2": 0.0, ...} (TPM values)
    """
    with open(expression_path) as f:
        data = json.load(f)

    logger.info("Loaded expression data for %d genes", len(data))
    return data


def get_expression_score(
    gene: str,
    expression_data: Optional[Dict[str, float]],
) -> Optional[float]:
    """Get normalized expression score for a gene.

    Returns None if no expression data is available.
    Returns 0.0 for genes with TPM < 1 (not expressed).
    Returns normalized score in [0, 1] for expressed genes.
    """
    if expression_data is None:
        return None

    tpm = expression_data.get(gene)
    if tpm is None:
        # Gene not found in expression data; assume moderate expression
        return 0.5

    if tpm < 1.0:
        return 0.0

    # Log-scale normalization: TPM 1 -> 0.1, TPM 100 -> 0.7, TPM 1000+ -> 1.0
    import math
    score = min(1.0, 0.1 + 0.3 * math.log10(max(1.0, tpm)))
    return score
