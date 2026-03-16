"""MHC template PDB mapping for common HLA alleles.

Maps ~25 common HLA-A/B/C alleles to RCSB PDB IDs. Used for template-based
peptide-MHC structure modeling.
"""

import logging
import os
from pathlib import Path
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# Common HLA alleles mapped to representative PDB structures
# Format: HLA allele -> (PDB ID, chain for MHC heavy chain)
HLA_TEMPLATE_MAP: dict[str, tuple[str, str]] = {
    # HLA-A alleles
    "HLA-A*01:01": ("6AT9", "A"),
    "HLA-A*02:01": ("3MRE", "A"),
    "HLA-A*02:06": ("3MRG", "A"),
    "HLA-A*03:01": ("3RL1", "A"),
    "HLA-A*11:01": ("1Q94", "A"),
    "HLA-A*23:01": ("3KLA", "A"),
    "HLA-A*24:02": ("3I6G", "A"),
    "HLA-A*26:01": ("1AOG", "A"),
    "HLA-A*29:02": ("7JYV", "A"),
    "HLA-A*30:01": ("6J1W", "A"),
    "HLA-A*31:01": ("1A1O", "A"),
    "HLA-A*33:01": ("4HX1", "A"),
    "HLA-A*68:01": ("4HWZ", "A"),
    # HLA-B alleles
    "HLA-B*07:02": ("5EO1", "A"),
    "HLA-B*08:01": ("3X13", "A"),
    "HLA-B*15:01": ("1XR8", "A"),
    "HLA-B*18:01": ("4JQX", "A"),
    "HLA-B*27:05": ("1OGT", "A"),
    "HLA-B*35:01": ("1A1N", "A"),
    "HLA-B*40:01": ("4L3C", "A"),
    "HLA-B*44:02": ("1M6O", "A"),
    "HLA-B*44:03": ("1N2R", "A"),
    "HLA-B*51:01": ("1E27", "A"),
    "HLA-B*57:01": ("5T6X", "A"),
    "HLA-B*58:01": ("5IM7", "A"),
    # HLA-C alleles
    "HLA-C*07:02": ("5VGE", "A"),
}


def get_template_pdb_id(hla_allele: str) -> Optional[tuple[str, str]]:
    """Look up the template PDB ID for an HLA allele.

    Returns (pdb_id, chain_id) or None if no template available.
    Tries exact match first, then 2-digit resolution (e.g. HLA-A*02:01 for HLA-A*02:07).
    """
    # Exact match
    if hla_allele in HLA_TEMPLATE_MAP:
        return HLA_TEMPLATE_MAP[hla_allele]

    # Try supertype match (same 2-digit group)
    parts = hla_allele.split("*")
    if len(parts) == 2:
        gene = parts[0]
        digits = parts[1].split(":")
        if len(digits) >= 1:
            prefix = f"{gene}*{digits[0]}:"
            for allele, template in HLA_TEMPLATE_MAP.items():
                if allele.startswith(prefix):
                    logger.info(
                        "Using supertype template %s for allele %s (matched %s)",
                        template[0], hla_allele, allele,
                    )
                    return template

    return None


def download_template_pdb(pdb_id: str, output_dir: Path) -> Path:
    """Download a PDB file from RCSB.

    Returns path to downloaded PDB file.
    """
    output_path = output_dir / f"{pdb_id.lower()}.pdb"

    if output_path.exists():
        logger.info("Template PDB %s already cached at %s", pdb_id, output_path)
        return output_path

    url = f"https://files.rcsb.org/download/{pdb_id.upper()}.pdb"
    logger.info("Downloading template PDB from %s", url)

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(response.text)

    logger.info("Downloaded template PDB %s to %s", pdb_id, output_path)
    return output_path
