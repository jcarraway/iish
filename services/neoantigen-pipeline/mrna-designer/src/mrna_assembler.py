"""Full mRNA sequence assembly.

Assembles the complete mRNA sequence from components:
  5'UTR + Kozak + ORF (starts with ATG) + STOP + 3'UTR + polyA
"""

import logging
from typing import Dict, Any

from .utr_designer import design_5utr, design_3utr, design_poly_a, get_stop_codon

logger = logging.getLogger(__name__)


def assemble_mrna(optimized_orf: str) -> Dict[str, Any]:
    """Assemble the complete mRNA sequence.

    Args:
        optimized_orf: The codon-optimized open reading frame. Already starts
                       with ATG from the initial methionine in the protein.
                       Stop codon is NOT included.

    Returns:
        Dict with the full mRNA sequence and component details.
    """
    five_prime_utr = design_5utr()
    three_prime_utr = design_3utr()
    poly_a = design_poly_a()
    stop_codon = get_stop_codon()

    # The ORF already starts with ATG (from the protein's initial M)
    full_orf = optimized_orf + stop_codon

    # Full mRNA assembly
    full_mrna = (
        five_prime_utr
        + full_orf
        + three_prime_utr
        + poly_a
    )

    assembly = {
        "fullSequence": full_mrna,
        "totalLength": len(full_mrna),
        "components": {
            "fivePrimeUtr": {
                "sequence": five_prime_utr,
                "length": len(five_prime_utr),
            },
            "startCodon": optimized_orf[:3],
            "orf": {
                "sequence": full_orf,
                "length": len(full_orf),
                "codingLength": len(optimized_orf),
            },
            "stopCodon": stop_codon,
            "threePrimeUtr": {
                "sequence": three_prime_utr,
                "length": len(three_prime_utr),
            },
            "polyA": {
                "sequence": poly_a,
                "length": len(poly_a),
            },
        },
    }

    logger.info(
        "mRNA assembled: %d nt total (5'UTR=%d, ORF=%d, 3'UTR=%d, polyA=%d)",
        assembly["totalLength"],
        len(five_prime_utr),
        len(full_orf),
        len(three_prime_utr),
        len(poly_a),
    )

    return assembly
