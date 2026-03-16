"""Pipeline configuration parsed from environment variables.

Mirrors the Rust PipelineConfig in pipeline-common/src/config.rs.
"""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class PipelineConfig:
    job_id: str
    step: str
    nats_url: str
    s3_bucket: str
    tumor_data_path: str
    normal_data_path: str
    input_format: str
    reference_genome: str
    rna_data_path: Optional[str] = None

    @classmethod
    def from_env(cls) -> "PipelineConfig":
        """Parse configuration from environment variables."""

        def require(key: str) -> str:
            val = os.environ.get(key)
            if not val:
                raise ValueError(f"Missing required environment variable: {key}")
            return val

        return cls(
            job_id=require("PIPELINE_JOB_ID"),
            step=require("PIPELINE_STEP"),
            nats_url=os.environ.get("NATS_URL", "nats://localhost:4222"),
            s3_bucket=require("AWS_S3_PIPELINE_BUCKET"),
            tumor_data_path=require("TUMOR_DATA_PATH"),
            normal_data_path=require("NORMAL_DATA_PATH"),
            input_format=require("INPUT_FORMAT"),
            reference_genome=require("REFERENCE_GENOME"),
            rna_data_path=os.environ.get("RNA_DATA_PATH"),
        )
