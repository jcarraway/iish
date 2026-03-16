"""Neoantigen Predictor service entry point.

Downloads HLA genotype and peptide windows from S3, runs MHC binding predictions,
scores immunogenicity, ranks candidates, and uploads a neoantigen report.

Pipeline flow:
1. Download hla_genotype.json and peptide_windows.json from S3
2. Run Class I + Class II binding predictions (MHCflurry)
3. Score immunogenicity (BLOSUM62 dissimilarity + hydrophobicity)
4. Estimate clonality from VAF
5. Optionally filter by gene expression
6. Compute composite scores + rank
7. Quality gates
8. Upload neoantigen_report.json to S3
9. Publish PIPELINE.step.neoantigen_prediction.complete
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
from .binding import predict_class_i, predict_class_ii, BindingResult
from .immunogenicity import score_immunogenicity
from .clonality import score_clonality
from .expression import load_expression_data, get_expression_score
from .scoring import NeoantigenScore, score_and_rank
from .quality import check_quality_gates, QualityGateError

STEP_NAME = "neoantigen_prediction"
WORK_DIR = Path("/scratch")

logging.basicConfig(
    level=logging.INFO,
    format='{"level":"%(levelname)s","target":"%(name)s","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)


def _parse_hla_alleles(hla_data: dict) -> tuple:
    """Extract Class I and Class II allele lists from HLA genotype JSON."""
    class_i_alleles = []
    class_i = hla_data.get("class_i", {})
    for locus in ["hla_a", "hla_b", "hla_c"]:
        class_i_alleles.extend(class_i.get(locus, []))

    class_ii_alleles = []
    class_ii = hla_data.get("class_ii", {})
    for locus in ["hla_drb1", "hla_dqb1", "hla_dpb1"]:
        class_ii_alleles.extend(class_ii.get(locus, []))

    # Deduplicate while preserving order
    class_i_alleles = list(dict.fromkeys(class_i_alleles))
    class_ii_alleles = list(dict.fromkeys(class_ii_alleles))

    return class_i_alleles, class_ii_alleles


def _build_candidates(
    peptide_windows: List[dict],
    class_i_results: List[BindingResult],
    class_ii_results: List[BindingResult],
    expression_data: Optional[Dict[str, float]],
) -> List[NeoantigenScore]:
    """Merge binding results with peptide metadata into scored candidates."""
    # Index peptide metadata by mutant peptide sequence
    peptide_meta = {}
    for pw in peptide_windows:
        peptide_meta[pw["mutant_peptide"]] = pw

    candidates = []

    for br in class_i_results + class_ii_results:
        meta = peptide_meta.get(br.peptide, {})

        wt_peptide = meta.get("wildtype_peptide", "")
        immunogenicity = score_immunogenicity(wt_peptide, br.peptide)
        vaf = meta.get("vaf", 0.0)
        clonality = score_clonality(vaf)
        gene = meta.get("gene", "unknown")
        expression = get_expression_score(gene, expression_data)

        # Compute wildtype binding for agretopicity (use Class I results lookup)
        wt_binding_nm = meta.get("wildtype_binding_nm")

        candidates.append(NeoantigenScore(
            gene=gene,
            mutation=meta.get("mutation", "unknown"),
            chromosome=meta.get("chromosome", "unknown"),
            position=meta.get("position", 0),
            variant_type=meta.get("variant_type", "SNV"),
            vaf=vaf,
            wildtype_peptide=wt_peptide,
            mutant_peptide=br.peptide,
            peptide_length=len(br.peptide),
            hla_allele=br.allele,
            binding_affinity_nm=br.affinity_nm,
            binding_rank_percentile=br.rank_percentile,
            wildtype_binding_nm=wt_binding_nm,
            binding_class=br.binding_class,
            agretopicity=0.0,  # computed in score_and_rank
            immunogenicity_score=immunogenicity,
            expression_level=expression,
            clonality=clonality,
            structural_exposure=None,  # future: from structure_prediction step
        ))

    return candidates


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
            message="Downloading HLA genotype and peptide windows",
        ))

        hla_key = intermediate_path(config.job_id, "hla_genotype.json")
        hla_local = input_dir / "hla_genotype.json"
        s3.download_file(hla_key, hla_local)

        peptide_key = intermediate_path(config.job_id, "peptide_windows.json")
        peptide_local = input_dir / "peptide_windows.json"
        s3.download_file(peptide_key, peptide_local)

        # --- Parse inputs ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=10.0,
            message="Parsing HLA and peptide data",
        ))

        with open(hla_local) as f:
            hla_data = json.load(f)

        with open(peptide_local) as f:
            peptide_data = json.load(f)

        class_i_alleles, class_ii_alleles = _parse_hla_alleles(hla_data)
        peptide_windows = peptide_data.get("peptide_windows", [])

        logger.info(
            "Loaded %d Class I alleles, %d Class II alleles, %d peptide windows",
            len(class_i_alleles),
            len(class_ii_alleles),
            len(peptide_windows),
        )

        # Separate MHC-I and MHC-II peptides by length
        mhc_i_peptides = [pw["mutant_peptide"] for pw in peptide_windows if pw.get("peptide_length", 0) <= 11]
        mhc_ii_peptides = [pw["mutant_peptide"] for pw in peptide_windows if pw.get("peptide_length", 0) > 11]

        # --- Class I binding predictions ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=20.0,
            message=f"Running Class I binding predictions ({len(mhc_i_peptides)} peptides x {len(class_i_alleles)} alleles)",
        ))

        class_i_results = predict_class_i(mhc_i_peptides, class_i_alleles)

        # --- Class II binding predictions ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=50.0,
            message=f"Running Class II binding predictions ({len(mhc_ii_peptides)} peptides)",
        ))

        class_ii_results = predict_class_ii(mhc_ii_peptides, class_ii_alleles)

        # --- Load expression data (optional) ---
        expression_data = None
        if config.rna_data_path:
            try:
                expr_key = intermediate_path(config.job_id, "gene_expression.json")
                expr_local = input_dir / "gene_expression.json"
                s3.download_file(expr_key, expr_local)
                expression_data = load_expression_data(expr_local)
            except Exception as e:
                logger.warning("Could not load expression data: %s (continuing without)", e)

        # --- Build and score candidates ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=70.0,
            message="Scoring and ranking neoantigens",
        ))

        candidates = _build_candidates(
            peptide_windows,
            class_i_results,
            class_ii_results,
            expression_data,
        )

        ranked = score_and_rank(candidates)

        # --- Quality gates ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=85.0,
            message="Running quality checks",
        ))

        check_quality_gates(ranked)

        # --- Write and upload report ---
        await nats.publish_progress(ProgressEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            percent_complete=90.0,
            message="Uploading neoantigen report",
        ))

        report = {
            "jobId": config.job_id,
            "totalPredictions": len(ranked),
            "strongBinders": sum(1 for c in ranked if c.binding_class == "strong_binder"),
            "weakBinders": sum(1 for c in ranked if c.binding_class == "weak_binder"),
            "highConfidence": sum(1 for c in ranked if c.confidence == "high"),
            "mediumConfidence": sum(1 for c in ranked if c.confidence == "medium"),
            "lowConfidence": sum(1 for c in ranked if c.confidence == "low"),
            "classIAlleles": class_i_alleles,
            "classIIAlleles": class_ii_alleles,
            "neoantigens": [_candidate_to_dict(c) for c in ranked],
        }

        output_file = output_dir / "neoantigen_report.json"
        output_file.write_text(json.dumps(report, indent=2))

        report_s3_key = results_path(config.job_id, "neoantigen_report.json")
        s3.upload_file(output_file, report_s3_key)

        # --- Publish completion ---
        top_20 = [_candidate_to_dict(c) for c in ranked[:20]]

        await nats.publish_step_complete(StepCompleteEvent(
            job_id=config.job_id,
            step=STEP_NAME,
            output_path=report_s3_key,
            metadata={
                "neoantigenCount": len(ranked),
                "neoantigenReportPath": report_s3_key,
                "topNeoantigens": top_20,
            },
        ))

        logger.info("neoantigen_prediction step finished")

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
        logger.error("neoantigen_prediction failed: %s", e, exc_info=True)
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
