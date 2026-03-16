"""Template-based peptide-MHC complex modeling using Biopython.

Threads a mutant peptide onto a template MHC-I crystal structure backbone
by replacing the template peptide's side chains with the mutant peptide residues.
"""

import logging
from pathlib import Path
from typing import Optional

from Bio.PDB import PDBParser, PDBIO, Select
from Bio.PDB.Structure import Structure
from Bio.PDB.Chain import Chain
from Bio.PDB.Residue import Residue

logger = logging.getLogger(__name__)

# Standard amino acid 3-letter codes
AA_3_TO_1 = {
    "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C",
    "GLN": "Q", "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I",
    "LEU": "L", "LYS": "K", "MET": "M", "PHE": "F", "PRO": "P",
    "SER": "S", "THR": "T", "TRP": "W", "TYR": "Y", "VAL": "V",
}

AA_1_TO_3 = {v: k for k, v in AA_3_TO_1.items()}


class PeptideChainSelect(Select):
    """Select only the peptide chain from the structure."""

    def __init__(self, peptide_chain_id: str):
        self.peptide_chain_id = peptide_chain_id

    def accept_chain(self, chain: Chain) -> int:
        return 1  # Accept all chains for the full complex

    def accept_residue(self, residue: Residue) -> int:
        # Skip water and hetero atoms
        hetflag = residue.get_id()[0]
        if hetflag != " ":
            return 0
        return 1


def find_peptide_chain(structure: Structure) -> Optional[Chain]:
    """Find the peptide chain in an MHC structure.

    The peptide chain is typically the shortest protein chain (8-15 residues)
    in the first model.
    """
    model = structure[0]
    chains = list(model.get_chains())

    peptide_chain = None
    min_length = float("inf")

    for chain in chains:
        standard_residues = [
            r for r in chain.get_residues()
            if r.get_id()[0] == " " and r.get_resname() in AA_3_TO_1
        ]
        length = len(standard_residues)

        # Peptide chains in MHC-I complexes are typically 8-15 residues
        if 7 <= length <= 16 and length < min_length:
            min_length = length
            peptide_chain = chain

    return peptide_chain


def thread_peptide(
    template_path: Path,
    mutant_peptide: str,
    output_path: Path,
) -> Optional[Path]:
    """Thread a mutant peptide onto a template MHC structure.

    Replaces the template peptide residue names with the mutant peptide's
    amino acids while keeping the backbone coordinates. This is a simplified
    threading that preserves backbone geometry.

    Returns the output PDB path, or None if threading fails.
    """
    parser = PDBParser(QUIET=True)

    try:
        structure = parser.get_structure("template", str(template_path))
    except Exception as e:
        logger.error("Failed to parse template PDB %s: %s", template_path, e)
        return None

    peptide_chain = find_peptide_chain(structure)
    if peptide_chain is None:
        logger.error("Could not find peptide chain in template %s", template_path)
        return None

    # Get standard residues from peptide chain
    template_residues = [
        r for r in peptide_chain.get_residues()
        if r.get_id()[0] == " " and r.get_resname() in AA_3_TO_1
    ]

    template_length = len(template_residues)
    peptide_length = len(mutant_peptide)

    if peptide_length > template_length + 2 or peptide_length < template_length - 2:
        logger.warning(
            "Peptide length mismatch: template=%d, mutant=%d (max diff 2)",
            template_length, peptide_length,
        )
        return None

    # Thread by replacing residue names (keeping backbone atoms)
    # For length mismatches, map using anchor positions (first 3 + last 3)
    if peptide_length == template_length:
        mapping = list(range(peptide_length))
    else:
        # Anchor-based mapping for different length peptides
        # Map first 3 and last 3 positions, distribute middle evenly
        mapping = _build_anchor_mapping(template_length, peptide_length)

    for template_idx, peptide_idx in enumerate(mapping):
        if template_idx >= len(template_residues) or peptide_idx >= peptide_length:
            break

        new_resname = AA_1_TO_3.get(mutant_peptide[peptide_idx])
        if new_resname is None:
            logger.warning("Unknown amino acid: %s", mutant_peptide[peptide_idx])
            continue

        residue = template_residues[template_idx]
        residue.resname = new_resname

        # Keep only backbone atoms (N, CA, C, O) for non-glycine
        # This creates a backbone-only model that indicates structure
        atoms_to_remove = []
        for atom in residue.get_atoms():
            if atom.get_name() not in ("N", "CA", "C", "O", "CB"):
                atoms_to_remove.append(atom.get_id())
        for atom_id in atoms_to_remove:
            residue.detach_child(atom_id)

    # Write output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    io = PDBIO()
    io.set_structure(structure)
    io.save(str(output_path), select=PeptideChainSelect(peptide_chain.get_id()))

    logger.info("Threaded peptide %s onto template -> %s", mutant_peptide, output_path)
    return output_path


def _build_anchor_mapping(template_len: int, peptide_len: int) -> list[int]:
    """Build position mapping between template and peptide of different lengths.

    Anchors first 3 and last 3 positions, distributes middle positions evenly.
    """
    if peptide_len <= 6:
        return list(range(min(template_len, peptide_len)))

    mapping = []
    # First 3 positions map directly
    for i in range(3):
        mapping.append(i)

    # Middle positions distributed evenly
    middle_template = template_len - 6
    middle_peptide = peptide_len - 6

    if middle_template > 0 and middle_peptide > 0:
        for i in range(middle_template):
            peptide_pos = 3 + round(i * middle_peptide / middle_template)
            peptide_pos = min(peptide_pos, peptide_len - 4)
            mapping.append(peptide_pos)
    elif middle_template > 0:
        # Template longer than peptide — repeat last mapped position
        for _ in range(middle_template):
            mapping.append(2)

    # Last 3 positions map from the end
    for i in range(3):
        mapping.append(peptide_len - 3 + i)

    return mapping[:template_len]
