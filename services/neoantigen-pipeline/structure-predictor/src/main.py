"""Structure Predictor service entry point.

Downloads neoantigen_report.json and hla_genotype.json from S3, selects the top 20
candidates, runs template-based structure prediction (with AlphaFold fallback),
calculates SASA for solvent exposure, and uploads PDB files + structure_report.json.

Pipeline flow:
1. Download neoantigen_report.json and hla_genotype.json from S3
2. Select top 20 candidates by composite score
3. For each candidate: find template PDB -> thread peptide -> calculate SASA
4. Fallback to AlphaFold API for alleles without templates
5. Upload PDB files and structure_report.json to S3
6. Publish PIPELINE.step.structure_prediction.complete
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from .pipeline_common import (
    PipelineConfig,
    S3Client,
    NatsClient,
    StepCompleteEvent,
    StepFailedEvent,
    ProgressEvent,
)
from .pipeline_common.paths import intermediate_path, results_path
from .mhc_templates import get_template_pdb_id, download_template_pdb
from .mhc_complex import thread_peptide
from .alphafold_client import predict_structure
from .accessibility import calculate_sasa
from .output import StructureResult, build_structure_report

STEP_NAME = "structure_prediction"
WORK_DIR = Path("/scratch")
MAX_CANDIDATES = 20

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
        templates_dir = WORK_DIR / "templates"
        structures_dir = output_dir / "structures"
        input_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)
        templates_dir.mkdir(parents=True, exist_ok=True)
        structures_dir.mkdir(parents=True, exist_ok=True)

        # --- Download inputs ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=5.0,
            message="Downloading neoantigen report and HLA genotype",
        ))

        report_key = results_path(config.job_id, "neoantigen_report.json")
        report_local = input_dir / "neoantigen_report.json"
        s3.download_file(report_key, report_local)

        hla_key = intermediate_path(config.job_id, "hla_genotype.json")
        hla_local = input_dir / "hla_genotype.json"
        s3.download_file(hla_key, hla_local)

        # --- Parse inputs ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=10.0,
            message="Parsing neoantigen report",
        ))

        with open(report_local) as f:
            report_data = json.load(f)

        neoantigens = report_data.get("neoantigens", [])
        logger.info("Loaded %d neoantigens from report", len(neoantigens))

        # Select top N candidates by composite score
        top_candidates = sorted(
            neoantigens,
            key=lambda n: n.get("compositeScore", 0),
            reverse=True,
        )[:MAX_CANDIDATES]

        logger.info("Selected top %d candidates for structure prediction", len(top_candidates))

        # --- Run structure predictions ---
        results: List[StructureResult] = []
        total = len(top_candidates)

        for i, candidate in enumerate(top_candidates):
            gene = candidate.get("gene", "unknown")
            mutation = candidate.get("mutation", "unknown")
            peptide = candidate.get("mutantPeptide", "")
            hla_allele = candidate.get("hlaAllele", "")

            progress = 15.0 + (70.0 * i / max(total, 1))
            await nats.publish_progress(ProgressEvent(
                job_id=config.job_id,
                step=STEP_NAME,
                percent_complete=progress,
                message=f"Predicting structure {i + 1}/{total}: {gene} {mutation}",
            ))

            safe_name = f"{gene}_{mutation}".replace("/", "_").replace(" ", "_")
            pdb_output = structures_dir / f"{safe_name}.pdb"
            structural_exposure = None
            method = None
            pdb_s3_path = None

            # Try template-based prediction first
            template_info = get_template_pdb_id(hla_allele)
            if template_info:
                pdb_id, chain_id = template_info
                try:
                    template_path = download_template_pdb(pdb_id, templates_dir)
                    threaded_pdb = thread_peptide(template_path, peptide, pdb_output)

                    if threaded_pdb:
                        structural_exposure = calculate_sasa(threaded_pdb, peptide)
                        method = "template"
                        logger.info(
                            "Template prediction for %s %s: exposure=%.3f",
                            gene, mutation,
                            structural_exposure if structural_exposure is not None else -1,
                        )
                except Exception as e:
                    logger.warning(
                        "Template prediction failed for %s %s: %s", gene, mutation, e
                    )

            # Fallback to AlphaFold if template failed
            if structural_exposure is None and template_info is None:
                try:
                    af_result = await predict_structure(peptide, hla_allele, pdb_output)
                    if af_result:
                        structural_exposure = calculate_sasa(af_result, peptide)
                        method = "alphafold"
                        logger.info(
                            "AlphaFold prediction for %s %s: exposure=%.3f",
                            gene, mutation,
                            structural_exposure if structural_exposure is not None else -1,
                        )
                except Exception as e:
                    logger.warning(
                        "AlphaFold prediction failed for %s %s: %s", gene, mutation, e
                    )

            # Upload PDB if we have one
            if pdb_output.exists():
                pdb_s3_key = results_path(config.job_id, f"structures/{safe_name}.pdb")
                s3.upload_file(pdb_output, pdb_s3_key)
                pdb_s3_path = pdb_s3_key

            results.append(StructureResult(
                gene=gene,
                mutation=mutation,
                mutant_peptide=peptide,
                hla_allele=hla_allele,
                structural_exposure=structural_exposure,
                pdb_path=pdb_s3_path,
                method=method,
            ))

        # --- Build and upload report ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=90.0,
            message="Building structure report",
        ))

        structure_report = build_structure_report(config.job_id, results, neoantigens)

        report_file = output_dir / "structure_report.json"
        report_file.write_text(json.dumps(structure_report, indent=2))

        report_s3_key = results_path(config.job_id, "structure_report.json")
        s3.upload_file(report_file, report_s3_key)

        # --- Publish completion ---
        top_20 = structure_report["neoantigens"][:20]

        await nats.publish_step_complete(StepCompleteEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            output_path=report_s3_key,
            metadata={
                "structureReportPath": report_s3_key,
                "totalStructures": structure_report["totalStructures"],
                "successfulPredictions": structure_report["successfulPredictions"],
                "topNeoantigens": top_20,
            },
        ))

        logger.info("structure_prediction step finished")

    except Exception as e:
        logger.error("structure_prediction failed: %s", e, exc_info=True)
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
