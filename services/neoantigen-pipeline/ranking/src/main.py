"""Ranking service entry point.

Lightweight re-ranker that patches real structural_exposure values from
structure prediction into the full candidate list and re-scores.

Pipeline flow:
1. Download neoantigen_report.json + structure_report.json from S3
2. Patch structural_exposure values from structure_report into neoantigens
3. Re-run score_and_rank() with real structural exposure
4. Upload ranked_neoantigens.json to S3
5. Publish PIPELINE.step.ranking.complete
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
from .pipeline_common.paths import results_path
from .scoring import NeoantigenScore, score_and_rank

STEP_NAME = "ranking"
WORK_DIR = Path("/scratch")

logging.basicConfig(
    level=logging.INFO,
    format='{"level":"%(levelname)s","target":"%(name)s","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)


def _neoantigen_from_dict(d: Dict[str, Any]) -> NeoantigenScore:
    """Convert a neoantigen dict (camelCase) back to NeoantigenScore."""
    return NeoantigenScore(
        gene=d.get("gene", "unknown"),
        mutation=d.get("mutation", "unknown"),
        chromosome=d.get("chromosome", "unknown"),
        position=d.get("position", 0),
        variant_type=d.get("variantType", "SNV"),
        vaf=d.get("vaf", 0.0),
        wildtype_peptide=d.get("wildtypePeptide", ""),
        mutant_peptide=d.get("mutantPeptide", ""),
        peptide_length=d.get("peptideLength", 0),
        hla_allele=d.get("hlaAllele", ""),
        binding_affinity_nm=d.get("bindingAffinityNm", 50000.0),
        binding_rank_percentile=d.get("bindingRankPercentile", 100.0),
        wildtype_binding_nm=d.get("wildtypeBindingNm"),
        binding_class=d.get("bindingClass", "non_binder"),
        agretopicity=d.get("agretopicity", 0.0),
        immunogenicity_score=d.get("immunogenicityScore", 0.0),
        expression_level=d.get("expressionLevel"),
        clonality=d.get("clonality", 0.0),
        structural_exposure=d.get("structuralExposure"),
    )


def _candidate_to_dict(c: NeoantigenScore) -> Dict[str, Any]:
    """Convert a NeoantigenScore to a JSON-serializable dict."""
    return {
        "gene": c.gene,
        "mutation": c.mutation,
        "chromosome": c.chromosome,
        "position": c.position,
        "variantType": c.variant_type,
        "vaf": c.vaf,
        "wildtypePeptide": c.wildtype_peptide,
        "mutantPeptide": c.mutant_peptide,
        "peptideLength": c.peptide_length,
        "hlaAllele": c.hla_allele,
        "bindingAffinityNm": c.binding_affinity_nm,
        "bindingRankPercentile": c.binding_rank_percentile,
        "wildtypeBindingNm": c.wildtype_binding_nm,
        "bindingClass": c.binding_class,
        "agretopicity": c.agretopicity,
        "immunogenicityScore": c.immunogenicity_score,
        "expressionLevel": c.expression_level,
        "clonality": c.clonality,
        "structuralExposure": c.structural_exposure,
        "compositeScore": c.composite_score,
        "rank": c.rank,
        "confidence": c.confidence,
    }


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
            message="Downloading neoantigen and structure reports",
        ))

        report_key = results_path(config.job_id, "neoantigen_report.json")
        report_local = input_dir / "neoantigen_report.json"
        s3.download_file(report_key, report_local)

        structure_key = results_path(config.job_id, "structure_report.json")
        structure_local = input_dir / "structure_report.json"
        s3.download_file(structure_key, structure_local)

        # --- Parse inputs ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=15.0,
            message="Parsing reports and patching structural exposure",
        ))

        with open(report_local) as f:
            report_data = json.load(f)

        with open(structure_local) as f:
            structure_data = json.load(f)

        neoantigens = report_data.get("neoantigens", [])
        logger.info("Loaded %d neoantigens from report", len(neoantigens))

        # Build exposure lookup from structure report
        exposure_lookup: Dict[tuple, Dict[str, Any]] = {}
        for s in structure_data.get("structures", []):
            key = (s.get("gene"), s.get("mutation"), s.get("mutantPeptide"))
            exposure_lookup[key] = s

        # Patch structural_exposure values
        patched_count = 0
        for neo in neoantigens:
            key = (neo.get("gene"), neo.get("mutation"), neo.get("mutantPeptide"))
            if key in exposure_lookup:
                struct_info = exposure_lookup[key]
                if struct_info.get("structuralExposure") is not None:
                    neo["structuralExposure"] = struct_info["structuralExposure"]
                    patched_count += 1

        logger.info("Patched structural_exposure for %d neoantigens", patched_count)

        # --- Re-score and re-rank ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=50.0,
            message="Re-scoring with structural exposure data",
        ))

        candidates = [_neoantigen_from_dict(n) for n in neoantigens]
        ranked = score_and_rank(candidates)

        # --- Write and upload report ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=85.0,
            message="Uploading ranked neoantigens",
        ))

        ranked_report = {
            "jobId": config.job_id,
            "totalCandidates": len(ranked),
            "patchedWithStructure": patched_count,
            "highConfidence": sum(1 for c in ranked if c.confidence == "high"),
            "mediumConfidence": sum(1 for c in ranked if c.confidence == "medium"),
            "lowConfidence": sum(1 for c in ranked if c.confidence == "low"),
            "neoantigens": [_candidate_to_dict(c) for c in ranked],
        }

        output_file = output_dir / "ranked_neoantigens.json"
        output_file.write_text(json.dumps(ranked_report, indent=2))

        report_s3_key = results_path(config.job_id, "ranked_neoantigens.json")
        s3.upload_file(output_file, report_s3_key)

        # --- Publish completion ---
        top_20 = [_candidate_to_dict(c) for c in ranked[:20]]

        await nats.publish_step_complete(StepCompleteEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            output_path=report_s3_key,
            metadata={
                "rankedReportPath": report_s3_key,
                "totalCandidates": len(ranked),
                "patchedWithStructure": patched_count,
                "topNeoantigens": top_20,
            },
        ))

        logger.info("ranking step finished")

    except Exception as e:
        logger.error("ranking failed: %s", e, exc_info=True)
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
