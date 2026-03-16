use std::path::{Path, PathBuf};
use tracing::info;

use pipeline_common::error::PipelineError;
use pipeline_common::process::run_command;
use pipeline_common::s3;

/// Run Ensembl VEP annotation on a VCF.
///
/// Downloads VEP cache from S3 if not already present, then runs:
/// `vep --cache --offline --assembly GRCh38 --vcf --symbol --terms SO
///      --af_gnomad --plugin Frameshift,Wildtype --pick`
pub async fn annotate_variants(
    input_vcf: &Path,
    output_vcf: &Path,
    reference: &Path,
    vep_cache_dir: &Path,
    s3_client: &aws_sdk_s3::Client,
    bucket: &str,
    genome: &str,
) -> Result<PathBuf, PipelineError> {
    // Download VEP cache from S3 if needed
    if !vep_cache_dir.join("homo_sapiens").exists() {
        info!("downloading VEP cache from S3");
        let cache_tar = vep_cache_dir.join("vep_cache.tar.gz");
        let cache_key = pipeline_common::paths::reference_path(genome, "vep_cache.tar.gz");

        s3::download_file(s3_client, bucket, &cache_key, &cache_tar).await?;

        // Extract cache
        run_command(
            "tar",
            &[
                "xzf",
                cache_tar.to_str().unwrap(),
                "-C",
                vep_cache_dir.to_str().unwrap(),
            ],
        )
        .await?;

        info!("VEP cache extracted");
    }

    info!("running VEP annotation");

    let output_path = output_vcf.to_path_buf();

    run_command(
        "vep",
        &[
            "--input_file",
            input_vcf.to_str().unwrap(),
            "--output_file",
            output_vcf.to_str().unwrap(),
            "--cache",
            "--offline",
            "--dir_cache",
            vep_cache_dir.to_str().unwrap(),
            "--assembly",
            "GRCh38",
            "--fasta",
            reference.to_str().unwrap(),
            "--vcf",
            "--symbol",
            "--terms",
            "SO",
            "--af_gnomad",
            "--plugin",
            "Frameshift,Wildtype",
            "--pick",
            "--force_overwrite",
        ],
    )
    .await?;

    if !output_path.exists() {
        return Err(PipelineError::ToolCrash {
            code: 1,
            message: "VEP output not found".to_string(),
        });
    }

    info!("VEP annotation complete");
    Ok(output_path)
}
