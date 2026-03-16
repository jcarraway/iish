"""Polyepitope construct designer for mRNA vaccine.

Assembles the protein-level construct:
  Signal peptide + [epitope1-linker-epitope2-linker-...] + PADRE universal epitope

Uses EAAAK flexible linkers between epitopes and includes the PADRE
universal helper T-cell epitope at the C-terminus.
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# tPA signal peptide (guides nascent protein into ER for MHC presentation)
SIGNAL_PEPTIDE = "MFVFLVLLPLVSSQ"

# EAAAK rigid alpha-helical linker (minimizes junctional epitopes)
LINKER = "EAAAK"

# PADRE universal CD4+ T-helper epitope (enhances immunogenicity)
PADRE_EPITOPE = "AKFVAAWTLKAAA"


def design_construct(
    epitopes: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Design the polyepitope protein construct.

    Structure: SignalPeptide - Epitope1 - EAAAK - Epitope2 - ... - EAAAK - PADRE

    Returns a dict with construct details.
    """
    peptide_sequences = [e.get("mutantPeptide", "") for e in epitopes]
    peptide_sequences = [p for p in peptide_sequences if p]

    if not peptide_sequences:
        raise ValueError("No valid peptide sequences for construct design")

    # Assemble protein sequence
    epitope_region = LINKER.join(peptide_sequences)
    protein_sequence = SIGNAL_PEPTIDE + epitope_region + LINKER + PADRE_EPITOPE

    # Calculate construct metadata
    total_epitopes = len(peptide_sequences)
    total_linkers = total_epitopes  # N epitopes + 1 for PADRE connection

    construct = {
        "signalPeptide": SIGNAL_PEPTIDE,
        "epitopes": peptide_sequences,
        "linker": LINKER,
        "padreEpitope": PADRE_EPITOPE,
        "proteinSequence": protein_sequence,
        "proteinLength": len(protein_sequence),
        "totalEpitopes": total_epitopes,
        "totalLinkers": total_linkers,
        "epitopeDetails": [
            {
                "position": i + 1,
                "peptide": e.get("mutantPeptide", ""),
                "gene": e.get("gene", ""),
                "mutation": e.get("mutation", ""),
                "hlaAllele": e.get("hlaAllele", ""),
                "compositeScore": e.get("compositeScore", 0),
            }
            for i, e in enumerate(epitopes)
            if e.get("mutantPeptide")
        ],
    }

    logger.info(
        "Designed construct: %d epitopes, %d aa total, protein: %s...%s",
        total_epitopes,
        len(protein_sequence),
        protein_sequence[:20],
        protein_sequence[-10:],
    )

    return construct
