mod annotate;
mod consensus;
mod mutect;
mod quality;
mod strelka;

use std::collections::HashMap;
use std::path::PathBuf;

use pipeline_common::config::PipelineConfig;
use pipeline_common::error::PipelineError;
use pipeline_common::events::{ProgressEvent, StepCompleteEvent, StepFailedEvent};
use pipeline_common::paths;
use pipeline_common::s3;
use tracing::info;

const WORK_DIR: &str = "/scratch";

#[tokio::main]
async fn main() {
    pipeline_common::logging::init();

    let exit_code = match run().await {
        Ok(()) => {
            info!("variant calling step completed successfully");
            0
        }
        Err(e) => {
            tracing::error!(error = %e, retryable = e.is_retryable(), "variant calling step failed");

            if let Ok(config) = PipelineConfig::from_env() {
                if let Ok(js) = pipeline_common::nats::connect(&config.nats_url).await {
                    let _ = pipeline_common::nats::publish_step_failed(
                        &js,
                        &StepFailedEvent {
                            job_id: config.job_id,
                            step: "variant_calling".to_string(),
                            error: e.to_string(),
                            retryable: e.is_retryable(),
                        },
                    )
                    .await;
                }
            }

            e.exit_code()
        }
    };

    std::process::exit(exit_code);
}

async fn run() -> Result<(), PipelineError> {
    let config = PipelineConfig::from_env()?;
    let s3_client = s3::create_client().await;
    let js = pipeline_common::nats::connect(&config.nats_url).await?;

    let work_dir = PathBuf::from(WORK_DIR);
    let input_dir = work_dir.join("input");
    let ref_dir = work_dir.join("reference");
    let output_dir = work_dir.join("output");
    let vep_cache_dir = work_dir.join("vep_cache");

    for dir in [&input_dir, &ref_dir, &output_dir, &vep_cache_dir] {
        tokio::fs::create_dir_all(dir)
            .await
            .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;
    }

    // --- Download aligned BAMs from previous step ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            percent_complete: 5.0,
            message: "Downloading aligned BAMs".to_string(),
        },
    )
    .await?;

    let tumor_bam = input_dir.join("aligned_tumor.bam");
    let tumor_bai = input_dir.join("aligned_tumor.bam.bai");
    let normal_bam = input_dir.join("aligned_normal.bam");
    let normal_bai = input_dir.join("aligned_normal.bam.bai");

    let tumor_bam_key = paths::intermediate_path(&config.job_id, "aligned_tumor.bam");
    let tumor_bai_key = paths::intermediate_path(&config.job_id, "aligned_tumor.bam.bai");
    let normal_bam_key = paths::intermediate_path(&config.job_id, "aligned_normal.bam");
    let normal_bai_key = paths::intermediate_path(&config.job_id, "aligned_normal.bam.bai");

    s3::download_file(&s3_client, &config.s3_bucket, &tumor_bam_key, &tumor_bam).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &tumor_bai_key, &tumor_bai).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &normal_bam_key, &normal_bam).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &normal_bai_key, &normal_bai).await?;

    // Download reference genome
    let ref_fasta = ref_dir.join("genome.fa");
    let ref_s3_key = paths::reference_path(&config.reference_genome, "genome.fa");
    s3::download_file(&s3_client, &config.s3_bucket, &ref_s3_key, &ref_fasta).await?;

    // Download reference index
    for ext in &[".fa.fai", ".dict"] {
        let filename = format!("genome{ext}");
        let key = paths::reference_path(&config.reference_genome, &filename);
        let local = ref_dir.join(&filename);
        s3::download_file(&s3_client, &config.s3_bucket, &key, &local).await?;
    }

    // --- Run Strelka2 ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            percent_complete: 20.0,
            message: "Running Strelka2 somatic caller".to_string(),
        },
    )
    .await?;

    let strelka_dir = work_dir.join("strelka");
    tokio::fs::create_dir_all(&strelka_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    let strelka_output =
        strelka::run_strelka(&tumor_bam, &normal_bam, &ref_fasta, &strelka_dir, config.threads)
            .await?;

    // --- Run Mutect2 ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            percent_complete: 45.0,
            message: "Running GATK Mutect2".to_string(),
        },
    )
    .await?;

    let mutect_dir = work_dir.join("mutect");
    tokio::fs::create_dir_all(&mutect_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    let mutect_output =
        mutect::run_mutect(&tumor_bam, &normal_bam, &ref_fasta, &mutect_dir).await?;

    // --- Build consensus ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            percent_complete: 65.0,
            message: "Building consensus VCF".to_string(),
        },
    )
    .await?;

    let consensus_dir = work_dir.join("consensus");
    tokio::fs::create_dir_all(&consensus_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    let consensus_vcf = consensus::build_consensus(
        &strelka_output.snvs_vcf,
        &strelka_output.indels_vcf,
        &mutect_output.filtered_vcf,
        &consensus_dir,
    )
    .await?;

    // --- VEP annotation ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            percent_complete: 75.0,
            message: "Running VEP annotation".to_string(),
        },
    )
    .await?;

    let annotated_vcf = output_dir.join("annotated_variants.vcf");
    annotate::annotate_variants(
        &consensus_vcf,
        &annotated_vcf,
        &ref_fasta,
        &vep_cache_dir,
        &s3_client,
        &config.s3_bucket,
        &config.reference_genome,
    )
    .await?;

    // --- Compute stats ---
    let vcf_content = tokio::fs::read_to_string(&annotated_vcf)
        .await
        .map_err(|e| PipelineError::Other(format!("read annotated VCF: {e}")))?;

    let stats = quality::parse_vcf_stats(&vcf_content)?;

    // --- Upload results ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            percent_complete: 90.0,
            message: "Uploading results".to_string(),
        },
    )
    .await?;

    let vcf_key = paths::intermediate_path(&config.job_id, "somatic_variants.vcf");
    let annotated_key = paths::intermediate_path(&config.job_id, "annotated_variants.vcf");

    s3::upload_file(&s3_client, &config.s3_bucket, &vcf_key, &consensus_vcf).await?;
    s3::upload_file(&s3_client, &config.s3_bucket, &annotated_key, &annotated_vcf).await?;

    // --- Publish completion ---
    let mut metadata = HashMap::new();
    metadata.insert(
        "vcfPath".to_string(),
        serde_json::Value::String(vcf_key.clone()),
    );
    metadata.insert(
        "annotatedVcfPath".to_string(),
        serde_json::Value::String(annotated_key.clone()),
    );
    metadata.insert(
        "variantCount".to_string(),
        serde_json::Value::Number(serde_json::Number::from(stats.total_variants)),
    );
    metadata.insert(
        "tmb".to_string(),
        serde_json::json!(stats.tmb),
    );

    pipeline_common::nats::publish_step_complete(
        &js,
        &StepCompleteEvent {
            job_id: config.job_id.clone(),
            step: "variant_calling".to_string(),
            output_path: Some(annotated_key),
            metadata: Some(metadata),
        },
    )
    .await?;

    info!("variant calling step finished");
    Ok(())
}
