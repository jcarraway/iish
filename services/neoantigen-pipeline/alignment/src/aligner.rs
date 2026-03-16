use std::path::Path;
use tracing::info;

use pipeline_common::error::PipelineError;
use pipeline_common::process::run_piped;

/// Run BWA-MEM2 alignment piped to samtools sort.
///
/// `bwa-mem2 mem -t {threads} -R "@RG\tID:{sample}\tSM:{sample}\tPL:ILLUMINA" {ref} {R1} {R2}
///   | samtools sort -@ {threads} -o {out.bam}`
pub async fn align_sample(
    reference: &Path,
    r1: &Path,
    r2: &Path,
    output_bam: &Path,
    sample_name: &str,
    threads: usize,
) -> Result<(), PipelineError> {
    let threads_str = threads.to_string();
    let read_group = format!("@RG\\tID:{sample_name}\\tSM:{sample_name}\\tPL:ILLUMINA");

    let ref_str = reference.to_str().unwrap();
    let r1_str = r1.to_str().unwrap();
    let r2_str = r2.to_str().unwrap();
    let out_str = output_bam.to_str().unwrap();

    info!(
        sample = sample_name,
        reference = ref_str,
        "starting BWA-MEM2 alignment"
    );

    let bwa_args: Vec<&str> = vec![
        "mem",
        "-t",
        &threads_str,
        "-R",
        &read_group,
        ref_str,
        r1_str,
        r2_str,
    ];

    let sort_threads = std::cmp::max(1, threads / 2);
    let sort_threads_str = sort_threads.to_string();
    let samtools_args: Vec<&str> = vec!["sort", "-@", &sort_threads_str, "-o", out_str];

    run_piped("bwa-mem2", &bwa_args, "samtools", &samtools_args).await?;

    info!(sample = sample_name, output = out_str, "alignment complete");
    Ok(())
}
