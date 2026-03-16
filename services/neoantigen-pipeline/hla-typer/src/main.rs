mod consensus;
mod hlahd;
mod optitype;
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
const STEP_NAME: &str = "hla_typing";

/// HLA region on chromosome 6 (GRCh38 coordinates).
const HLA_REGION: &str = "chr6:28477797-33448354";

#[tokio::main]
async fn main() {
    pipeline_common::logging::init();

    let exit_code = match run().await {
        Ok(()) => {
            info!("hla_typing step completed successfully");
            0
        }
        Err(e) => {
            tracing::error!(error = %e, retryable = e.is_retryable(), "hla_typing step failed");

            if let Ok(config) = PipelineConfig::from_env() {
                if let Ok(js) = pipeline_common::nats::connect(&config.nats_url).await {
                    let _ = pipeline_common::nats::publish_step_failed(
                        &js,
                        &StepFailedEvent {
                            job_id: config.job_id,
                            step: STEP_NAME.to_string(),
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
    let output_dir = work_dir.join("output");

    tokio::fs::create_dir_all(&input_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;
    tokio::fs::create_dir_all(&output_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    // --- Download normal BAM (HLA typing uses the germline/normal sample) ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            percent_complete: 5.0,
            message: "Downloading normal BAM".to_string(),
        },
    )
    .await?;

    let normal_bam = input_dir.join("aligned_normal.bam");
    let normal_bai = input_dir.join("aligned_normal.bam.bai");
    let normal_bam_key = paths::intermediate_path(&config.job_id, "aligned_normal.bam");
    let normal_bai_key = paths::intermediate_path(&config.job_id, "aligned_normal.bam.bai");

    s3::download_file(&s3_client, &config.s3_bucket, &normal_bam_key, &normal_bam).await?;
    s3::download_file(&s3_client, &config.s3_bucket, &normal_bai_key, &normal_bai).await?;

    // --- Extract HLA reads from chr6 MHC region + unmapped ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            percent_complete: 15.0,
            message: "Extracting HLA reads".to_string(),
        },
    )
    .await?;

    let hla_bam = output_dir.join("hla_reads.bam");
    extract_hla_reads(&normal_bam, &hla_bam).await?;

    // Convert to FASTQ for HLA typing tools
    let hla_r1 = output_dir.join("hla_R1.fastq.gz");
    let hla_r2 = output_dir.join("hla_R2.fastq.gz");
    bam_to_fastq(&hla_bam, &hla_r1, &hla_r2).await?;

    // --- Run OptiType (Class I) ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            percent_complete: 30.0,
            message: "Running OptiType for Class I HLA".to_string(),
        },
    )
    .await?;

    let optitype_dir = output_dir.join("optitype");
    tokio::fs::create_dir_all(&optitype_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    let optitype_result = optitype::run_optitype(&hla_r1, &hla_r2, &optitype_dir).await?;
    info!(?optitype_result, "OptiType complete");

    // --- Run HLA-HD (Class I + II) ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            percent_complete: 55.0,
            message: "Running HLA-HD for Class I + II HLA".to_string(),
        },
    )
    .await?;

    let hlahd_dir = output_dir.join("hlahd");
    tokio::fs::create_dir_all(&hlahd_dir)
        .await
        .map_err(|e| PipelineError::Other(format!("mkdir failed: {e}")))?;

    let hlahd_result = hlahd::run_hlahd(&hla_r1, &hla_r2, &hlahd_dir).await?;
    info!(?hlahd_result, "HLA-HD complete");

    // --- Build consensus genotype ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            percent_complete: 75.0,
            message: "Building consensus HLA genotype".to_string(),
        },
    )
    .await?;

    let genotype = consensus::build_consensus(&optitype_result, &hlahd_result);
    info!(?genotype, "consensus genotype built");

    // --- Quality gates ---
    quality::check_quality_gates(&genotype)?;

    // --- Upload results ---
    pipeline_common::nats::publish_progress(
        &js,
        &ProgressEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            percent_complete: 90.0,
            message: "Uploading HLA genotype".to_string(),
        },
    )
    .await?;

    let genotype_json = serde_json::to_vec_pretty(&genotype)?;
    let genotype_path = output_dir.join("hla_genotype.json");
    tokio::fs::write(&genotype_path, &genotype_json)
        .await
        .map_err(|e| PipelineError::Other(format!("write failed: {e}")))?;

    let genotype_s3_key = paths::intermediate_path(&config.job_id, "hla_genotype.json");
    s3::upload_file(&s3_client, &config.s3_bucket, &genotype_s3_key, &genotype_path).await?;

    // --- Publish completion ---
    let mut metadata = HashMap::new();
    metadata.insert(
        "hlaGenotype".to_string(),
        serde_json::to_value(&genotype)?,
    );

    pipeline_common::nats::publish_step_complete(
        &js,
        &StepCompleteEvent {
            job_id: config.job_id.clone(),
            step: STEP_NAME.to_string(),
            output_path: Some(genotype_s3_key),
            metadata: Some(metadata),
        },
    )
    .await?;

    info!("hla_typing step finished");
    Ok(())
}

/// Extract reads from the HLA region (chr6 MHC) plus unmapped reads.
async fn extract_hla_reads(
    input_bam: &std::path::Path,
    output_bam: &std::path::Path,
) -> Result<(), PipelineError> {
    // Extract HLA region reads
    let region_bam = output_bam.with_extension("region.bam");
    let result = pipeline_common::process::run_command(
        "samtools",
        &[
            "view",
            "-b",
            "-h",
            input_bam.to_str().unwrap(),
            HLA_REGION,
            "-o",
            region_bam.to_str().unwrap(),
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("samtools view failed: {}", result.stderr),
        });
    }

    // Extract unmapped reads
    let unmapped_bam = output_bam.with_extension("unmapped.bam");
    let result = pipeline_common::process::run_command(
        "samtools",
        &[
            "view",
            "-b",
            "-f",
            "4",
            input_bam.to_str().unwrap(),
            "-o",
            unmapped_bam.to_str().unwrap(),
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("samtools view unmapped failed: {}", result.stderr),
        });
    }

    // Merge region + unmapped
    let result = pipeline_common::process::run_command(
        "samtools",
        &[
            "merge",
            "-f",
            output_bam.to_str().unwrap(),
            region_bam.to_str().unwrap(),
            unmapped_bam.to_str().unwrap(),
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("samtools merge failed: {}", result.stderr),
        });
    }

    // Sort by name for FASTQ conversion
    let sorted_bam = output_bam.with_extension("namesorted.bam");
    let result = pipeline_common::process::run_command(
        "samtools",
        &[
            "sort",
            "-n",
            output_bam.to_str().unwrap(),
            "-o",
            sorted_bam.to_str().unwrap(),
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("samtools sort failed: {}", result.stderr),
        });
    }

    tokio::fs::rename(&sorted_bam, output_bam)
        .await
        .map_err(|e| PipelineError::Other(format!("rename failed: {e}")))?;

    Ok(())
}

/// Convert a name-sorted BAM to paired FASTQ files.
async fn bam_to_fastq(
    bam: &std::path::Path,
    r1: &std::path::Path,
    r2: &std::path::Path,
) -> Result<(), PipelineError> {
    let result = pipeline_common::process::run_command(
        "samtools",
        &[
            "fastq",
            "-1",
            r1.to_str().unwrap(),
            "-2",
            r2.to_str().unwrap(),
            "-0",
            "/dev/null",
            "-s",
            "/dev/null",
            "-n",
            bam.to_str().unwrap(),
        ],
    )
    .await?;

    if result.exit_code != 0 {
        return Err(PipelineError::ToolCrash {
            code: result.exit_code,
            message: format!("samtools fastq failed: {}", result.stderr),
        });
    }

    Ok(())
}
