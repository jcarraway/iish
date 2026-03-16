"""Structure prediction output report builder.

Builds structure_report.json with updated structural_exposure values
for each candidate neoantigen.
"""

import json
import logging
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class StructureResult:
    gene: str
    mutation: str
    mutant_peptide: str
    hla_allele: str
    structural_exposure: Optional[float]
    pdb_path: Optional[str]
    method: Optional[str]  # "template" or "alphafold" or None


def build_structure_report(
    job_id: str,
    results: List[StructureResult],
    neoantigens: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Build the structure_report.json output.

    Merges structural_exposure values from structure prediction back into
    the neoantigen list.
    """
    # Build lookup by (gene, mutation, mutant_peptide) for quick patching
    exposure_lookup: Dict[tuple, StructureResult] = {}
    for r in results:
        key = (r.gene, r.mutation, r.mutant_peptide)
        exposure_lookup[key] = r

    # Patch structural_exposure into neoantigen records
    updated_neoantigens = []
    patched_count = 0

    for neo in neoantigens:
        updated = dict(neo)
        key = (neo.get("gene"), neo.get("mutation"), neo.get("mutantPeptide"))

        if key in exposure_lookup:
            result = exposure_lookup[key]
            if result.structural_exposure is not None:
                updated["structuralExposure"] = result.structural_exposure
                updated["structurePdbPath"] = result.pdb_path
                patched_count += 1

        updated_neoantigens.append(updated)

    structures = []
    for r in results:
        structures.append({
            "gene": r.gene,
            "mutation": r.mutation,
            "mutantPeptide": r.mutant_peptide,
            "hlaAllele": r.hla_allele,
            "structuralExposure": r.structural_exposure,
            "pdbPath": r.pdb_path,
            "method": r.method,
        })

    report = {
        "jobId": job_id,
        "totalStructures": len(results),
        "successfulPredictions": sum(1 for r in results if r.structural_exposure is not None),
        "failedPredictions": sum(1 for r in results if r.structural_exposure is None),
        "patchedNeoantigens": patched_count,
        "structures": structures,
        "neoantigens": updated_neoantigens,
    }

    logger.info(
        "Structure report: %d total, %d successful, %d failed, %d patched",
        len(results),
        report["successfulPredictions"],
        report["failedPredictions"],
        patched_count,
    )

    return report
