"""VaccineBlueprint output builder.

Assembles the final vaccine blueprint JSON document containing all
design components, quality checks, and metadata.
"""

import json
import logging
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class VaccineBlueprint:
    job_id: str
    created_at: str
    version: str = "1.0.0"

    # Epitope selection
    selected_epitopes: List[Dict[str, Any]] = field(default_factory=list)
    total_epitopes: int = 0

    # Construct design
    construct: Dict[str, Any] = field(default_factory=dict)

    # mRNA sequence
    mrna_sequence: str = ""
    mrna_length: int = 0
    mrna_components: Dict[str, Any] = field(default_factory=dict)

    # Quality
    quality_checks: Dict[str, Any] = field(default_factory=dict)

    # Formulation
    formulation_notes: Dict[str, Any] = field(default_factory=dict)

    # Rationale
    design_rationale: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dict with camelCase keys."""
        return {
            "jobId": self.job_id,
            "createdAt": self.created_at,
            "version": self.version,
            "selectedEpitopes": self.selected_epitopes,
            "totalEpitopes": self.total_epitopes,
            "construct": self.construct,
            "mrnaSequence": self.mrna_sequence,
            "mrnaLength": self.mrna_length,
            "mrnaComponents": self.mrna_components,
            "qualityChecks": self.quality_checks,
            "formulationNotes": self.formulation_notes,
            "designRationale": self.design_rationale,
        }


def build_vaccine_blueprint(
    job_id: str,
    epitopes: List[Dict[str, Any]],
    construct: Dict[str, Any],
    mrna_assembly: Dict[str, Any],
    quality_checks: Dict[str, Any],
    formulation_notes: Dict[str, Any],
    rationale: Optional[str],
) -> VaccineBlueprint:
    """Assemble the complete VaccineBlueprint."""
    blueprint = VaccineBlueprint(
        job_id=job_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        selected_epitopes=epitopes,
        total_epitopes=len(epitopes),
        construct=construct,
        mrna_sequence=mrna_assembly.get("fullSequence", ""),
        mrna_length=mrna_assembly.get("totalLength", 0),
        mrna_components=mrna_assembly.get("components", {}),
        quality_checks=quality_checks,
        formulation_notes=formulation_notes,
        design_rationale=rationale,
    )

    logger.info(
        "Built VaccineBlueprint: %d epitopes, %d nt mRNA, quality %s",
        blueprint.total_epitopes,
        blueprint.mrna_length,
        "PASS" if quality_checks.get("passed") else "FAIL",
    )

    return blueprint
