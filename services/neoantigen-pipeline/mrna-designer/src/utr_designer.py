"""UTR design for mRNA vaccine constructs.

Designs the 5' and 3' untranslated regions for optimal translation:
- 5' UTR: alpha-globin UTR with Kozak consensus sequence
- 3' UTR: doubled beta-globin UTR for stability
- Poly(A) tail: 120 nucleotides
"""

import logging

logger = logging.getLogger(__name__)

# Human alpha-globin 5' UTR (HBA1) - well-characterized for high translation efficiency
ALPHA_GLOBIN_5UTR = "ACTTCTGGTCCCCACAGACTCAGAGAGAACCCACC"

# Kozak consensus sequence for optimal translation initiation
# The critical positions are -3 (A/G) and +4 (G)
KOZAK_SEQUENCE = "GCCACC"  # Strong Kozak: GCC(A/G)CCAUGG

# Human beta-globin 3' UTR (HBB) - enhances mRNA stability
BETA_GLOBIN_3UTR = (
    "GCTCGCTTTCTTGCTGTCCAATTTCTATTAAAGGTTCCTTTGTTCCCTAAGTCCAACTACTAAACT"
    "GGGGGATATTATGAAGGGCCTTGAGCATCTGGATTCTGCCTAATAAAAAACATTTATTTTCATTGC"
)

# Poly(A) tail length
POLY_A_LENGTH = 120

# Stop codons (using TAA as it's most efficient for termination in human)
STOP_CODON = "TGA"


def design_5utr() -> str:
    """Design the 5' UTR with alpha-globin UTR and Kozak sequence.

    Returns the full 5' UTR sequence (everything before ATG).
    """
    utr = ALPHA_GLOBIN_5UTR + KOZAK_SEQUENCE
    logger.info("5' UTR designed: %d nt", len(utr))
    return utr


def design_3utr() -> str:
    """Design the 3' UTR with doubled beta-globin UTR.

    Doubling the 3' UTR increases mRNA stability and half-life
    (demonstrated in BioNTech/Moderna vaccine designs).
    """
    utr = BETA_GLOBIN_3UTR + BETA_GLOBIN_3UTR
    logger.info("3' UTR designed: %d nt (doubled beta-globin)", len(utr))
    return utr


def design_poly_a(length: int = POLY_A_LENGTH) -> str:
    """Generate poly(A) tail.

    120 nt poly(A) is optimal for mRNA stability in mammalian cells.
    """
    return "A" * length


def get_stop_codon() -> str:
    """Return the preferred stop codon."""
    return STOP_CODON


def get_utr_metadata() -> dict:
    """Return metadata about UTR design choices."""
    return {
        "fivePrimeUtr": {
            "source": "Human alpha-globin (HBA1)",
            "kozak": KOZAK_SEQUENCE,
            "length": len(ALPHA_GLOBIN_5UTR + KOZAK_SEQUENCE),
        },
        "threePrimeUtr": {
            "source": "Human beta-globin (HBB) x2",
            "copies": 2,
            "singleLength": len(BETA_GLOBIN_3UTR),
            "totalLength": len(BETA_GLOBIN_3UTR) * 2,
        },
        "polyA": {
            "length": POLY_A_LENGTH,
        },
        "stopCodon": STOP_CODON,
    }
