"""AI-powered design rationale generation using Claude.

Generates a human-readable rationale explaining the vaccine design choices,
including epitope selection reasoning, construct architecture, and
clinical considerations.
"""

import logging
import os
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


async def generate_rationale(
    epitopes: List[Dict[str, Any]],
    construct: Dict[str, Any],
    quality_checks: Dict[str, Any],
) -> Optional[str]:
    """Generate a design rationale using Claude.

    Returns a markdown-formatted rationale string, or a fallback
    template if the API is unavailable.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY not set; using fallback rationale")
        return _fallback_rationale(epitopes, construct, quality_checks)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        epitope_summary = "\n".join(
            f"- {e.get('gene', '?')} {e.get('mutation', '?')} "
            f"(peptide: {e.get('mutantPeptide', '?')}, "
            f"HLA: {e.get('hlaAllele', '?')}, "
            f"score: {e.get('compositeScore', 0):.3f})"
            for e in epitopes[:20]
        )

        prompt = f"""You are a computational vaccinologist reviewing a personalized cancer vaccine design.
Write a concise scientific rationale (3-5 paragraphs) for this mRNA vaccine construct.

## Selected Neoantigens ({len(epitopes)} total)
{epitope_summary}

## Construct Design
- Signal peptide: {construct.get('signalPeptide', 'N/A')}
- Total epitopes: {construct.get('totalEpitopes', 0)}
- Linker: {construct.get('linker', 'N/A')}
- PADRE universal epitope included: Yes
- Total protein length: {construct.get('proteinLength', 0)} aa

## Quality Checks
- All passed: {quality_checks.get('passed', False)}
- GC content: {_get_check_value(quality_checks, 'gc_content')}

Write the rationale covering:
1. Epitope selection strategy and diversity of HLA coverage
2. Construct architecture and design choices (signal peptide, linkers, PADRE)
3. Key quality attributes of the mRNA sequence
4. Clinical considerations and limitations

Keep it factual, cite relevant biological mechanisms, and note limitations."""

        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )

        rationale = message.content[0].text
        logger.info("Generated AI rationale (%d chars)", len(rationale))
        return rationale

    except Exception as e:
        logger.warning("Claude API call failed: %s; using fallback rationale", e)
        return _fallback_rationale(epitopes, construct, quality_checks)


def _get_check_value(quality_checks: Dict[str, Any], check_name: str) -> str:
    """Extract a check value from quality check results."""
    for check in quality_checks.get("checks", []):
        if check.get("name") == check_name:
            return str(check.get("value", "N/A"))
    return "N/A"


def _fallback_rationale(
    epitopes: List[Dict[str, Any]],
    construct: Dict[str, Any],
    quality_checks: Dict[str, Any],
) -> str:
    """Generate a template-based rationale when Claude is unavailable."""
    n_epitopes = len(epitopes)
    hla_alleles = set(e.get("hlaAllele", "") for e in epitopes if e.get("hlaAllele"))
    genes = set(e.get("gene", "") for e in epitopes if e.get("gene"))
    avg_score = sum(e.get("compositeScore", 0) for e in epitopes) / max(n_epitopes, 1)

    return f"""## Vaccine Design Rationale

### Epitope Selection
This personalized cancer vaccine construct incorporates {n_epitopes} tumor-specific \
neoantigens selected from computational analysis. The selected epitopes span \
{len(genes)} unique genes and are predicted to bind {len(hla_alleles)} distinct \
HLA alleles, providing broad immune coverage. The mean composite neoantigen score \
is {avg_score:.3f}, reflecting strong predicted immunogenicity and MHC binding.

### Construct Architecture
The polyepitope construct uses a tPA signal peptide ({construct.get('signalPeptide', 'MFVFLVLLPLVSSQ')}) \
to direct the nascent protein into the endoplasmic reticulum for efficient MHC class I \
presentation. Epitopes are separated by EAAAK rigid alpha-helical linkers to minimize \
junctional epitope formation. The PADRE universal T-helper epitope (AKFVAAWTLKAAA) is \
included at the C-terminus to enhance CD4+ T-cell help and promote robust immune responses.

### mRNA Design Quality
The codon-optimized mRNA sequence was designed for human expression with optimized GC \
content, avoidance of homopolymer runs, and elimination of cryptic splice sites and \
restriction enzyme recognition sequences. The 5' UTR incorporates an alpha-globin \
sequence with a strong Kozak consensus, while the doubled beta-globin 3' UTR enhances \
mRNA stability. A 120-nucleotide poly(A) tail supports efficient translation.

### Limitations
This is a computationally designed research construct. Clinical use requires: (1) GMP \
manufacturing with appropriate quality controls, (2) preclinical immunogenicity and safety \
testing, (3) regulatory approval for clinical trials, and (4) validation of neoantigen \
predictions through experimental binding assays and T-cell reactivity testing. Structural \
exposure predictions are approximate and should be validated experimentally."""
