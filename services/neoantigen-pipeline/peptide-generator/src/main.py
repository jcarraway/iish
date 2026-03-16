"""Peptide Generator service entry point.

Downloads VEP-annotated VCF from S3, generates mutant/wildtype peptide windows
for MHC binding prediction, and uploads results.

Pipeline flow:
1. Download annotated_variants.vcf from S3
2. Parse VCF -> extract nonsynonymous coding variants
3. Generate sliding peptide windows (MHC-I: 8/9/10/11-mer, MHC-II: 15-mer)
4. Quality gates
5. Upload peptide_windows.json to S3
6. Publish PIPELINE.step.peptide_generation.complete
"""

import asyncio
import json
import logging
import sys
from pathlib import Path

from .pipeline_common import (
    PipelineConfig,
    S3Client,
    NatsClient,
    StepCompleteEvent,
    StepFailedEvent,
    ProgressEvent,
)
from .pipeline_common.paths import intermediate_path
from .vcf_parser import parse_vcf
from .peptide_generator import generate_peptides
from .quality import check_quality_gates, QualityGateError

STEP_NAME = "peptide_generation"
WORK_DIR = Path("/scratch")

logging.basicConfig(
    level=logging.INFO,
    format='{"level":"%(levelname)s","target":"%(name)s","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)


async def run() -> None:
    config = PipelineConfig.from_env()
    s3 = S3Client(config.s3_bucket)
    nats = NatsClient()
    await nats.connect(config.nats_url)

    try:
        input_dir = WORK_DIR / "input"
        output_dir = WORK_DIR / "output"
        input_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        # --- Download annotated VCF ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=5.0,
            message="Downloading annotated VCF",
        ))

        vcf_key = intermediate_path(config.job_id, "annotated_variants.vcf")
        vcf_local = input_dir / "annotated_variants.vcf"
        s3.download_file(vcf_key, vcf_local)

        # --- Parse VCF ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=20.0,
            message="Parsing variant annotations",
        ))

        variants = parse_vcf(vcf_local)
        logger.info("Found %d protein-altering variants", len(variants))

        # --- Generate peptides ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=50.0,
            message="Generating peptide windows",
        ))

        result = generate_peptides(variants)

        # --- Quality gates ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=75.0,
            message="Running quality checks",
        ))

        check_quality_gates(result)

        # --- Write and upload results ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=90.0,
            message="Uploading peptide windows",
        ))

        output_file = output_dir / "peptide_windows.json"
        output_file.write_text(result.to_json())

        peptide_s3_key = intermediate_path(config.job_id, "peptide_windows.json")
        s3.upload_file(output_file, peptide_s3_key)

        # --- Publish completion ---
        await nats.publish_step_complete(StepCompleteEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            output_path=peptide_s3_key,
            metadata={
                "peptideFilePath": peptide_s3_key,
                "totalVariants": result.total_variants,
                "variantsWithPeptides": result.variants_with_peptides,
                "mhcIPeptides": result.mhc_i_peptides,
                "mhcIIPeptides": result.mhc_ii_peptides,
                "totalPeptideWindows": len(result.peptide_windows),
            },
        ))

        logger.info("peptide_generation step finished")

    except QualityGateError as e:
        logger.error("Quality gate failed: %s", e)
        await nats.publish_step_failed(StepFailedEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            error=str(e),
            retryable=False,
        ))
        sys.exit(2)

    except Exception as e:
        logger.error("peptide_generation failed: %s", e, exc_info=True)
        await nats.publish_step_failed(StepFailedEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            error=str(e),
            retryable=True,
        ))
        sys.exit(1)

    finally:
        await nats.close()


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
