use std::path::{Path, PathBuf};
use tracing::info;

use pipeline_common::error::PipelineError;
use pipeline_common::process::run_command;

/// Strelka2 somatic workflow output files.
pub struct StrelkaOutput {
    pub snvs_vcf: PathBuf,
    pub indels_vcf: PathBuf,
}

/// Run Strelka2 somatic variant calling.
///
/// 1. configureStrelkaSomaticWorkflow.py
/// 2. runWorkflow.py -m local -j {threads}
pub async fn run_strelka(
    tumor_bam: &Path,
    normal_bam: &Path,
    reference: &Path,
    work_dir: &Path,
    threads: usize,
) -> Result<StrelkaOutput, PipelineError> {
    let run_dir = work_dir.join("strelka_run");
    let run_dir_str = run_dir.to_str().unwrap();

    info!("configuring Strelka2 somatic workflow");

    run_command(
        "configureStrelkaSomaticWorkflow.py",
        &[
            "--tumorBam",
            tumor_bam.to_str().unwrap(),
            "--normalBam",
            normal_bam.to_str().unwrap(),
            "--referenceFasta",
            reference.to_str().unwrap(),
            "--runDir",
            run_dir_str,
        ],
    )
    .await?;

    info!(threads, "running Strelka2 workflow");

    let threads_str = threads.to_string();
    let workflow_script = run_dir.join("runWorkflow.py");

    run_command(
        workflow_script.to_str().unwrap(),
        &["-m", "local", "-j", &threads_str],
    )
    .await?;

    let results_dir = run_dir.join("results/variants");
    let snvs_vcf = results_dir.join("somatic.snvs.vcf.gz");
    let indels_vcf = results_dir.join("somatic.indels.vcf.gz");

    if !snvs_vcf.exists() {
        return Err(PipelineError::ToolCrash {
            code: 1,
            message: "Strelka2 SNVs output not found".to_string(),
        });
    }

    info!("Strelka2 complete");
    Ok(StrelkaOutput {
        snvs_vcf,
        indels_vcf,
    })
}
