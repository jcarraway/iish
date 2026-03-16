"""mRNA Vaccine Designer service entry point.

Orchestrates the full vaccine design pipeline:
1. Select top epitopes from ranked neoantigens
2. Design polyepitope protein construct
3. Codon-optimize for human expression
4. Add UTRs and assemble full mRNA
5. Run quality checks
6. Generate LNP formulation notes
7. Generate AI-powered design rationale
8. Output VaccineBlueprint JSON

Pipeline flow:
1. Download ranked_neoantigens.json from S3
2. Select epitopes -> design construct -> optimize -> assemble -> validate
3. Upload vaccine_blueprint.json to S3
4. Publish PIPELINE.step.mrna_design.complete
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict

from .pipeline_common import (
    PipelineConfig,
    S3Client,
    NatsClient,
    StepCompleteEvent,
    StepFailedEvent,
    ProgressEvent,
)
from .pipeline_common.paths import results_path
from .epitope_selector import select_epitopes
from .construct_designer import design_construct
from .codon_optimizer import optimize_codons
from .mrna_assembler import assemble_mrna
from .sequence_checks import run_quality_checks
from .formulation import generate_formulation_notes
from .rationale import generate_rationale
from .output import build_vaccine_blueprint

STEP_NAME = "mrna_design"
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

        # --- Download inputs ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=5.0,
            message="Downloading ranked neoantigens",
        ))

        ranked_key = results_path(config.job_id, "ranked_neoantigens.json")
        ranked_local = input_dir / "ranked_neoantigens.json"
        s3.download_file(ranked_key, ranked_local)

        with open(ranked_local) as f:
            ranked_data = json.load(f)

        neoantigens = ranked_data.get("neoantigens", [])
        logger.info("Loaded %d ranked neoantigens", len(neoantigens))

        # --- Step 1: Select epitopes ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=10.0,
            message="Selecting epitopes for vaccine construct",
        ))

        epitopes = select_epitopes(neoantigens)
        logger.info("Selected %d epitopes", len(epitopes))

        # --- Step 2: Design construct ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=20.0,
            message="Designing polyepitope construct",
        ))

        construct = design_construct(epitopes)

        # --- Step 3: Codon optimize ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=35.0,
            message="Optimizing codons for human expression",
        ))

        protein_sequence = construct["proteinSequence"]
        optimized_orf = optimize_codons(protein_sequence, seed=42)

        # --- Step 4: Assemble mRNA ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=50.0,
            message="Assembling full mRNA sequence",
        ))

        mrna_assembly = assemble_mrna(optimized_orf)

        # --- Step 5: Quality checks ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=60.0,
            message="Running sequence quality checks",
        ))

        # ORF already starts with ATG (from initial M); add stop codon
        full_orf = optimized_orf + "TGA"
        quality_checks = run_quality_checks(
            full_mrna=mrna_assembly["fullSequence"],
            orf=full_orf,
            expected_protein=protein_sequence,
        )

        if not quality_checks["passed"]:
            logger.warning("Some quality checks failed: %s", quality_checks["summary"])

        # --- Step 6: Formulation notes ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=70.0,
            message="Generating formulation guidance",
        ))

        formulation_notes = generate_formulation_notes(mrna_assembly["totalLength"])

        # --- Step 7: Design rationale ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=80.0,
            message="Generating design rationale",
        ))

        rationale = await generate_rationale(epitopes, construct, quality_checks)

        # --- Step 8: Build blueprint ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=90.0,
            message="Assembling vaccine blueprint",
        ))

        blueprint = build_vaccine_blueprint(
            job_id=config.job_id,
            epitopes=epitopes,
            construct=construct,
            mrna_assembly=mrna_assembly,
            quality_checks=quality_checks,
            formulation_notes=formulation_notes,
            rationale=rationale,
        )

        # Write and upload
        blueprint_dict = blueprint.to_dict()
        blueprint_file = output_dir / "vaccine_blueprint.json"
        blueprint_file.write_text(json.dumps(blueprint_dict, indent=2))

        blueprint_s3_key = results_path(config.job_id, "vaccine_blueprint.json")
        s3.upload_file(blueprint_file, blueprint_s3_key)

        # --- Publish completion ---
        # Build a summary for the metadata (omit full mRNA sequence for size)
        blueprint_summary = dict(blueprint_dict)
        blueprint_summary.pop("mrnaSequence", None)  # Too large for NATS metadata
        blueprint_summary.pop("formulationNotes", None)
        blueprint_summary.pop("designRationale", None)

        await nats.publish_step_complete(StepCompleteEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            output_path=blueprint_s3_key,
            metadata={
                "vaccineBlueprintPath": blueprint_s3_key,
                "vaccineBlueprint": blueprint_summary,
                "totalEpitopes": blueprint.total_epitopes,
                "mrnaLength": blueprint.mrna_length,
                "qualityPassed": quality_checks["passed"],
            },
        ))

        logger.info("mrna_design step finished")

    except Exception as e:
        logger.error("mrna_design failed: %s", e, exc_info=True)
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
