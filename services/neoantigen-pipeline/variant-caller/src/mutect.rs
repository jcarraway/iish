use std::path::{Path, PathBuf};
use tracing::info;

use pipeline_common::error::PipelineError;
use pipeline_common::process::run_command;

/// Mutect2 output files.
pub struct MutectOutput {
    pub filtered_vcf: PathBuf,
}

/// Run GATK Mutect2 + FilterMutectCalls.
pub async fn run_mutect(
    tumor_bam: &Path,
    normal_bam: &Path,
    reference: &Path,
    work_dir: &Path,
) -> Result<MutectOutput, PipelineError> {
    let raw_vcf = work_dir.join("mutect2_raw.vcf.gz");
    let f1r2_tar = work_dir.join("f1r2.tar.gz");
    let filtered_vcf = work_dir.join("mutect2_filtered.vcf.gz");

    info!("running GATK Mutect2");

    run_command(
        "gatk",
        &[
            "Mutect2",
            "-R",
            reference.to_str().unwrap(),
            "-I",
            tumor_bam.to_str().unwrap(),
            "-I",
            normal_bam.to_str().unwrap(),
            "-normal",
            "normal",
            "--f1r2-tar-gz",
            f1r2_tar.to_str().unwrap(),
            "-O",
            raw_vcf.to_str().unwrap(),
        ],
    )
    .await?;

    info!("running GATK FilterMutectCalls");

    run_command(
        "gatk",
        &[
            "FilterMutectCalls",
            "-R",
            reference.to_str().unwrap(),
            "-V",
            raw_vcf.to_str().unwrap(),
            "-O",
            filtered_vcf.to_str().unwrap(),
        ],
    )
    .await?;

    if !filtered_vcf.exists() {
        return Err(PipelineError::ToolCrash {
            code: 1,
            message: "Mutect2 filtered output not found".to_string(),
        });
    }

    info!("Mutect2 pipeline complete");
    Ok(MutectOutput { filtered_vcf })
}
