"""Solvent-accessible surface area (SASA) calculation for peptide-MHC complexes.

Uses biotite's SASA implementation (Shrake-Rupley algorithm) to calculate
the exposed surface of the mutant peptide residue in the MHC complex context.
"""

import logging
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# Maximum SASA values per amino acid (in Angstrom^2)
# Based on Tien et al. (2013) theoretical max SASA in Gly-X-Gly tripeptide
MAX_SASA_PER_AA: dict[str, float] = {
    "A": 129.0, "R": 274.0, "N": 195.0, "D": 193.0, "C": 167.0,
    "Q": 225.0, "E": 223.0, "G": 104.0, "H": 224.0, "I": 197.0,
    "L": 201.0, "K": 236.0, "M": 224.0, "F": 240.0, "P": 159.0,
    "S": 155.0, "T": 172.0, "W": 285.0, "Y": 263.0, "V": 174.0,
}


def calculate_sasa(pdb_path: Path, peptide_sequence: str) -> Optional[float]:
    """Calculate normalized SASA for peptide residues in an MHC complex.

    Returns a normalized exposure score in [0, 1], or None if calculation fails.
    The score represents the fraction of the peptide's surface that is solvent-exposed
    in the context of the MHC groove.
    """
    try:
        import biotite.structure as struc
        import biotite.structure.io.pdb as pdb
    except ImportError:
        logger.error("biotite not installed; cannot calculate SASA")
        return None

    try:
        pdb_file = pdb.PDBFile.read(str(pdb_path))
        structure = pdb_file.get_structure(model=1)

        # Filter to only standard amino acid atoms
        structure = structure[struc.filter_amino_acids(structure)]

        if len(structure) == 0:
            logger.error("No amino acid atoms found in %s", pdb_path)
            return None

        # Calculate SASA using Shrake-Rupley algorithm
        atom_sasa = struc.sasa(structure, vdw_radii="ProtOr")

        # Identify peptide chain residues (shortest chain, matching our threading)
        chain_ids = np.unique(structure.chain_id)
        peptide_chain_id = _find_peptide_chain_id(structure, chain_ids, peptide_sequence)

        if peptide_chain_id is None:
            # Fallback: use the whole structure SASA
            logger.warning("Could not identify peptide chain; using total SASA")
            total_sasa = np.sum(atom_sasa)
            max_possible = sum(MAX_SASA_PER_AA.get(aa, 200.0) for aa in peptide_sequence)
            return min(1.0, total_sasa / max_possible) if max_possible > 0 else 0.5

        # Sum SASA for peptide chain atoms
        peptide_mask = structure.chain_id == peptide_chain_id
        peptide_sasa = np.sum(atom_sasa[peptide_mask])

        # Calculate maximum possible SASA for this peptide
        max_sasa = sum(MAX_SASA_PER_AA.get(aa, 200.0) for aa in peptide_sequence)

        if max_sasa <= 0:
            return 0.5

        normalized = peptide_sasa / max_sasa
        result = max(0.0, min(1.0, normalized))

        logger.info(
            "SASA for peptide %s: %.1f A^2 (%.1f%% of max %.1f)",
            peptide_sequence, peptide_sasa, result * 100, max_sasa,
        )

        return result

    except Exception as e:
        logger.error("SASA calculation failed for %s: %s", pdb_path, e)
        return None


def _find_peptide_chain_id(
    structure,
    chain_ids: np.ndarray,
    peptide_sequence: str,
) -> Optional[str]:
    """Find the chain ID of the peptide in the structure."""
    best_chain = None
    best_length_diff = float("inf")

    for chain_id in chain_ids:
        chain_mask = structure.chain_id == chain_id
        chain_atoms = structure[chain_mask]

        # Count unique residues in this chain
        res_ids = np.unique(chain_atoms.res_id)
        n_residues = len(res_ids)

        # Peptide chain should be 7-16 residues
        if 7 <= n_residues <= 16:
            length_diff = abs(n_residues - len(peptide_sequence))
            if length_diff < best_length_diff:
                best_length_diff = length_diff
                best_chain = chain_id

    return best_chain
