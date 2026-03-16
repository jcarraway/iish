"""Human codon optimization for mRNA vaccine constructs.

Optimizes codons for:
- Human codon usage bias
- GC content targeting (50-60%)
- Avoidance of homopolymer runs (>6nt)
- Avoidance of common restriction enzyme sites
"""

import logging
import random
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Human codon usage table (codon -> amino acid)
# Weights based on human codon usage frequency
CODON_TABLE: Dict[str, List[Tuple[str, float]]] = {
    "A": [("GCC", 0.40), ("GCT", 0.26), ("GCA", 0.23), ("GCG", 0.11)],
    "R": [("CGG", 0.21), ("AGA", 0.20), ("AGG", 0.20), ("CGC", 0.19), ("CGT", 0.08), ("CGA", 0.11)],
    "N": [("AAC", 0.54), ("AAT", 0.46)],
    "D": [("GAC", 0.54), ("GAT", 0.46)],
    "C": [("TGC", 0.55), ("TGT", 0.45)],
    "Q": [("CAG", 0.73), ("CAA", 0.27)],
    "E": [("GAG", 0.58), ("GAA", 0.42)],
    "G": [("GGC", 0.34), ("GGG", 0.25), ("GGA", 0.25), ("GGT", 0.16)],
    "H": [("CAC", 0.58), ("CAT", 0.42)],
    "I": [("ATC", 0.48), ("ATT", 0.36), ("ATA", 0.16)],
    "L": [("CTG", 0.41), ("CTC", 0.20), ("CTT", 0.13), ("TTG", 0.13), ("TTA", 0.07), ("CTA", 0.07)],
    "K": [("AAG", 0.58), ("AAA", 0.42)],
    "M": [("ATG", 1.0)],
    "F": [("TTC", 0.55), ("TTT", 0.45)],
    "P": [("CCC", 0.33), ("CCT", 0.28), ("CCA", 0.27), ("CCG", 0.11)],
    "S": [("AGC", 0.24), ("TCC", 0.22), ("TCT", 0.15), ("AGT", 0.15), ("TCA", 0.12), ("TCG", 0.06)],
    "T": [("ACC", 0.36), ("ACA", 0.28), ("ACT", 0.24), ("ACG", 0.12)],
    "W": [("TGG", 1.0)],
    "Y": [("TAC", 0.57), ("TAT", 0.43)],
    "V": [("GTG", 0.47), ("GTC", 0.24), ("GTT", 0.18), ("GTA", 0.11)],
    "*": [("TGA", 0.47), ("TAA", 0.28), ("TAG", 0.25)],
}

# Restriction enzyme sites to avoid
RESTRICTION_SITES = [
    "GAATTC",   # EcoRI
    "GGATCC",   # BamHI
    "AAGCTT",   # HindIII
    "CTCGAG",   # XhoI
    "GCGGCCGC", # NotI
    "CATATG",   # NdeI
]

# Target GC content range
GC_TARGET_LOW = 0.50
GC_TARGET_HIGH = 0.60


def optimize_codons(protein_sequence: str, seed: Optional[int] = None) -> str:
    """Optimize codons for human expression.

    Uses weighted random selection based on human codon usage,
    then iteratively adjusts to hit GC content targets and avoid
    problematic sequences.
    """
    if seed is not None:
        random.seed(seed)

    # Initial codon selection using weighted random
    codons = _initial_codon_selection(protein_sequence)

    # Iterative optimization for GC content
    codons = _optimize_gc_content(protein_sequence, codons)

    # Remove homopolymer runs
    codons = _remove_homopolymers(protein_sequence, codons)

    # Remove restriction sites
    codons = _remove_restriction_sites(protein_sequence, codons)

    orf = "".join(codons)

    gc_content = _gc_content(orf)
    logger.info(
        "Codon optimization: %d aa -> %d nt, GC=%.1f%%",
        len(protein_sequence), len(orf), gc_content * 100,
    )

    return orf


def _initial_codon_selection(protein_sequence: str) -> List[str]:
    """Select codons using weighted random based on human usage."""
    codons = []
    for aa in protein_sequence:
        options = CODON_TABLE.get(aa)
        if options is None:
            raise ValueError(f"Unknown amino acid: {aa}")

        codon_choices, weights = zip(*options)
        selected = random.choices(codon_choices, weights=weights, k=1)[0]
        codons.append(selected)
    return codons


def _optimize_gc_content(protein_sequence: str, codons: List[str]) -> List[str]:
    """Iteratively swap codons to bring GC content into target range."""
    max_iterations = 100
    for _ in range(max_iterations):
        orf = "".join(codons)
        gc = _gc_content(orf)

        if GC_TARGET_LOW <= gc <= GC_TARGET_HIGH:
            break

        # Find a position to swap
        for i, aa in enumerate(protein_sequence):
            options = CODON_TABLE.get(aa, [])
            if len(options) <= 1:
                continue

            current_gc = _gc_content(codons[i])

            if gc < GC_TARGET_LOW:
                # Need more GC: pick highest GC codon
                best_codon = max(options, key=lambda x: _gc_content(x[0]))[0]
            else:
                # Need less GC: pick lowest GC codon
                best_codon = min(options, key=lambda x: _gc_content(x[0]))[0]

            if best_codon != codons[i]:
                codons[i] = best_codon
                # Check if we're in range now
                if GC_TARGET_LOW <= _gc_content("".join(codons)) <= GC_TARGET_HIGH:
                    break

    return codons


def _remove_homopolymers(protein_sequence: str, codons: List[str]) -> List[str]:
    """Break up homopolymer runs longer than 6 nucleotides."""
    max_iterations = 50

    for _ in range(max_iterations):
        orf = "".join(codons)
        run_pos = _find_homopolymer(orf, max_run=6)

        if run_pos is None:
            break

        # Find which codon contains this position and swap it
        codon_idx = run_pos // 3
        if codon_idx >= len(protein_sequence):
            break

        aa = protein_sequence[codon_idx]
        options = CODON_TABLE.get(aa, [])
        if len(options) <= 1:
            break

        # Try alternative codons
        for codon, _ in options:
            if codon != codons[codon_idx]:
                codons[codon_idx] = codon
                new_orf = "".join(codons)
                if _find_homopolymer(new_orf, max_run=6) != run_pos:
                    break

    return codons


def _remove_restriction_sites(protein_sequence: str, codons: List[str]) -> List[str]:
    """Remove common restriction enzyme recognition sites."""
    for site in RESTRICTION_SITES:
        max_attempts = 10
        for _ in range(max_attempts):
            orf = "".join(codons)
            pos = orf.find(site)
            if pos == -1:
                break

            # Find the codon overlapping this site and swap
            codon_idx = pos // 3
            if codon_idx >= len(protein_sequence):
                break

            aa = protein_sequence[codon_idx]
            options = CODON_TABLE.get(aa, [])

            swapped = False
            for codon, _ in options:
                if codon != codons[codon_idx]:
                    codons[codon_idx] = codon
                    if site not in "".join(codons):
                        swapped = True
                        break
            if not swapped:
                # Try adjacent codon
                next_idx = codon_idx + 1
                if next_idx < len(protein_sequence):
                    aa2 = protein_sequence[next_idx]
                    options2 = CODON_TABLE.get(aa2, [])
                    for codon, _ in options2:
                        if codon != codons[next_idx]:
                            codons[next_idx] = codon
                            if site not in "".join(codons):
                                break

    return codons


def _gc_content(seq: str) -> float:
    """Calculate GC content of a nucleotide sequence."""
    if not seq:
        return 0.0
    gc = sum(1 for c in seq.upper() if c in ("G", "C"))
    return gc / len(seq)


def _find_homopolymer(seq: str, max_run: int = 6) -> Optional[int]:
    """Find the position of a homopolymer run exceeding max_run length."""
    if not seq:
        return None

    run_start = 0
    run_len = 1

    for i in range(1, len(seq)):
        if seq[i] == seq[i - 1]:
            run_len += 1
            if run_len > max_run:
                return run_start
        else:
            run_start = i
            run_len = 1

    return None
