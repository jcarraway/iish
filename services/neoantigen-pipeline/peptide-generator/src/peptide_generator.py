"""Core peptide generation: sliding window generation of mutant and wildtype peptides.

For each protein-altering variant, generates all possible peptide windows
of specified lengths that contain the mutation site. These feed into
MHC binding prediction in the next pipeline step.

MHC-I: 8, 9, 10, 11-mer peptides
MHC-II: 15-mer peptides
"""

import json
import logging
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, Optional

from .vcf_parser import ProteinVariant

logger = logging.getLogger(__name__)

# Standard peptide lengths
MHC_I_LENGTHS = [8, 9, 10, 11]
MHC_II_LENGTHS = [15]

# Standard amino acid alphabet
AMINO_ACIDS = set("ACDEFGHIKLMNPQRSTVWY")


@dataclass
class PeptideWindow:
    """A peptide window containing a mutation."""

    gene: str
    mutation: str  # e.g. "KRAS G12D"
    chromosome: str
    position: int
    variant_type: str
    vaf: float
    mutant_peptide: str
    wildtype_peptide: str
    peptide_length: int
    mutation_position_in_peptide: int  # 0-based position of mutation within peptide
    mhc_class: str  # "I" or "II"
    transcript_id: str


@dataclass
class PeptideGenerationResult:
    """Result of peptide generation for all variants."""

    peptide_windows: list[PeptideWindow]
    total_variants: int
    variants_with_peptides: int
    mhc_i_peptides: int
    mhc_ii_peptides: int

    def to_json(self) -> str:
        return json.dumps(
            {
                "peptideWindows": [_window_to_dict(w) for w in self.peptide_windows],
                "totalVariants": self.total_variants,
                "variantsWithPeptides": self.variants_with_peptides,
                "mhcIPeptides": self.mhc_i_peptides,
                "mhcIIPeptides": self.mhc_ii_peptides,
            },
            indent=2,
        )


def generate_peptides(
    variants: list[ProteinVariant],
    protein_sequences: Optional[Dict[str, str]] = None,
) -> PeptideGenerationResult:
    """Generate all peptide windows for a list of protein-altering variants.

    Args:
        variants: Parsed protein variants from VCF.
        protein_sequences: Optional dict of transcript_id -> protein sequence.
            If not provided, uses the variant's own protein_sequence field or
            generates a synthetic context window.
    """
    all_windows: list[PeptideWindow] = []
    variants_with_peptides = 0

    for variant in variants:
        protein_seq = None
        if protein_sequences and variant.transcript_id in protein_sequences:
            protein_seq = protein_sequences[variant.transcript_id]
        elif variant.protein_sequence:
            protein_seq = variant.protein_sequence

        windows = _generate_windows_for_variant(variant, protein_seq)
        if windows:
            variants_with_peptides += 1
            all_windows.extend(windows)

    mhc_i = sum(1 for w in all_windows if w.mhc_class == "I")
    mhc_ii = sum(1 for w in all_windows if w.mhc_class == "II")

    logger.info(
        "Generated %d peptide windows (%d MHC-I, %d MHC-II) from %d/%d variants",
        len(all_windows),
        mhc_i,
        mhc_ii,
        variants_with_peptides,
        len(variants),
    )

    return PeptideGenerationResult(
        peptide_windows=all_windows,
        total_variants=len(variants),
        variants_with_peptides=variants_with_peptides,
        mhc_i_peptides=mhc_i,
        mhc_ii_peptides=mhc_ii,
    )


def _generate_windows_for_variant(
    variant: ProteinVariant, protein_seq: Optional[str]
) -> list[PeptideWindow]:
    """Generate peptide windows for a single variant."""
    if variant.consequence == "missense_variant":
        return _generate_missense_windows(variant, protein_seq)
    elif variant.consequence == "frameshift_variant":
        return _generate_frameshift_windows(variant, protein_seq)
    elif variant.consequence in ("inframe_insertion", "inframe_deletion"):
        return _generate_indel_windows(variant, protein_seq)
    elif variant.consequence == "stop_gained":
        return _generate_missense_windows(variant, protein_seq)
    else:
        return []


def _generate_missense_windows(
    variant: ProteinVariant, protein_seq: Optional[str]
) -> list[PeptideWindow]:
    """Generate sliding windows for a missense (single AA substitution) variant."""
    windows: list[PeptideWindow] = []
    mutation_label = f"{variant.gene} {variant.wildtype_aa}{variant.protein_position}{variant.mutant_aa}"

    # protein_position is 1-based
    mut_idx = variant.protein_position - 1  # 0-based

    if protein_seq:
        wt_seq = protein_seq
        if mut_idx >= len(wt_seq):
            logger.warning("Mutation position %d beyond protein length %d for %s",
                         variant.protein_position, len(wt_seq), mutation_label)
            return []

        # Build mutant sequence
        mut_seq = wt_seq[:mut_idx] + variant.mutant_aa + wt_seq[mut_idx + len(variant.wildtype_aa):]
    else:
        # No full protein: generate synthetic context (25 AA flanking each side)
        wt_seq, mut_seq, mut_idx = _synthetic_context(variant, context_size=25)

    # Generate windows for all MHC-I lengths
    for length in MHC_I_LENGTHS:
        for w in _sliding_windows(wt_seq, mut_seq, mut_idx, length, variant, mutation_label, "I"):
            windows.append(w)

    # Generate windows for MHC-II
    for length in MHC_II_LENGTHS:
        for w in _sliding_windows(wt_seq, mut_seq, mut_idx, length, variant, mutation_label, "II"):
            windows.append(w)

    return windows


def _generate_frameshift_windows(
    variant: ProteinVariant, protein_seq: Optional[str]
) -> list[PeptideWindow]:
    """Generate peptide windows for frameshift variants.

    Frameshifts produce a novel protein sequence from the mutation point onward.
    We generate windows from the mutation site through the new stop codon.
    """
    windows: list[PeptideWindow] = []
    mutation_label = f"{variant.gene} {variant.protein_change or 'frameshift'}"
    mut_idx = variant.protein_position - 1

    if not protein_seq or mut_idx >= len(protein_seq):
        # Without the full sequence we can't generate frameshift peptides
        return []

    wt_seq = protein_seq
    # For frameshift, we don't know the novel sequence without translation
    # Generate windows using the wildtype up to the mutation point
    # In production, the novel sequence would come from VEP or re-translation
    # For now, generate only the windows around the junction
    junction_length = min(30, len(wt_seq) - mut_idx)

    for length in MHC_I_LENGTHS:
        start_min = max(0, mut_idx - length + 1)
        start_max = min(mut_idx + 1, len(wt_seq) - length + 1)
        for start in range(start_min, start_max):
            end = start + length
            if end > len(wt_seq):
                break
            wt_peptide = wt_seq[start:end]
            if not _is_valid_peptide(wt_peptide):
                continue
            windows.append(PeptideWindow(
                gene=variant.gene,
                mutation=mutation_label,
                chromosome=variant.chromosome,
                position=variant.position,
                variant_type="frameshift",
                vaf=variant.vaf,
                mutant_peptide=wt_peptide,  # placeholder — needs novel seq
                wildtype_peptide=wt_peptide,
                peptide_length=length,
                mutation_position_in_peptide=mut_idx - start,
                mhc_class="I",
                transcript_id=variant.transcript_id,
            ))

    return windows


def _generate_indel_windows(
    variant: ProteinVariant, protein_seq: Optional[str]
) -> list[PeptideWindow]:
    """Generate peptide windows for in-frame insertions/deletions."""
    # Treat similarly to missense but with potentially different length mutant
    return _generate_missense_windows(variant, protein_seq)


def _sliding_windows(
    wt_seq: str,
    mut_seq: str,
    mut_idx: int,
    length: int,
    variant: ProteinVariant,
    mutation_label: str,
    mhc_class: str,
) -> list[PeptideWindow]:
    """Generate all sliding windows of given length containing the mutation position."""
    windows: list[PeptideWindow] = []

    # Window start ranges: the mutation at mut_idx must be within [start, start+length)
    start_min = max(0, mut_idx - length + 1)
    start_max = min(mut_idx + 1, len(mut_seq) - length + 1)

    for start in range(start_min, start_max):
        end = start + length
        if end > len(mut_seq) or end > len(wt_seq):
            break

        mut_peptide = mut_seq[start:end]
        wt_peptide = wt_seq[start:end]

        # Skip if peptides are identical (no actual change in this window)
        if mut_peptide == wt_peptide:
            continue

        if not _is_valid_peptide(mut_peptide):
            continue

        windows.append(PeptideWindow(
            gene=variant.gene,
            mutation=mutation_label,
            chromosome=variant.chromosome,
            position=variant.position,
            variant_type=variant.consequence,
            vaf=variant.vaf,
            mutant_peptide=mut_peptide,
            wildtype_peptide=wt_peptide,
            peptide_length=length,
            mutation_position_in_peptide=mut_idx - start,
            mhc_class=mhc_class,
            transcript_id=variant.transcript_id,
        ))

    return windows


def _synthetic_context(
    variant: ProteinVariant, context_size: int = 25
) -> tuple[str, str, int]:
    """Create synthetic wildtype/mutant context when full protein is unavailable.

    Returns (wt_sequence, mut_sequence, mutation_index_in_sequence).
    """
    # Create a padding of 'X' (unknown AA) around the mutation
    wt_aa = variant.wildtype_aa if variant.wildtype_aa else "X"
    mut_aa = variant.mutant_aa if variant.mutant_aa else "X"

    prefix = "X" * context_size
    suffix = "X" * context_size

    wt_seq = prefix + wt_aa + suffix
    mut_seq = prefix + mut_aa + suffix
    mut_idx = context_size

    return wt_seq, mut_seq, mut_idx


def _is_valid_peptide(peptide: str) -> bool:
    """Check if a peptide contains only standard amino acids (no X, *, etc)."""
    return all(aa in AMINO_ACIDS for aa in peptide)


def _window_to_dict(window: PeptideWindow) -> dict:
    """Convert a PeptideWindow to a camelCase dict for JSON serialization."""
    return {
        "gene": window.gene,
        "mutation": window.mutation,
        "chromosome": window.chromosome,
        "position": window.position,
        "variantType": window.variant_type,
        "vaf": window.vaf,
        "mutantPeptide": window.mutant_peptide,
        "wildtypePeptide": window.wildtype_peptide,
        "peptideLength": window.peptide_length,
        "mutationPositionInPeptide": window.mutation_position_in_peptide,
        "mhcClass": window.mhc_class,
        "transcriptId": window.transcript_id,
    }
