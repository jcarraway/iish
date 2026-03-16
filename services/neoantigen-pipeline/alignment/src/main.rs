mod aligner;
mod postprocess;
mod quality;

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
            info!("alignment step completed successfully");
            0
        }
        Err(e) => {
            tracing::error!(error = %e, retryable = e.is_retryable(), "alignment step failed");

            // Best-effort failure notification
            if let Ok(config) = PipelineConfig::from_env() {
                if let Ok(js) = pipeline_common::nats::connect(&config.nats_url).await {
                    let _ = pipeline_common::nats::publish_step_failed(
                        &js,
                        &StepFailedEvent {
                            job_id: config.job_id,
                            step: "alignment".to_string(),
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
    let ref_dir = work_dir.join("reference");
    let input_dir = work_dir.join("input");
    let output_dir = work_dir.join("output");

    tokio::fs::create_dir_all(&ref_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;
    tokio::fs::create_dir_all(&input_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;
    tokio::fs::create_dir_all(&output_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    // --- Download reference genome ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 5.0,
            message: "Downloading reference genome".to_string(),
        },
    )
    .await?;

    let ref_fasta = ref_dir.join("genome.fa");
    let ref_s3_key = paths::reference_path(&config.reference_genome, "genome.fa");
    s3::download_file(&s3_client, &config.s3_bucket, &ref_s3_key, &ref_fasta).await?;

    // Download reference index files
    for ext in &[".fa.fai", ".fa.bwt.2bit.64", ".fa.ann", ".fa.amb", ".fa.pac", ".fa.0123"] {
        let filename = format!("genome{ext}");
        let key = paths::reference_path(&config.reference_genome, &filename);
        let local = ref_dir.join(&filename);
        s3::download_file(&s3_client, &config.s3_bucket, &key, &local).await?;
    }

    // --- Download input FASTQs ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 15.0,
            message: "Downloading input files".to_string(),
        },
    )
    .await?;

    let tumor_r1 = input_dir.join("tumor_R1.fastq.gz");
    let tumor_r2 = input_dir.join("tumor_R2.fastq.gz");
    let normal_r1 = input_dir.join("normal_R1.fastq.gz");
    let normal_r2 = input_dir.join("normal_R2.fastq.gz");

    // Tumor data path points to directory containing R1/R2
    let tumor_r1_key = format!("{}/R1.fastq.gz", config.tumor_data_path);
    let tumor_r2_key = format!("{}/R2.fastq.gz", config.tumor_data_path);
    let normal_r1_key = format!("{}/R1.fastq.gz", config.normal_data_path);
    let normal_r2_key = format!("{}/R2.fastq.gz", config.normal_data_path);

    s3::download_file(&s3_client, &config.s3_bucket, &tumor_r1_key, &tumor_r1).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &tumor_r2_key, &tumor_r2).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &normal_r1_key, &normal_r1).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &normal_r2_key, &normal_r2).await?;

    // --- Align tumor ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 25.0,
            message: "Aligning tumor sample".to_string(),
        },
    )
    .await?;

    let tumor_sorted = output_dir.join("tumor_sorted.bam");
    aligner::align_sample(
        &ref_fasta,
        &tumor_r1,
        &tumor_r2,
        &tumor_sorted,
        "tumor",
        config.threads,
    )
    .await?;

    // --- Align normal ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 50.0,
            message: "Aligning normal sample".to_string(),
        },
    )
    .await?;

    let normal_sorted = output_dir.join("normal_sorted.bam");
    aligner::align_sample(
        &ref_fasta,
        &normal_r1,
        &normal_r2,
        &normal_sorted,
        "normal",
        config.threads,
    )
    .await?;

    // --- Postprocess tumor ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 65.0,
            message: "Postprocessing tumor BAM".to_string(),
        },
    )
    .await?;

    let tumor_final = output_dir.join("aligned_tumor.bam");
    let tumor_stats =
        postprocess::postprocess_bam(&tumor_sorted, &tumor_final, "tumor").await?;

    // --- Postprocess normal ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 75.0,
            message: "Postprocessing normal BAM".to_string(),
        },
    )
    .await?;

    let normal_final = output_dir.join("aligned_normal.bam");
    let normal_stats =
        postprocess::postprocess_bam(&normal_sorted, &normal_final, "normal").await?;

    // --- Quality gates ---
    quality::check_quality_gates(&tumor_stats, &normal_stats)?;

    // --- Upload results to S3 ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            percent_complete: 85.0,
            message: "Uploading aligned BAMs".to_string(),
        },
    )
    .await?;

    let tumor_bam_key = paths::intermediate_path(&config.job_id, "aligned_tumor.bam");
    let tumor_bai_key = paths::intermediate_path(&config.job_id, "aligned_tumor.bam.bai");
    let normal_bam_key = paths::intermediate_path(&config.job_id, "aligned_normal.bam");
    let normal_bai_key = paths::intermediate_path(&config.job_id, "aligned_normal.bam.bai");

    s3::upload_file(&s3_client, &config.s3_bucket, &tumor_bam_key, &tumor_final).await?;
    s3::upload_file(
        &s3_client,
        &config.s3_bucket,
        &tumor_bai_key,
        &output_dir.join("aligned_tumor.bam.bai"),
    )
    .await?;
    s3::upload_file(&s3_client, &config.s3_bucket, &normal_bam_key, &normal_final).await?;
    s3::upload_file(
        &s3_client,
        &config.s3_bucket,
        &normal_bai_key,
        &output_dir.join("aligned_normal.bam.bai"),
    )
    .await?;

    // --- Publish completion ---
    let mut metadata = HashMap::new();
    metadata.insert(
        "alignedBamPath".to_string(),
        serde_json::Value::String(tumor_bam_key.clone()),
    );
    metadata.insert(
        "normalBamPath".to_string(),
        serde_json::Value::String(normal_bam_key.clone()),
    );
    metadata.insert(
        "tumorStats".to_string(),
        serde_json::to_value(&tumor_stats).unwrap(),
    );
    metadata.insert(
        "normalStats".to_string(),
        serde_json::to_value(&normal_stats).unwrap(),
    );

    pipeline_common::nats::publish_step_complete(
        &js,
        &StepCompleteEvent {
            job_id: config.job_id.clone(),
            step: "alignment".to_string(),
            output_path: Some(tumor_bam_key),
            metadata: Some(metadata),
        },
    )
    .await?;

    info!("alignment step finished");
    Ok(())
}
