"""Event types matching pipeline-common/src/events.rs.

Uses camelCase JSON serialization to match the Rust/TypeScript convention.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class StepCompleteEvent:
    job_id: str
    step: str
    output_path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> dict:
        d: Dict[str, Any] = {"jobId": self.job_id, "step": self.step}
        if self.output_path is not None:
            d["outputPath"] = self.output_path
        if self.metadata is not None:
            d["metadata"] = self.metadata
        return d


@dataclass
class StepFailedEvent:
    job_id: str
    step: str
    error: str
    retryable: bool = True

    def to_dict(self) -> dict:
        return {
            "jobId": self.job_id,
            "step": self.step,
            "error": self.error,
            "retryable": self.retryable,
        }


@dataclass
class ProgressEvent:
    job_id: str
    step: str
    percent_complete: float
    message: str

    def to_dict(self) -> dict:
        return {
            "jobId": self.job_id,
            "step": self.step,
            "percentComplete": self.percent_complete,
            "message": self.message,
        }
