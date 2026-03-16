"""Parse VEP-annotated VCF files to extract protein-altering variants.

Extracts missense, frameshift, indels, and stop-gained variants with their
protein context for downstream peptide generation.
"""

import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Union

logger = logging.getLogger(__name__)

# VEP consequence types that alter the protein
PROTEIN_ALTERING_CONSEQUENCES = {
    "missense_variant",
    "frameshift_variant",
    "inframe_insertion",
    "inframe_deletion",
    "stop_gained",
    "start_lost",
    "protein_altering_variant",
}

# Pseudogene biotypes to filter out
PSEUDOGENE_BIOTYPES = {
    "pseudogene",
    "processed_pseudogene",
    "unprocessed_pseudogene",
    "transcribed_pseudogene",
    "translated_processed_pseudogene",
    "polymorphic_pseudogene",
}


@dataclass
class ProteinVariant:
    """A protein-altering somatic variant extracted from VCF."""

    gene: str
    chromosome: str
    position: int
    ref_allele: str
    alt_allele: str
    consequence: str
    protein_change: str  # e.g. "p.Gly12Asp"
    protein_position: int  # 1-based position in protein
    wildtype_aa: str  # wildtype amino acid(s)
    mutant_aa: str  # mutant amino acid(s)
    transcript_id: str
    protein_sequence: Optional[str] = None  # full protein sequence if available
    vaf: float = 0.0
    biotype: str = "protein_coding"


def parse_vcf(vcf_path: Union[str, Path]) -> list[ProteinVariant]:
    """Parse a VEP-annotated VCF and extract protein-altering variants."""
    vcf_path = Path(vcf_path)
    variants: list[ProteinVariant] = []
    csq_fields: list[str] = []

    with open(vcf_path) as f:
        for line in f:
            line = line.strip()

            # Parse VEP CSQ header to get field names
            if line.startswith("##INFO=<ID=CSQ"):
                csq_fields = _parse_csq_header(line)
                continue

            if line.startswith("#"):
                continue

            if not csq_fields:
                logger.warning("No CSQ header found — cannot parse VEP annotations")
                break

            variant = _parse_variant_line(line, csq_fields)
            if variant:
                variants.append(variant)

    logger.info("Parsed %d protein-altering variants from %s", len(variants), vcf_path)
    return variants


def _parse_csq_header(header_line: str) -> list[str]:
    """Extract CSQ field names from the VEP header line."""
    # Format: ##INFO=<ID=CSQ,...,Description="Consequence annotations from Ensembl VEP. Format: Allele|Consequence|...">
    match = re.search(r'Format:\s*([^"]+)', header_line)
    if not match:
        return []
    return match.group(1).strip().split("|")


def _parse_variant_line(
    line: str, csq_fields: list[str]
) -> Optional[ProteinVariant]:
    """Parse a single VCF data line and extract protein-altering variant info."""
    fields = line.split("\t")
    if len(fields) < 8:
        return None

    chrom = fields[0]
    pos = int(fields[1])
    ref = fields[3]
    alt = fields[4].split(",")[0]  # Take first alt allele
    info = fields[7]

    # Extract VAF from sample fields if present (FORMAT/AD or FORMAT/AF)
    vaf = _extract_vaf(fields)

    # Filter low VAF variants
    if vaf < 0.05:
        return None

    # Parse CSQ annotations
    csq_match = re.search(r"CSQ=([^;\t]+)", info)
    if not csq_match:
        return None

    # CSQ can have multiple transcript annotations separated by ","
    best_annotation = None
    for annotation_str in csq_match.group(1).split(","):
        annotation = dict(zip(csq_fields, annotation_str.split("|")))

        consequence = annotation.get("Consequence", "")
        consequences = set(consequence.split("&"))

        # Check if any consequence is protein-altering
        if not consequences & PROTEIN_ALTERING_CONSEQUENCES:
            continue

        # Filter pseudogenes
        biotype = annotation.get("BIOTYPE", "")
        if biotype in PSEUDOGENE_BIOTYPES:
            continue

        # Must have protein change info
        protein_change = annotation.get("HGVSp", "")
        if not protein_change:
            protein_change = annotation.get("Amino_acids", "")

        protein_pos_str = annotation.get("Protein_position", "")
        if not protein_pos_str or protein_pos_str == "-":
            continue

        # Prefer CANONICAL transcript
        if annotation.get("CANONICAL") == "YES" or best_annotation is None:
            best_annotation = annotation

    if best_annotation is None:
        return None

    # Extract protein change details
    consequence = best_annotation.get("Consequence", "")
    protein_change = best_annotation.get("HGVSp", "")
    amino_acids = best_annotation.get("Amino_acids", "")
    protein_pos_raw = best_annotation.get("Protein_position", "")
    gene = best_annotation.get("SYMBOL", "")
    transcript_id = best_annotation.get("Feature", "")
    biotype = best_annotation.get("BIOTYPE", "protein_coding")

    # Parse protein position (can be "12" or "12-15" for indels)
    protein_position = _parse_protein_position(protein_pos_raw)
    if protein_position is None:
        return None

    # Parse wildtype/mutant amino acids
    wt_aa, mut_aa = _parse_amino_acids(amino_acids, consequence)

    # Pick the primary consequence
    primary_consequence = ""
    for c in consequence.split("&"):
        if c in PROTEIN_ALTERING_CONSEQUENCES:
            primary_consequence = c
            break

    if not primary_consequence:
        return None

    return ProteinVariant(
        gene=gene,
        chromosome=chrom,
        position=pos,
        ref_allele=ref,
        alt_allele=alt,
        consequence=primary_consequence,
        protein_change=protein_change,
        protein_position=protein_position,
        wildtype_aa=wt_aa,
        mutant_aa=mut_aa,
        transcript_id=transcript_id,
        vaf=vaf,
        biotype=biotype,
    )


def _extract_vaf(fields: list[str]) -> float:
    """Extract variant allele frequency from VCF sample fields."""
    if len(fields) < 10:
        return 0.0

    format_field = fields[8]
    sample_field = fields[9]  # Tumor sample (first)

    format_keys = format_field.split(":")
    sample_values = sample_field.split(":")

    # Try AF field first
    if "AF" in format_keys:
        idx = format_keys.index("AF")
        if idx < len(sample_values):
            try:
                return float(sample_values[idx])
            except ValueError:
                pass

    # Fall back to AD (allele depth) calculation
    if "AD" in format_keys:
        idx = format_keys.index("AD")
        if idx < len(sample_values):
            try:
                depths = [int(x) for x in sample_values[idx].split(",")]
                total = sum(depths)
                if total > 0 and len(depths) >= 2:
                    return depths[1] / total
            except (ValueError, ZeroDivisionError):
                pass

    return 0.0


def _parse_protein_position(pos_str: str) -> Optional[int]:
    """Parse protein position string like '12' or '12-15'."""
    if not pos_str or pos_str == "-":
        return None
    try:
        # Take the start position for ranges
        return int(pos_str.split("-")[0].split("/")[0])
    except (ValueError, IndexError):
        return None


def _parse_amino_acids(amino_acids: str, consequence: str) -> tuple[str, str]:
    """Parse wildtype/mutant amino acids from VEP Amino_acids field.

    Format is "G/D" for missense, "G/-" for stop gained, etc.
    """
    if not amino_acids:
        return ("X", "X")

    parts = amino_acids.split("/")
    wt = parts[0] if parts else "X"
    mut = parts[1] if len(parts) > 1 else "X"

    # For frameshift, mutant is often "-" — represent as "*" (stop)
    if "frameshift" in consequence and mut in ("-", ""):
        mut = "*"
    if mut == "-":
        mut = ""  # deletion
    if wt == "-":
        wt = ""  # insertion

    return (wt, mut)
