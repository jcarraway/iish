"""mRNA sequence quality checks.

Validates:
- GC content (50-60%)
- No internal stop codons
- No homopolymer runs >6nt
- Correct back-translation (ORF encodes intended protein)
- Reasonable total length
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Codon to amino acid translation table (standard genetic code)
CODON_TO_AA: Dict[str, str] = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
    "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
    "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
    "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
    "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
    "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
    "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
    "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
    "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
    "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
    "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
}

STOP_CODONS = {"TAA", "TAG", "TGA"}


def translate(orf: str) -> str:
    """Translate a nucleotide ORF to protein sequence."""
    protein = []
    for i in range(0, len(orf) - 2, 3):
        codon = orf[i:i + 3].upper()
        aa = CODON_TO_AA.get(codon, "X")
        protein.append(aa)
    return "".join(protein)


def run_quality_checks(
    full_mrna: str,
    orf: str,
    expected_protein: str,
) -> Dict[str, Any]:
    """Run all quality checks on the mRNA sequence.

    Returns a dict with check results and overall pass/fail status.
    """
    checks: List[Dict[str, Any]] = []

    # 1. GC content
    gc_result = _check_gc_content(orf)
    checks.append(gc_result)

    # 2. Internal stop codons
    stop_result = _check_internal_stops(orf)
    checks.append(stop_result)

    # 3. Homopolymer runs
    homo_result = _check_homopolymers(full_mrna)
    checks.append(homo_result)

    # 4. Back-translation
    bt_result = _check_back_translation(orf, expected_protein)
    checks.append(bt_result)

    # 5. Length sanity
    len_result = _check_length(full_mrna, expected_protein)
    checks.append(len_result)

    all_passed = all(c["passed"] for c in checks)

    result = {
        "passed": all_passed,
        "checks": checks,
        "summary": f"{'All' if all_passed else 'Some'} checks {'passed' if all_passed else 'failed'}",
    }

    logger.info(
        "Quality checks: %s (%d/%d passed)",
        "PASS" if all_passed else "FAIL",
        sum(1 for c in checks if c["passed"]),
        len(checks),
    )

    return result


def _check_gc_content(orf: str) -> Dict[str, Any]:
    """Check GC content is in 50-60% range."""
    if not orf:
        return {"name": "gc_content", "passed": False, "message": "Empty ORF"}

    gc_count = sum(1 for c in orf.upper() if c in ("G", "C"))
    gc_pct = gc_count / len(orf)

    passed = 0.50 <= gc_pct <= 0.60
    return {
        "name": "gc_content",
        "passed": passed,
        "value": round(gc_pct * 100, 1),
        "target": "50-60%",
        "message": f"GC content: {gc_pct * 100:.1f}% ({'OK' if passed else 'OUT OF RANGE'})",
    }


def _check_internal_stops(orf: str) -> Dict[str, Any]:
    """Check for internal stop codons (not counting the final one)."""
    internal_stops = []

    # Check all codons except the last one
    for i in range(0, len(orf) - 5, 3):  # Stop before last 2 codons
        codon = orf[i:i + 3].upper()
        if codon in STOP_CODONS:
            internal_stops.append({"position": i, "codon": codon})

    passed = len(internal_stops) == 0
    return {
        "name": "internal_stops",
        "passed": passed,
        "count": len(internal_stops),
        "positions": internal_stops[:5],  # Show max 5
        "message": f"Internal stop codons: {len(internal_stops)} ({'OK' if passed else 'FOUND'})",
    }


def _check_homopolymers(sequence: str, max_run: int = 6) -> Dict[str, Any]:
    """Check for homopolymer runs longer than max_run."""
    longest_run = 0
    longest_base = ""
    current_run = 1

    # Exclude poly(A) tail from check
    check_seq = sequence.rstrip("A")

    for i in range(1, len(check_seq)):
        if check_seq[i] == check_seq[i - 1]:
            current_run += 1
            if current_run > longest_run:
                longest_run = current_run
                longest_base = check_seq[i]
        else:
            current_run = 1

    passed = longest_run <= max_run
    return {
        "name": "homopolymers",
        "passed": passed,
        "longestRun": longest_run,
        "base": longest_base,
        "maxAllowed": max_run,
        "message": f"Longest homopolymer: {longest_run}{longest_base} ({'OK' if passed else 'TOO LONG'})",
    }


def _check_back_translation(orf: str, expected_protein: str) -> Dict[str, Any]:
    """Verify the ORF translates to the expected protein."""
    # Translate the ORF (starts with ATG from initial M, ends with stop codon)
    translated = translate(orf)

    # Remove trailing stop codon from translation
    if translated.endswith("*"):
        translated = translated[:-1]

    matches = translated == expected_protein
    mismatch_positions = []

    if not matches:
        for i, (t, e) in enumerate(zip(translated, expected_protein)):
            if t != e:
                mismatch_positions.append({"position": i, "got": t, "expected": e})
                if len(mismatch_positions) >= 5:
                    break

        if len(translated) != len(expected_protein):
            mismatch_positions.append({
                "note": f"Length mismatch: translated={len(translated)}, expected={len(expected_protein)}"
            })

    return {
        "name": "back_translation",
        "passed": matches,
        "translatedLength": len(translated),
        "expectedLength": len(expected_protein),
        "mismatches": mismatch_positions[:5],
        "message": f"Back-translation: {'MATCH' if matches else 'MISMATCH'}",
    }


def _check_length(full_mrna: str, expected_protein: str) -> Dict[str, Any]:
    """Sanity check on total mRNA length."""
    min_expected = len(expected_protein) * 3 + 100  # ORF + minimal UTRs
    max_expected = len(expected_protein) * 3 + 1000  # ORF + generous UTRs + polyA

    passed = min_expected <= len(full_mrna) <= max_expected
    return {
        "name": "length",
        "passed": passed,
        "totalLength": len(full_mrna),
        "expectedRange": f"{min_expected}-{max_expected}",
        "message": f"Total length: {len(full_mrna)} nt ({'OK' if passed else 'UNEXPECTED'})",
    }
